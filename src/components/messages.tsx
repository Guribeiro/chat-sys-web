import { useMemo, useState, type KeyboardEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ban, CornerUpLeft, Loader2, MoreHorizontal, Pencil, Reply, Trash2 } from 'lucide-react';
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
}

const Message = ({ message }: MessageProps) => {
  const queryClient = useQueryClient()
  const { slug, currentUserId, canModerate, memberNames, onReply, jumpToMessage } = useChat()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

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

  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const quote = message.parent && (
    <button
      type="button"
      onClick={() => jumpToMessage(message.parent.id)}
      className={cn(
        'mb-1 block w-full rounded-md px-2 py-1 text-left text-xs transition-colors',
        isCurrentUser ? 'bg-black/15 text-white/90 hover:bg-black/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
      )}
    >
      <span className="flex items-center gap-1 font-semibold">
        <CornerUpLeft className="h-3 w-3" />
        {message.parent.authorId === currentUserId ? 'Você' : message.parent.author?.name}
      </span>
      <span className="line-clamp-2 break-words">
        {message.parent.deletedAt
          ? <em>Mensagem apagada</em>
          : message.parent.content
            ? toMentionText(message.parent.content, memberNames)
            : <em>📎 {message.parent.attachmentCount} anexo(s)</em>}
      </span>
    </button>
  )

  return (
    <div
      id={`message-${message.id}`}
      className={`group flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in rounded-xl transition-colors duration-700`}
    >
      <div className={`flex max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
        {!isCurrentUser && (
          <UserAvatar
            name={username}
            avatarUrl={message.author?.avatarUrl}
            className="border-2 border-white shadow-sm"
          />
        )}

        <div className={cn('min-w-0 flex flex-col', isCurrentUser ? 'items-end' : 'items-start')}>
          <div className={cn(
            'relative px-4 py-2 rounded-2xl shadow-md min-w-0 max-w-full',
            isCurrentUser
              ? 'bg-gradient-to-r from-green-500 to-green-700 text-white'
              : 'bg-white text-gray-800 border border-gray-200',
            mentionsMe && 'ring-2 ring-amber-400',
            isDeleted && 'opacity-70',
            message.pending && 'opacity-60',
          )}>
            {!isCurrentUser && (
              <p className="text-xs font-medium text-gray-500 mb-1">{username}</p>
            )}

            {!isDeleted && quote}

            {isDeleted ? (
              <p className="text-sm italic flex items-center gap-1">
                <Ban className="w-3.5 h-3.5" /> Mensagem apagada
              </p>
            ) : editing ? (
              <div className="flex flex-col gap-2 w-64 max-w-full">
                <Textarea
                  autoFocus
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleEditKeyDown}
                  maxLength={4000}
                  className="min-h-[60px] text-gray-800 bg-white"
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>Cancelar</Button>
                  <Button size="sm" onClick={saveEdit} disabled={!draft.trim()}>Salvar</Button>
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

            <p className={`text-xs mt-1 flex items-center gap-1 ${isCurrentUser ? 'text-green-100 justify-end' : 'text-gray-400'}`}>
              {message.pending && <Loader2 className="w-3 h-3 animate-spin" />}
              {time}
              {message.editedAt && !isDeleted && <span>· editado</span>}
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
          <div className="flex items-center self-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 has-[[data-state=open]]:opacity-100">
            <ReactionPicker onPick={(emoji) => toggleReaction.mutate(emoji)} align={isCurrentUser ? 'end' : 'start'} />
            <Button
              variant="ghost"
              size="sm"
              aria-label="Responder"
              className="h-7 w-7 p-0"
              onClick={() => onReply(message)}
            >
              <Reply className="w-4 h-4" />
            </Button>
            {(canEdit || canDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" aria-label="Mais ações" className="h-7 w-7 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isCurrentUser ? 'end' : 'start'}>
                  {canEdit && (
                    <DropdownMenuItem onSelect={startEditing}>
                      <Pencil className="w-4 h-4 mr-2" /> Editar
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem onSelect={() => setConfirmDelete(true)} className="text-destructive focus:text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" /> Excluir
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>

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
            <AlertDialogAction onClick={() => deleteMutation.mutate()}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Message;
