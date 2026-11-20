import { api } from './api-client'
import type { MessageItem } from './fetch-channel-messages'

export type ActivityItem = {
  reason: 'mention' | 'reply'
  channel: { id: string; slug: string; title: string; type: 'GROUP' | 'DIRECT' }
  message: MessageItem
  /** Newer than the last time the activity panel was opened */
  unread: boolean
}

export type ActivityPage = {
  items: ActivityItem[]
  nextCursor: string | null
  unreadCount: number
}

export async function fetchActivity({ cursor, limit = 20 }: { cursor?: string; limit?: number } = {}) {
  const { data } = await api.get<ActivityPage>('/me/activity', { params: { cursor, limit } })
  return data
}

export async function markActivitySeen() {
  await api.post('/me/activity/seen')
}
