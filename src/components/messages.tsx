import { useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ban, CornerUpLeft, Loader2, MoreHorizontal, Paperclip, Pencil, Reply, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import type { MessageItem } from '@/http/fetch-channel-messages';
import { updateChannelMessage } from '@/http/update-channel-message';
import { deleteChannelMessage } from '@/http/delete-channel-message';
import { handleAxiosError } from '@/lib/axios-error-handler';
import { cn } from '@/lib/utils';
import { markMessageDeleted, patchMessage } from './chat/messages-cache';
import { useChat } from './chat/chat-context';
import { MessageContent } from './chat/message-content';
import { MessageAttachments } from './chat/message-attachments';
import { MessageReactions, ReactionPicker } from './chat/message-reactions';
import { useToggleReaction } from './chat/use-toggle-reaction';
import { toMentionText, toMentionTokens } from './chat/mentions';

import { Button } from './ui/button';
import { UserAvatar } from './user-avatar';
import { Textarea } from './ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface MessageProps {
  message: MessageItem
  /** First message of a run by the same author: shows the name and spacing above */
  isFirstInGroup?: boolean
  /** Last message of the run: carries the avatar */
  isLastInGroup?: boolean
}

const Message = ({ message, isFirstInGroup = true, isLastInGroup = true }: MessageProps) => {
  const queryClient = useQueryClient()
  const { slug, currentUserId, canModerate, memberNames, onReply, jumpToMessage } = useChat()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  // Touch screens have no hover: a tap on the row reveals the actions instead
  const [touchActive, setTouchActive] = useState(false)

  const isCurrentUser = message.authorId === currentUserId
  const canEdit = isCurrentUser && !!message.content
  const canDelete = isCurrentUser || canModerate
  const username = message.author?.name ?? message.author?.email
  const isDeleted = !!message.deletedAt
  const isInteractive = !isDeleted && !message.pending && !editing
  const mentionsMe = !isCurrentUser && message.mentions?.some(mention => mention.userId === currentUserId)

  // Names for mention tokens: the message's own mention data wins, members cover the rest
  const names = useMemo(() => {
    const map = new Map(memberNames)
    message.mentions?.forEach(({ user }) => map.set(user.id, user.name))
    return map
  }, [memberNames, message.mentions])

  const toggleReaction = useToggleReaction(slug, message.id)

  const updateMutation = useMutation({
    mutationFn: (content: string) => updateChannelMessage({ slug, messageId: message.id, content }),
    onMutate: (content) => {
      const previous = { content: message.content, editedAt: message.editedAt }
      patchMessage(queryClient, slug, message.id, { content, editedAt: new Date().toISOString() })
      setEditing(false)
      return previous
    },
    onSuccess: ({ data }) => patchMessage(queryClient, slug, message.id, data),
    onError: (error, _content, previous) => {
      if (previous) patchMessage(queryClient, slug, message.id, previous)
      toast.error(handleAxiosError(error))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteChannelMessage({ slug, messageId: message.id }),
    onSuccess: () => markMessageDeleted(queryClient, slug, message.id, new Date().toISOString()),
    onError: (error) => toast.error(handleAxiosError(error)),
  })

  const startEditing = () => {
    setDraft(toMentionText(message.content ?? '', names))
    setEditing(true)
  }

  const saveEdit = () => {
    const users = [...names].map(([id, name]) => ({ id, name }))
    const content = toMentionTokens(draft.trim(), users)
    if (!content || content === message.content) return setEditing(false)
    updateMutation.mutate(content)
  }

  const handleEditKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      saveEdit()
    }
    if (event.key === 'Escape') setEditing(false)
  }

  const createdAt = new Date(message.createdAt)
  const time = createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const fullDate = createdAt.toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })

  const handleRowClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!window.matchMedia('(hover: none)').matches) return
    if ((event.target as HTMLElement).closest('a, button, textarea')) return
    setTouchActive(current => !current)
  }

  const quote = message.parent && (
    <button
      type="button"
      onClick={() => jumpToMessage(message.parent.id)}
      className={cn(
        'mb-1.5 block w-full rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors',
        isCurrentUser ? 'bg-black/15 hover:bg-black/25' : 'bg-foreground/[0.06] hover:bg-foreground/10',
      )}
    >
      <span className="flex items-center gap-1 font-semibold">
        <CornerUpLeft className="size-3" />
        {message.parent.authorId === currentUserId ? 'Você' : message.parent.author?.name}
      </span>
      <span className="line-clamp-2 break-words opacity-80">
        {message.parent.deletedAt
          ? <em>Mensagem apagada</em>
          : message.parent.content
            ? toMentionText(message.parent.content, memberNames)
            : <span className="inline-flex items-center gap-1"><Paperclip className="size-3" /> {message.parent.attachmentCount} anexo(s)</span>}
      </span>
    </button>
  )

  return (
    <div
      id={`message-${message.id}`}
      onClick={handleRowClick}
      className={cn(
        'group/message -mx-2 flex items-end gap-2 rounded-lg px-2 py-px transition-colors',
        isCurrentUser ? 'flex-row-reverse' : 'flex-row',
        isFirstInGroup ? 'mt-3' : 'mt-0.5',
        mentionsMe && 'bg-mention/40',
      )}
    >
      {!isCurrentUser && (
        <div className="w-8 shrink-0">
          {isLastInGroup && (
            <UserAvatar name={username} avatarUrl={message.author?.avatarUrl} />
          )}
        </div>
      )}

      <div className={cn('flex min-w-0 max-w-[min(36rem,82%)] flex-col', isCurrentUser ? 'items-end' : 'items-start')}>
        {!isCurrentUser && isFirstInGroup && (
          <p className="mb-1 px-1 text-xs font-medium text-muted-foreground">{username}</p>
        )}
        <div className={cn(
          'relative min-w-0 max-w-full rounded-2xl px-3.5 py-2',
          isCurrentUser
            ? 'bg-bubble-own text-bubble-own-foreground'
            : 'bg-bubble-other text-bubble-other-foreground',
          isCurrentUser
            ? cn(!isFirstInGroup && 'rounded-tr-md', !isLastInGroup && 'rounded-br-md')
            : cn(!isFirstInGroup && 'rounded-tl-md', !isLastInGroup && 'rounded-bl-md'),
          isDeleted && 'bg-transparent text-muted-foreground outline outline-1 -outline-offset-1 outline-border',
          message.pending && 'opacity-60',
        )}>
          {!isDeleted && quote}

          {isDeleted ? (
            <p className="flex items-center gap-1.5 text-sm italic">
              <Ban className="size-3.5" /> Mensagem apagada
            </p>
          ) : editing ? (
            <div className="flex w-72 max-w-full flex-col gap-2 py-1">
              <Textarea
                autoFocus
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleEditKeyDown}
                maxLength={4000}
                aria-label="Editar mensagem"
                className="min-h-16 bg-background text-foreground"
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] opacity-75">Esc cancela · Enter salva</span>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>Cancelar</Button>
                  <Button size="sm" variant="outline" className="text-foreground" onClick={saveEdit} disabled={!draft.trim()}>Salvar</Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <MessageAttachments attachments={message.attachments ?? []} inverted={isCurrentUser} />
              {message.content && (
                <MessageContent
                  content={message.content}
                  names={names}
                  currentUserId={currentUserId}
                  inverted={isCurrentUser}
                />
              )}
            </>
          )}

          <p className={cn('mt-0.5 flex items-center gap-1 text-[11px] leading-4 opacity-70 tabular', isCurrentUser && 'justify-end')}>
            {message.pending && <Loader2 className="size-3 animate-spin" />}
            <time dateTime={message.createdAt} title={fullDate}>{time}</time>
            {message.editedAt && !isDeleted && <span>· editada</span>}
          </p>
        </div>

        {!isDeleted && (
          <MessageReactions
            reactions={message.reactions ?? []}
            onToggle={(emoji) => toggleReaction.mutate(emoji)}
            alignEnd={isCurrentUser}
          />
        )}
      </div>

      {isInteractive && (
        <div
          className={cn(
            'mb-1 flex shrink-0 items-center self-center rounded-lg border bg-popover p-0.5 text-popover-foreground shadow-[0_1px_2px_rgb(0_0_0/0.06),0_2px_8px_-2px_rgb(0_0_0/0.08)] transition-opacity duration-150',
            'opacity-0 pointer-events-none group-hover/message:pointer-events-auto group-hover/message:opacity-100',
            'focus-within:pointer-events-auto focus-within:opacity-100 has-[[data-state=open]]:pointer-events-auto has-[[data-state=open]]:opacity-100',
            touchActive && 'pointer-events-auto opacity-100',
          )}
        >
          <ReactionPicker onPick={(emoji) => toggleReaction.mutate(emoji)} align={isCurrentUser ? 'end' : 'start'} />
          <Button
            variant="ghost"
            size="sm"
            aria-label="Responder"
            title="Responder"
            className="size-7 p-0"
            onClick={() => onReply(message)}
          >
            <Reply className="size-4" />
          </Button>
          {(canEdit || canDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="Mais ações" title="Mais ações" className="size-7 p-0">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isCurrentUser ? 'end' : 'start'}>
                {canEdit && (
                  <DropdownMenuItem onSelect={startEditing}>
                    <Pencil className="size-4" /> Editar
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem onSelect={() => setConfirmDelete(true)} className="text-destructive focus:text-destructive">
                    <Trash2 className="size-4" /> Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir mensagem?</AlertDialogTitle>
            <AlertDialogDescription>
              {isCurrentUser
                ? 'A mensagem será removida para todos os membros do canal.'
                : `A mensagem de ${username} será removida para todos os membros do canal.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-destructive text-white hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Message;
