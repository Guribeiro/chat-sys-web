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

  const replyName = replyTo && (replyTo.authorId === user?.id ? 'você mesmo' : replyTo.author?.name)

  return (
    <div
      className={cn('relative border-t border-foreground/10 p-4', dragging && 'bg-green-50 dark:bg-green-950/30')}
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
      {dragging && (
        <div className="pointer-events-none absolute inset-2 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-green-500 text-sm font-medium text-green-700">
          Solte os arquivos para anexar
        </div>
      )}

      {replyTo && (
        <div className="mb-2 flex items-start gap-2 rounded-md border bg-muted px-3 py-2 text-xs">
          <CornerUpLeft className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Respondendo a {replyName}</p>
            <p className="truncate text-muted-foreground">
              {replyTo.content ? toMentionText(replyTo.content, memberNames) : `📎 ${replyTo.attachments?.length ?? 0} anexo(s)`}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Cancelar resposta"
            className="h-6 w-6 p-0"
            onClick={onCancelReply}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {uploads.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2" aria-label="Arquivos anexados">
          {uploads.map(item => (
            <li
              key={item.localId}
              className={cn(
                'relative flex h-16 items-center gap-2 overflow-hidden rounded-md border bg-muted text-xs',
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
                  <span className="block h-full bg-green-600 transition-[width]" style={{ width: `${Math.round(item.progress * 100)}%` }} />
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

      <form onSubmit={form.handleSubmit(onSubmit)} className="relative flex items-end gap-2">
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
          aria-label="Anexar arquivos"
          title={`Anexar arquivos (até ${MAX_ATTACHMENTS})`}
          disabled={uploads.length >= MAX_ATTACHMENTS}
          onClick={() => fileInputRef.current?.click()}
          className="px-3"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        {suggestions.length > 0 && (
          <ul
            role="listbox"
            aria-label="Mencionar membro"
            className="absolute bottom-full left-0 z-20 mb-2 w-64 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
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
              placeholder="Mensagem... (@ para mencionar, Shift+Enter quebra linha)"
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
              className="flex-1 min-h-10 max-h-40 resize-none field-sizing-content focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          )}
        />

        <Button
          type="submit"
          aria-label="Enviar mensagem"
          disabled={!canSend}
          className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-700 cursor-pointer text-white px-6"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}
