import { Link } from 'react-router'
import { ArrowLeft, Bell, BellOff, Hash, Settings, Users } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { UserAvatar } from '../user-avatar'
import { useChannel } from '@/hooks/use-channels'
import type { Channel } from '@/http/fetch-channels'
import { updateChannelNotifications } from '@/http/update-channel-notifications'
import { handleAxiosError } from '@/lib/axios-error-handler'
import { cn } from '@/lib/utils'
import { useLayout } from '@/store/layout'
import { usePresence } from '@/store/presence'

/** Mute / unmute for me only, applied optimistically to the channels cache. */
function MuteButton({ slug, muted }: { slug: string; muted: boolean }) {
  const queryClient = useQueryClient()
  const setMuted = (value: boolean) =>
    queryClient.setQueryData<Channel[]>(['channels'], channels =>
      channels?.map(channel => (channel.slug === slug ? { ...channel, muted: value } : channel)),
    )

  const mutation = useMutation({
    mutationFn: (next: boolean) => updateChannelNotifications({ slug, muted: next }),
    onMutate: (next) => setMuted(next),
    onSuccess: (_, next) => toast(next ? 'Conversa silenciada. Menções e respostas ainda avisam você.' : 'Notificações reativadas.'),
    onError: (error, next) => {
      setMuted(!next)
      toast.error(handleAxiosError(error))
    },
  })

  const label = muted ? 'Reativar notificações' : 'Silenciar conversa'
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => mutation.mutate(!muted)}
          aria-pressed={muted}
          aria-label={label}
          className={cn('text-muted-foreground hover:text-foreground', muted && 'text-foreground')}
        >
          {muted ? <BellOff className="size-4" /> : <Bell className="size-4" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

type ChatHeaderProps = {
  slug?: string
  memberCount?: number
  canModerate: boolean
}

export function ChatHeader({ slug, memberCount, canModerate }: ChatHeaderProps) {
  const { channel, isLoading } = useChannel(slug)
  const isOnline = usePresence(state => state.isOnline(channel?.peer?.id))
  const membersOpen = useLayout(state => state.membersOpen)
  const toggleMembers = useLayout(state => state.toggleMembers)
  const openMembersSheet = useLayout(state => state.setMembersSheetOpen)

  const isDirect = channel?.type === 'DIRECT'
  const count = memberCount ?? channel?._count?.members

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-2 lg:px-4">
      <Button variant="ghost" size="icon" asChild className="lg:hidden">
        <Link to="/channels" aria-label="Voltar para as conversas">
          <ArrowLeft className="size-4" />
        </Link>
      </Button>

      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        {isLoading && !channel ? (
          <Skeleton className="h-4 w-40" />
        ) : isDirect ? (
          <>
            <span className="relative shrink-0">
              <UserAvatar name={channel.peer?.name} avatarUrl={channel.peer?.avatarUrl} className="size-7" />
              <span className={cn(
                'absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-background',
                isOnline ? 'bg-online' : 'bg-muted-foreground/40',
              )} />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold leading-tight">{channel.peer?.name ?? 'Mensagem direta'}</h1>
              <p className="text-xs leading-tight text-muted-foreground">{isOnline ? 'Online' : 'Offline'}</p>
            </div>
          </>
        ) : (
          <>
            <Hash className="size-4 shrink-0 text-muted-foreground" />
            <div className="flex min-w-0 items-baseline gap-3">
              <h1 className="shrink-0 truncate text-sm font-semibold">{channel?.title ?? slug}</h1>
              {channel?.description && (
                <p className="hidden truncate text-sm text-muted-foreground md:block">{channel.description}</p>
              )}
            </div>
          </>
        )}
      </div>

      {isDirect && slug && channel && (
        <div className="flex shrink-0 items-center">
          <MuteButton slug={slug} muted={!!channel.muted} />
        </div>
      )}

      {!isDirect && (
        <div className="flex shrink-0 items-center gap-0.5">
          {slug && channel && <MuteButton slug={slug} muted={!!channel.muted} />}
          {canModerate && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-foreground">
                  <Link to={`/admin/channels/${slug}/settings`} aria-label="Configurações do canal">
                    <Settings className="size-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Configurações do canal</TooltipContent>
            </Tooltip>
          )}
          {/* Wide screens toggle the side panel; narrower ones open a sheet */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMembers}
            aria-pressed={membersOpen}
            aria-label="Mostrar membros"
            className={cn('hidden gap-1.5 text-muted-foreground hover:text-foreground xl:flex', membersOpen && 'bg-accent text-foreground')}
          >
            <Users className="size-4" />
            {count != null && <span className="tabular">{count}</span>}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openMembersSheet(true)}
            aria-label="Mostrar membros"
            className="gap-1.5 text-muted-foreground hover:text-foreground xl:hidden"
          >
            <Users className="size-4" />
            {count != null && <span className="tabular">{count}</span>}
          </Button>
        </div>
      )}
    </header>
  )
}
