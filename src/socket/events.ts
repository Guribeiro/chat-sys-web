// Socket.io event contracts. Keep in sync with api/src/socket/events.ts
// (dates arrive serialized as ISO strings on the client)
import type { MessageItem, MessageReaction } from '@/http/fetch-channel-messages'
import type { Invite } from '@/http/get-pending-invites'

export type AckResponse = { ok: true; channelId: string } | { ok: false; error: string }

export interface ServerToClientEvents {
  'presence:snapshot': (userIds: string[]) => void
  'presence:update': (userIds: string[]) => void
  'channel:message': (payload: { channelId: string; message: MessageItem }) => void
  'channel:message_updated': (payload: { channelId: string; message: MessageItem }) => void
  'channel:message_deleted': (payload: { channelId: string; messageId: string; deletedAt: string }) => void
  /** Sent to each member's personal room on every new message, used for unread badges */
  'channel:activity': (payload: { channelId: string; messageId: string; authorId: string }) => void
  'channel:typing': (payload: { channelId: string; userId: string; name: string | null }) => void
  'channel:message_reactions': (payload: { channelId: string; messageId: string; reactions: MessageReaction[] }) => void
  'channel:updated': (payload: { channelId: string; slug: string; title: string; active: boolean }) => void
  'channel:deleted': (payload: { channelId: string }) => void
  'channel:member_added': (payload: { channelId: string; userId: string }) => void
  'channel:member_removed': (payload: { channelId: string; userId: string }) => void
  'notification:new_invite': (payload: { invite: Invite }) => void
  'notification:mention': (payload: {
    channelId: string
    channelSlug: string
    channelTitle: string
    messageId: string
    author: { id: string; name: string | null }
    preview: string
  }) => void
}

export interface ClientToServerEvents {
  'channel:join': (payload: { slug: string }, ack?: (response: AckResponse) => void) => void
  'channel:leave': (payload: { slug: string }) => void
  'channel:typing': (payload: { channelId: string }) => void
}
