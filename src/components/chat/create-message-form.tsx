import { useEffect, useMemo, useRef, useState, type ClipboardEvent, type DragEvent, type KeyboardEvent } from 'react';
import { AlertCircle, CornerUpLeft, FileText, Loader2, Paperclip, Send, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { createChannelMessage } from '@/http/create-channel-message';
import type { MessageItem } from '@/http/fetch-channel-messages';
import { handleAxiosError } from '@/lib/axios-error-handler';
import { cn } from '@/lib/utils';
import { socket } from '@/socket';
import { authSlice } from '@/store/auth';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { UserAvatar } from '../user-avatar';
import { useChat } from './chat-context';
import { useChannel } from '@/hooks/use-channels';
import { appendMessage, confirmMessage, removeMessage } from './messages-cache';
import { MAX_ATTACHMENTS, usePendingUploads } from './use-pending-uploads';
import { getMentionQuery, normalize, toMentionText, toMentionTokens, type MentionUser } from './mentions';

const MAX_LENGTH = 4000
/** Minimum interval between "typing" signals */
const TYPING_THROTTLE_MS = 2500
const MAX_SUGGESTIONS = 6

// Text is optional when files are attached (checked in onSubmit)
const createMessageFormSchema = z.object({
  message: z.string().trim().max(MAX_LENGTH)
})

type CreateMessageForm = z.infer<typeof createMessageFormSchema>

type CreateMessageFormProps = {
  /** Known after joining the channel room; required to emit typing signals */
  channelId: string | null
  /** Channel members, offered as @mention suggestions */
  members: MentionUser[]
  replyTo: MessageItem | null
  onCancelReply: () => void
}

export function CreateMessageForm({ channelId, members, replyTo, onCancelReply }: CreateMessageFormProps) {
  const { slug, memberNames } = useChat()
  const queryClient = useQueryClient()
  const user = authSlice(state => state.auth?.user)
  const lastTypingRef = useRef(0)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const [mention, setMention] = useState<{ query: string; start: number } | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploads, addFiles, remove, clear, ready, busy } = usePendingUploads(slug)

  const form = useForm<CreateMessageForm>({
    defaultValues: { message: '' },
    resolver: zodResolver(createMessageFormSchema)
  })

  const message = form.watch('message') || ''

  // Replying focuses the composer
  useEffect(() => {
    if (replyTo) textareaRef.current?.focus()
  }, [replyTo])

  const suggestions = useMemo(() => {
    if (!mention) return []
    const query = normalize(mention.query)
    return members
      .filter(member => member.id !== user?.id && member.name && normalize(member.name).includes(query))
      .sort((a, b) => Number(!normalize(a.name).startsWith(query)) - Number(!normalize(b.name).startsWith(query)))
      .slice(0, MAX_SUGGESTIONS)
  }, [mention, members, user?.id])

  const createChannelMessageMutation = useMutation({
    mutationFn: async ({ message, replyToId, attachments }: {
      message: string
      tempId: string
      replyToId?: string
      attachments: MessageItem['attachments']
    }) => {
      const { data } = await createChannelMessage({
        slug,
        message,
        replyToId,
        attachmentIds: attachments.map(attachment => attachment.id),
      })
      return data
    },
    // Optimistic: the message shows up instantly, dimmed, until the server confirms it
    onMutate: ({ message, tempId, attachments }) => {
      const now = new Date().toISOString()
      const optimistic: MessageItem = {
        id: tempId,
        content: message || null,
        authorId: user.id,
        channelId: channelId ?? '',
        createdAt: now,
        updatedAt: now,
        editedAt: null,
        deletedAt: null,
        author: { id: user.id, name: user.name, email: user.email },
        parentId: replyTo?.id ?? null,
        parent: replyTo
          ? {
            id: replyTo.id,
            content: replyTo.content,
            deletedAt: null,
            authorId: replyTo.authorId,
            author: replyTo.author,
            attachmentCount: replyTo.attachments?.length ?? 0,
          }
          : null,
        reactions: [],
        mentions: [],
        attachments,
        pending: true,
      }
      appendMessage(queryClient, slug, optimistic)
      form.reset({ message: '' })
      clear()
      onCancelReply()
    },
    onSuccess: (saved, { tempId }) => {
      confirmMessage(queryClient, slug, tempId, saved)
    },
    onError: (error, { message, tempId }) => {
      removeMessage(queryClient, slug, tempId)
      // Give the text back so nothing is lost (unless the user already started a new one)
      if (!form.getValues('message')) form.setValue('message', toMentionText(message, memberNames))
      toast.error(handleAxiosError(error))
    },
  })

  const canSend = (!!message.trim() || ready.length > 0) && !busy

  const onSubmit = ({ message }: CreateMessageForm) => {
    if (!canSend) {
      if (busy) toast.info('Aguarde o envio dos arquivos terminar')
      return
    }
    lastTypingRef.current = 0
    setMention(null)
    createChannelMessageMutation.mutate({
      message: toMentionTokens(message.trim(), members),
      replyToId: replyTo?.id,
      attachments: ready,
      tempId: `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    })
  };

  const emitTyping = () => {
    const now = Date.now()
    if (!channelId || now - lastTypingRef.current < TYPING_THROTTLE_MS) return
    lastTypingRef.current = now
    socket.emit('channel:typing', { channelId })
  }

  const updateMentionQuery = (text: string, caret: number) => {
    const next = getMentionQuery(text, caret)
    setMention(next)
    setActiveIndex(0)
  }

  const pickSuggestion = (picked: MentionUser) => {
    if (!mention || !picked.name) return
    const textarea = textareaRef.current
    const caret = textarea?.selectionStart ?? message.length
    const insert = `@${picked.name} `
    const next = message.slice(0, mention.start) + insert + message.slice(caret)
    form.setValue('message', next, { shouldDirty: true })
    setMention(null)

    const position = mention.start + insert.length
    requestAnimationFrame(() => {
      textarea?.focus()
      textarea?.setSelectionRange(position, position)
    })
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (suggestions.length) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        const delta = event.key === 'ArrowDown' ? 1 : -1
        setActiveIndex(index => (index + delta + suggestions.length) % suggestions.length)
        return
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault()
        pickSuggestion(suggestions[activeIndex])
        return
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        setMention(null)
        return
      }
    }

    if (event.key === 'Escape' && replyTo) {
      onCancelReply()
      return
    }

    // Enter sends, Shift+Enter breaks the line
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      form.handleSubmit(onSubmit)()
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const files = Array.from(event.clipboardData.files)
    if (files.length) {
      event.preventDefault()
      addFiles(files)
    }
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    const files = Array.from(event.dataTransfer.files)
    if (files.length) addFiles(files)
  }

  const { channel } = useChannel(slug)
  const placeholder = channel
    ? channel.type === 'DIRECT' ? `Mensagem para ${channel.peer?.name ?? 'esta conversa'}` : `Mensagem para #${channel.title}`
    : 'Escreva uma mensagem'

  const replyName = replyTo && (replyTo.authorId === user?.id ? 'você mesmo' : replyTo.author?.name)

  return (
    <div
      className="relative shrink-0 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:px-6 lg:pb-4"
      onDragOver={(event) => {
        if (!event.dataTransfer.types.includes('Files')) return
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false)
      }}
      onDrop={handleDrop}
    >
      <div className={cn(
        'relative mx-auto max-w-5xl rounded-xl border bg-background transition-[border-color,box-shadow] duration-150',
        'shadow-[0_1px_2px_rgb(0_0_0/0.04)] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20',
        dragging && 'border-primary ring-3 ring-primary/20',
      )}>
        {dragging && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-xl bg-background/90 text-sm font-medium text-primary">
            <Paperclip className="size-4" />
            Solte os arquivos para anexar
          </div>
        )}

        {replyTo && (
          <div className="flex items-center gap-2 border-b px-3 py-2 text-xs">
            <CornerUpLeft className="size-3.5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <span className="font-medium">Respondendo a {replyName}</span>
              <span className="text-muted-foreground"> · </span>
              <span className="truncate text-muted-foreground">
                {replyTo.content ? toMentionText(replyTo.content, memberNames) : `${replyTo.attachments?.length ?? 0} anexo(s)`}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Cancelar resposta"
              className="size-6 p-0 text-muted-foreground"
              onClick={onCancelReply}
            >
              <X className="size-4" />
            </Button>
          </div>
        )}

        {uploads.length > 0 && (
          <ul className="flex flex-wrap gap-2 px-3 pt-3" aria-label="Arquivos anexados">
            {uploads.map(item => (
              <li
                key={item.localId}
                className={cn(
                  'relative flex h-16 items-center gap-2 overflow-hidden rounded-lg border bg-muted text-xs',
                  item.previewUrl ? 'w-16' : 'w-44 px-2',
                  item.error && 'border-destructive',
                )}
                title={item.file.name}
              >
                {item.previewUrl
                  ? <img src={item.previewUrl} alt={item.file.name} className="h-full w-full object-cover" />
                  : (
                    <>
                      <FileText className="h-5 w-5 shrink-0" />
                      <span className="truncate">{item.file.name}</span>
                    </>
                  )}

                {!item.attachment && !item.error && (
                  <span className="absolute inset-x-0 bottom-0 h-1 bg-black/10">
                    <span className="block h-full bg-primary transition-[width]" style={{ width: `${Math.round(item.progress * 100)}%` }} />
                  </span>
                )}
                {!item.attachment && !item.error && item.previewUrl && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  </span>
                )}
                {item.error && (
                  <span className="absolute inset-0 flex items-center justify-center bg-destructive/20" aria-label="Falha no envio">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => remove(item.localId)}
                  aria-label={`Remover ${item.file.name}`}
                  className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="relative flex items-end gap-1 p-1.5">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,text/plain,text/csv,application/json,application/zip,.docx,.xlsx,.pptx"
            onChange={(event) => {
              addFiles(Array.from(event.target.files ?? []))
              event.target.value = ''
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Anexar arquivos"
            title={`Anexar arquivos (até ${MAX_ATTACHMENTS})`}
            disabled={uploads.length >= MAX_ATTACHMENTS}
            onClick={() => fileInputRef.current?.click()}
            className="size-10 shrink-0 text-muted-foreground hover:text-foreground"
          >
            <Paperclip className="size-4" />
          </Button>
          {suggestions.length > 0 && (
            <ul
              role="listbox"
              aria-label="Mencionar membro"
              className="absolute bottom-full left-0 z-20 mb-2 w-64 overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-[0_4px_16px_-4px_rgb(0_0_0/0.15)]"
            >
              {suggestions.map((suggestion, index) => (
                <li key={suggestion.id} role="option" aria-selected={index === activeIndex}>
                  <button
                    type="button"
                    // mousedown keeps the textarea focused (click would blur it first)
                    onMouseDown={(event) => {
                      event.preventDefault()
                      pickSuggestion(suggestion)
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm',
                      index === activeIndex && 'bg-accent text-accent-foreground',
                    )}
                  >
                    <UserAvatar name={suggestion.name} avatarUrl={suggestion.avatarUrl} className="h-5 w-5" />
                    <span className="truncate">{suggestion.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <Controller
            name='message'
            control={form.control}
            render={({ field }) => (
              <Textarea
                {...field}
                ref={(element) => {
                  field.ref(element)
                  textareaRef.current = element
                }}
                rows={1}
                maxLength={MAX_LENGTH}
                placeholder={placeholder}
                aria-label="Mensagem"
                onChange={(event) => {
                  field.onChange(event)
                  updateMentionQuery(event.target.value, event.target.selectionStart)
                  if (event.target.value) emitTyping()
                }}
                onClick={(event) => updateMentionQuery(event.currentTarget.value, event.currentTarget.selectionStart)}
                onBlur={() => {
                  field.onBlur()
                  setMention(null)
                }}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                className="field-sizing-content max-h-48 min-h-10 flex-1 resize-none border-0 bg-transparent px-1 py-2.5 shadow-none focus-visible:ring-0 dark:bg-transparent"
              />
            )}
          />

          <Button
            type="submit"
            size="icon"
            aria-label="Enviar mensagem"
            disabled={!canSend}
            className="size-10 shrink-0 rounded-lg transition-[background-color,opacity,transform] active:scale-95"
          >
            <Send className="size-4" />
          </Button>
        </form>
      </div>
      <p className="mx-auto mt-1.5 hidden max-w-5xl px-1 text-[11px] text-muted-foreground md:block">
        <kbd className="font-sans font-medium">Enter</kbd> envia · <kbd className="font-sans font-medium">Shift + Enter</kbd> quebra linha · <kbd className="font-sans font-medium">@</kbd> menciona
      </p>
    </div>
  )
}
