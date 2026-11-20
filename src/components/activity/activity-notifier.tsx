import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'

import type { Channel } from '@/http/fetch-channels'
import { useChannels } from '@/hooks/use-channels'
import { notificationPermission, showNotification } from '@/lib/notifications'
import { socket } from '@/socket'
import type { ActivityNotification, ChannelActivity } from '@/socket/events'
import { authSlice } from '@/store/auth'
import { usePreferences } from '@/store/preferences'
import { assetUrl } from '@/lib/asset-url'
import { ACTIVITY_KEY } from './use-activity'

const APP_TITLE = 'Realtime chat'

function activityTitle({ reason, author, channelType, channelTitle }: Pick<ActivityNotification, 'reason' | 'author' | 'channelType' | 'channelTitle'>) {
  const name = author.name ?? 'Alguém'
  const verb = reason === 'mention' ? 'mencionou você' : 'respondeu você'
  return channelType === 'DIRECT' ? `${name} ${verb}` : `${name} ${verb} em #${channelTitle}`
}

/**
 * Decides how to tell the user about activity outside what they are looking at:
 * - mentions and replies: toast while the tab is visible, desktop notification while it is hidden;
 * - new DMs (not muted): desktop notification while the tab is hidden (the badge is enough otherwise).
 * Also keeps the tab title as "(N) Realtime chat".
 */
export function ActivityNotifier() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const userId = authSlice(state => state.auth?.user?.id)
  const desktopEnabled = usePreferences(state => state.desktopNotifications)
  const { data: channels } = useChannels()

  // One notification per message, even when it arrives both as a DM and as a mention
  const notified = useRef(new Set<string>())

  useEffect(() => {
    const channelById = (id: string) => queryClient.getQueryData<Channel[]>(['channels'])?.find(channel => channel.id === id)
    const isWatching = (channelSlug?: string) => !!channelSlug && channelSlug === slug && document.visibilityState === 'visible'
    const canNotifyDesktop = () => desktopEnabled && document.visibilityState === 'hidden' && notificationPermission() === 'granted'
    const firstTime = (messageId: string) => {
      if (notified.current.has(messageId)) return false
      notified.current.add(messageId)
      if (notified.current.size > 200) notified.current = new Set([...notified.current].slice(-100))
      return true
    }
    const open = (channelSlug: string, messageId: string) =>
      navigate(`/channels/${channelSlug}`, { state: { jumpTo: messageId } })

    const handleActivity = (payload: ActivityNotification) => {
      queryClient.invalidateQueries({ queryKey: ACTIVITY_KEY })
      if (payload.channelSlug !== slug) {
        queryClient.setQueryData<Channel[]>(['channels'], current =>
          current?.map(channel =>
            channel.id === payload.channelId
              ? { ...channel, unreadMentionCount: (channel.unreadMentionCount ?? 0) + 1 }
              : channel,
          ),
        )
      }

      if (isWatching(payload.channelSlug) || !firstTime(payload.messageId)) return

      const title = activityTitle(payload)
      if (canNotifyDesktop()) {
        showNotification({
          title,
          body: payload.preview,
          tag: payload.channelId,
          icon: assetUrl(payload.author.avatarUrl),
          onClick: () => open(payload.channelSlug, payload.messageId),
        })
      } else if (document.visibilityState === 'visible') {
        toast(title, {
          description: payload.preview,
          duration: 8000,
          action: { label: 'Abrir', onClick: () => open(payload.channelSlug, payload.messageId) },
        })
      }
    }

    const handleChannelActivity = ({ channelId, messageId, authorId, authorName, preview }: ChannelActivity) => {
      if (authorId === userId || !canNotifyDesktop()) return
      const channel = channelById(channelId)
      if (!channel || channel.type !== 'DIRECT' || channel.muted) return
      // Give a mention/reply notification for the same message the chance to win (it is more specific)
      setTimeout(() => {
        if (!firstTime(messageId)) return
        showNotification({
          title: authorName ?? channel.peer?.name ?? 'Nova mensagem',
          body: preview,
          tag: channelId,
          icon: assetUrl(channel.peer?.avatarUrl),
          onClick: () => open(channel.slug, messageId),
        })
      }, 150)
    }

    socket.on('notification:activity', handleActivity)
    socket.on('channel:activity', handleChannelActivity)
    return () => {
      socket.off('notification:activity', handleActivity)
      socket.off('channel:activity', handleChannelActivity)
    }
  }, [slug, navigate, queryClient, userId, desktopEnabled])

  // Tab title: what still needs me. Muted channels only count what is addressed to me.
  const pending = channels?.reduce(
    (total, channel) => total + (channel.muted ? channel.unreadMentionCount ?? 0 : channel.unreadCount ?? 0),
    0,
  ) ?? 0

  useEffect(() => {
    document.title = pending > 0 ? `(${pending > 99 ? '99+' : pending}) ${APP_TITLE}` : APP_TITLE
  }, [pending])

  useEffect(() => () => { document.title = APP_TITLE }, [])

  return null
}
