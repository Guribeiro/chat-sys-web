import { Link, useParams } from "react-router"
import { Hash, AlertCircleIcon, AtSign, BellOff } from "lucide-react"

import { Channel } from "@/http/fetch-channels"
import { EmptyIndicator } from "../empty-indicator"
import { Skeleton } from "../ui/skeleton"
import { UserAvatar } from "../user-avatar";
import { usePresence } from "@/store/presence";
import { cn } from "@/lib/utils";

type ChannelListProps = {
  channels: Channel[]
  loading?: boolean
  error?: string
  emptyTitle?: string
  emptyContent?: string
}

export function ChannelList({ channels, error, loading, emptyTitle = 'Não há canais por aqui', emptyContent }: ChannelListProps) {
  const { slug } = useParams()
  const onlineIds = usePresence(state => state.onlineIds)

  if (loading) {
    return (
      <div className="space-y-1 px-2 py-1" aria-busy="true" aria-label="Carregando">
        {[72, 56, 64].map(width => (
          <div key={width} className="flex h-8 items-center gap-2">
            <Skeleton className="size-4 rounded" />
            <Skeleton className="h-3" style={{ width: `${width}%` }} />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <p className="mx-2 flex items-start gap-2 rounded-md bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
        <AlertCircleIcon className="mt-px size-3.5 shrink-0" />
        {error}
      </p>
    )
  }

  if (!channels?.length) {
    return <EmptyIndicator title={emptyTitle} content={emptyContent} className="px-4" />
  }

  return (
    <ul className="flex flex-col gap-px">
      {channels.map(channel => {
        const isActive = slug === channel.slug
        const unread = isActive ? 0 : channel.unreadCount ?? 0
        const addressed = isActive ? 0 : channel.unreadMentionCount ?? 0
        const muted = !!channel.muted
        // Muted: a quiet dot for activity, the counter only for what is addressed to me
        const badge = muted ? addressed : unread
        const isDirect = channel.type === 'DIRECT'
        const title = isDirect ? channel.peer?.name ?? 'Mensagem direta' : channel.title
        const online = isDirect && !!channel.peer && onlineIds.has(channel.peer.id)

        return (
          <li key={channel.id}>
            <Link
              to={`/channels/${channel.slug}`}
              aria-current={isActive ? 'page' : undefined}
              title={!isDirect && channel.description ? channel.description : undefined}
              className={cn(
                'flex h-9 items-center gap-2 rounded-md px-2 text-sm transition-colors lg:h-8',
                'focus-visible:outline-2 focus-visible:outline-ring',
                isActive
                  ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                  : badge
                    ? 'font-semibold text-foreground hover:bg-sidebar-accent/60'
                    : muted
                      ? 'text-muted-foreground/70 hover:bg-sidebar-accent/60 hover:text-foreground'
                      : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
              )}
            >
              {isDirect ? (
                <span className="relative shrink-0">
                  <UserAvatar name={channel.peer?.name} avatarUrl={channel.peer?.avatarUrl} className="size-5" />
                  <span
                    className={cn(
                      'absolute -bottom-0.5 -right-0.5 size-2 rounded-full ring-2 ring-sidebar',
                      online ? 'bg-online' : 'bg-muted-foreground/40',
                    )}
                  />
                  <span className="sr-only">{online ? '(online)' : '(offline)'}</span>
                </span>
              ) : (
                <Hash className={cn('size-4 shrink-0', isActive ? 'text-primary' : 'opacity-70')} />
              )}
              <span className={'min-w-0 flex-1 truncate'}>{title}</span>
              {muted && <BellOff className="size-3.5 shrink-0 opacity-60" aria-label="Silenciada" />}
              {addressed > 0 && !muted && (
                <AtSign className="size-3.5 shrink-0 text-unread" aria-label="Menciona ou responde você" />
              )}
              {badge > 0 ? (
                <span
                  className="rounded-full bg-unread px-1.5 text-[10px] font-semibold leading-4 text-unread-foreground tabular"
                  aria-label={muted ? `${badge} menções ou respostas não lidas` : `${badge} mensagens não lidas`}
                >
                  {badge > 99 ? '99+' : badge}
                </span>
              ) : muted && unread > 0 ? (
                <span className="size-1.5 shrink-0 rounded-full bg-muted-foreground/60" aria-label="Há mensagens novas" />
              ) : null}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
