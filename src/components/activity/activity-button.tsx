import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/pt-br'
import { AlertCircle, AtSign, Bell, BellRing, CornerDownRight, Loader2, X } from 'lucide-react'

import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Skeleton } from '../ui/skeleton'
import { UserAvatar } from '../user-avatar'
import { toMentionText } from '../chat/mentions'
import { markActivitySeen, type ActivityItem, type ActivityPage } from '@/http/fetch-activity'
import { handleAxiosError } from '@/lib/axios-error-handler'
import { notificationPermission, notificationsSupported, requestNotificationPermission } from '@/lib/notifications'
import { cn } from '@/lib/utils'
import { usePreferences } from '@/store/preferences'
import { ACTIVITY_KEY, useActivity } from './use-activity'
import type { InfiniteData } from '@tanstack/react-query'

dayjs.extend(relativeTime)
dayjs.locale('pt-br')

function preview(item: ActivityItem) {
  const { content, mentions, attachments } = item.message
  if (!content) return attachments.length ? 'Enviou um anexo' : ''
  const names = new Map(mentions.map(({ user }) => [user.id, user.name] as [string, string | null]))
  return toMentionText(content, names).replace(/\s+/g, ' ').trim()
}

/** Offered once, inside the panel, never as an automatic prompt on load. */
function NotificationsHint() {
  const enabled = usePreferences(state => state.desktopNotifications)
  const dismissed = usePreferences(state => state.notificationsHintDismissed)
  const setEnabled = usePreferences(state => state.setDesktopNotifications)
  const dismiss = usePreferences(state => state.dismissNotificationsHint)
  const [permission, setPermission] = useState(notificationPermission)

  if (!notificationsSupported || dismissed || permission === 'denied' || (enabled && permission === 'granted')) return null

  return (
    <div className="flex items-start gap-2.5 border-b bg-muted/50 px-3 py-2.5">
      <BellRing className="mt-0.5 size-4 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">Receba um aviso no computador quando mencionarem você com esta aba em segundo plano.</p>
        <Button
          size="sm"
          variant="outline"
          className="mt-2 h-7 text-xs"
          onClick={async () => {
            const result = await requestNotificationPermission()
            setPermission(result)
            if (result === 'granted') {
              setEnabled(true)
              dismiss()
            }
          }}
        >
          Ativar notificações
        </Button>
      </div>
      <Button variant="ghost" size="icon" className="size-6 shrink-0 text-muted-foreground" onClick={dismiss} aria-label="Dispensar">
        <X className="size-3.5" />
      </Button>
    </div>
  )
}

export function ActivityButton() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const { items, unreadCount, isLoading, isError, error, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } = useActivity()

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next && unreadCount > 0) {
      markActivitySeen().catch(() => { /* best effort */ })
      // Clear the badge now; the highlight of new items stays while the panel is open
      queryClient.setQueryData<InfiniteData<ActivityPage>>(ACTIVITY_KEY, data =>
        data && { ...data, pages: data.pages.map((page, index) => (index === 0 ? { ...page, unreadCount: 0 } : page)) },
      )
    }
    if (!next) queryClient.invalidateQueries({ queryKey: ACTIVITY_KEY })
  }

  const openItem = (item: ActivityItem) => {
    setOpen(false)
    queryClient.invalidateQueries({ queryKey: ACTIVITY_KEY })
    navigate(`/channels/${item.channel.slug}`, { state: { jumpTo: item.message.id } })
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="relative text-muted-foreground hover:text-foreground"
          aria-label={unreadCount > 0 ? `Atividade, ${unreadCount} novas` : 'Atividade'}
          title="Atividade"
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 min-w-4 rounded-full bg-unread px-1 text-[10px] font-semibold leading-4 text-unread-foreground tabular" aria-hidden="true">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="flex max-h-[min(32rem,calc(100dvh-5rem))] w-[min(24rem,calc(100vw-1.5rem))] flex-col overflow-hidden p-0">
        <div className="flex h-11 shrink-0 items-center border-b px-3">
          <h2 className="text-sm font-semibold">Atividade</h2>
          <span className="ml-2 text-xs text-muted-foreground">Menções e respostas a você</span>
        </div>

        <NotificationsHint />

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading && (
            <div className="space-y-3 p-3" aria-busy="true" aria-label="Carregando">
              {[0, 1, 2].map(index => (
                <div key={index} className="flex gap-2.5">
                  <Skeleton className="size-8 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-3/5" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-start gap-2 p-3">
              <p className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                Não foi possível carregar a atividade. {handleAxiosError(error)}
              </p>
              <Button size="sm" variant="outline" onClick={() => refetch()}>Tentar de novo</Button>
            </div>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <div className="px-6 py-10 text-center">
              <AtSign className="mx-auto mb-3 size-6 text-muted-foreground/60" />
              <p className="text-sm font-medium">Nada novo por aqui</p>
              <p className="mt-1 text-sm text-muted-foreground">Quando alguém mencionar ou responder você, aparece aqui.</p>
            </div>
          )}

          {items.length > 0 && (
            <ul className="divide-y">
              {items.map(item => {
                const { author } = item.message
                const where = item.channel.type === 'DIRECT' ? 'em uma mensagem direta' : `em #${item.channel.title}`
                return (
                  <li key={item.message.id}>
                    <button
                      type="button"
                      onClick={() => openItem(item)}
                      className={cn(
                        'flex w-full gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none',
                        item.unread && 'bg-primary/5',
                      )}
                    >
                      <span className="relative shrink-0">
                        <UserAvatar name={author.name} avatarUrl={author.avatarUrl} className="size-8" />
                        <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-background ring-1 ring-border">
                          {item.reason === 'mention'
                            ? <AtSign className="size-2.5 text-primary" />
                            : <CornerDownRight className="size-2.5 text-primary" />}
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline gap-2">
                          <span className="min-w-0 flex-1 truncate text-sm">
                            <span className="font-medium">{author.name ?? 'Alguém'}</span>{' '}
                            <span className="text-muted-foreground">
                              {item.reason === 'mention' ? 'mencionou você' : 'respondeu você'} {where}
                            </span>
                          </span>
                          <time dateTime={item.message.createdAt} className="shrink-0 text-xs text-muted-foreground">
                            {dayjs(item.message.createdAt).fromNow(true)}
                          </time>
                        </span>
                        <span className="mt-0.5 line-clamp-2 text-sm text-muted-foreground break-words">{preview(item)}</span>
                      </span>
                      {item.unread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-unread" aria-label="Nova" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {hasNextPage && (
            <div className="border-t p-2">
              <Button variant="ghost" size="sm" className="w-full text-muted-foreground" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
                {isFetchingNextPage && <Loader2 className="size-4 animate-spin" />}
                Carregar mais
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
