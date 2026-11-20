import { Fragment, useEffect, useRef, type RefObject } from 'react';
import { AlertCircleIcon, Loader2, MessagesSquare } from 'lucide-react';

import Message from '../messages';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageItem } from '@/http/fetch-channel-messages';
import { cn } from '@/lib/utils';

/** Consecutive messages from the same author closer than this are drawn as one group */
const GROUP_WINDOW_MS = 5 * 60 * 1000

type MessagesListProps = {
  messages: MessageItem[]
  loading?: boolean
  loadingOlder?: boolean
  hasOlder?: boolean
  error?: string
  onLoadOlder: () => void
  scrollRoot: RefObject<HTMLElement>
  /** Id of the first message that arrived since my last visit */
  firstUnreadId?: string | null
}

const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

function dayLabel(date: Date) {
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (dayKey(date) === dayKey(today)) return 'Hoje'
  if (dayKey(date) === dayKey(yesterday)) return 'Ontem'
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  })
}

function Divider({ children, tone = 'muted' }: { children: string; tone?: 'muted' | 'unread' }) {
  return (
    <div
      role="separator"
      aria-label={children}
      className={cn(
        'my-4 flex items-center gap-3 text-xs font-medium first:mt-0',
        tone === 'unread' ? 'text-destructive' : 'text-muted-foreground',
      )}
    >
      <span className={cn('h-px flex-1', tone === 'unread' ? 'bg-destructive/40' : 'bg-border')} />
      <span className="first-letter:uppercase">{children}</span>
      <span className={cn('h-px flex-1', tone === 'unread' ? 'bg-destructive/40' : 'bg-border')} />
    </div>
  )
}

function MessagesSkeleton() {
  const rows: Array<{ own: boolean; width: string }> = [
    { own: false, width: 'w-56' },
    { own: false, width: 'w-40' },
    { own: true, width: 'w-64' },
    { own: false, width: 'w-72' },
    { own: true, width: 'w-32' },
    { own: true, width: 'w-52' },
  ]
  return (
    <div className="flex flex-col justify-end gap-3 py-2" aria-busy="true" aria-label="Carregando mensagens">
      {rows.map((row, index) => (
        <div key={index} className={cn('flex items-end gap-2', row.own && 'justify-end')}>
          {!row.own && <Skeleton className="size-8 rounded-full" />}
          <Skeleton className={cn('h-10 rounded-2xl', row.width)} />
        </div>
      ))}
    </div>
  )
}

export function MessagesList({
  messages,
  error,
  loading,
  loadingOlder,
  hasOlder,
  onLoadOlder,
  scrollRoot,
  firstUnreadId,
}: MessagesListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Reaching the top loads the previous page on its own (the button stays as a fallback)
  useEffect(() => {
    const sentinel = sentinelRef.current
    const root = scrollRoot.current
    if (!sentinel || !root || !hasOlder || loadingOlder) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && root.scrollTop > 0) onLoadOlder()
      },
      { root, rootMargin: '200px 0px 0px 0px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasOlder, loadingOlder, onLoadOlder, scrollRoot])

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="flex max-w-sm flex-col items-center gap-2 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircleIcon className="size-5" />
          </span>
          <p className="text-sm font-medium">Não foi possível abrir esta conversa</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col justify-end px-3 py-4 lg:px-6">
      {loading ? (
        <MessagesSkeleton />
      ) : (
        <>
          <div ref={sentinelRef} className="flex justify-center pb-4">
            {hasOlder ? (
              <Button variant="ghost" size="sm" onClick={onLoadOlder} disabled={loadingOlder} className="text-muted-foreground">
                {loadingOlder && <Loader2 className="size-4 animate-spin" />}
                {loadingOlder ? 'Carregando...' : 'Carregar mensagens anteriores'}
              </Button>
            ) : (
              <div className="flex flex-col items-center gap-2 pt-6 text-center">
                <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <MessagesSquare className="size-5" />
                </span>
                <p className="text-sm font-medium">Início da conversa</p>
                <p className="text-xs text-muted-foreground">
                  {messages.length ? 'Não há mensagens anteriores a estas.' : 'Ninguém escreveu nada ainda. Que tal começar?'}
                </p>
              </div>
            )}
          </div>

          {messages.map((message, index) => {
            const previous = messages[index - 1]
            const next = messages[index + 1]
            const date = new Date(message.createdAt)
            const newDay = !previous || dayKey(new Date(previous.createdAt)) !== dayKey(date)
            const isUnreadStart = message.id === firstUnreadId

            const continues = (a?: MessageItem, b?: MessageItem) =>
              !!a && !!b &&
              a.authorId === b.authorId &&
              dayKey(new Date(a.createdAt)) === dayKey(new Date(b.createdAt)) &&
              Math.abs(new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) < GROUP_WINDOW_MS

            const isFirstInGroup = newDay || isUnreadStart || !continues(previous, message)
            const isLastInGroup = next?.id === firstUnreadId || !continues(message, next)

            return (
              <Fragment key={message.id}>
                {newDay && <Divider>{dayLabel(date)}</Divider>}
                {isUnreadStart && <Divider tone="unread">Novas mensagens</Divider>}
                <Message message={message} isFirstInGroup={isFirstInGroup} isLastInGroup={isLastInGroup} />
              </Fragment>
            )
          })}
        </>
      )}
    </div>
  )
}
