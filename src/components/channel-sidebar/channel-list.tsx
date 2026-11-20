import { Channel } from "@/http/fetch-channels"
import { EmptyIndicator } from "../empty-indicator"
import { Link, useParams } from "react-router"
import { Hash, Loader2, AlertCircleIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { UserAvatar } from "../user-avatar";
import { usePresence } from "@/store/presence";
import { cn } from "@/lib/utils";

type ChannelListProps = {
  channels: Channel[]
  loading?: boolean
  error?: string
  emptyTitle?: string
}

export function ChannelList({ channels, error, loading, emptyTitle = 'Não há canais por aqui' }: ChannelListProps) {
  const { slug } = useParams()
  const onlineIds = usePresence(state => state.onlineIds)

  if (loading) {
    return <div className="flex items-center justify-center bg-opacity-50 rounded-md cursor-not-allowed">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>
          <p>{error}</p>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <ul className='overflow-y-scroll max-h-96 no-scrollbar gap-2 flex flex-col'>
      {!channels?.length && !loading && <EmptyIndicator title={emptyTitle} />}
      {channels?.map(channel => {
        const isActive = slug === channel.slug
        const unread = isActive ? 0 : channel.unreadCount ?? 0
        const isDirect = channel.type === 'DIRECT'
        const title = isDirect ? channel.peer?.name ?? 'Mensagem direta' : channel.title
        const online = isDirect && !!channel.peer && onlineIds.has(channel.peer.id)

        return (
          <li key={channel.id}>
            <Link
              to={`/channels/${channel.slug}`}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'block w-full rounded-lg border-1 p-2 text-left text-foreground transition-colors hover:border-foreground/10 hover:bg-background/60',
                isActive ? 'border-green-500 hover:border-green-500' : 'border-transparent',
              )}
            >
              <div className={`flex items-center gap-2 text-sm ${isActive ? 'text-green-500' : 'font-normal'}`}>
                {isDirect ? (
                  <span className="relative shrink-0">
                    <UserAvatar name={channel.peer?.name} avatarUrl={channel.peer?.avatarUrl} className="h-6 w-6" />
                    <span
                      className={cn(
                        'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card',
                        online ? 'bg-green-500' : 'bg-gray-400',
                      )}
                      aria-label={online ? 'online' : 'offline'}
                    />
                  </span>
                ) : (
                  <Hash className="w-4 h-4 shrink-0" />
                )}
                <span className={cn('text-sm truncate flex-1', !isDirect && 'capitalize', unread && 'font-semibold')}>{title}</span>
                {unread > 0 && (
                  <span
                    className="ml-auto rounded-full bg-green-600 px-1.5 text-[10px] font-semibold leading-4 text-white"
                    aria-label={`${unread} mensagens não lidas`}
                  >
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </div>
              {!isDirect && channel.description && (
                <p className="text-xs text-gray-500 ml-6 mt-1 truncate">{channel.description}</p>
              )}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
