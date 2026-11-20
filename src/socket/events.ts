// Socket.io event contracts. Keep in sync with api/src/socket/events.ts
// (dates arrive serialized as ISO strings on the client)
import type { MessageItem, MessageReaction } from '@/http/fetch-channel-messages'
import type { Invite } from '@/http/get-pending-invites'

export interface ChannelActivity {
  channelId: string
  messageId: string
  authorId: string
  authorName: string | null
  /** Plain-text preview, used for desktop notifications of DMs */
  preview: string
}

export interface ActivityNotification {
  reason: 'mention' | 'reply'
  channelId: string
  channelSlug: string
  channelTitle: string
  channelType: 'GROUP' | 'DIRECT'
  messageId: string
  author: { id: string; name: string | null; avatarUrl: string | null }
  preview: string
}

export type AckResponse = { ok: true; channelId: string } | { ok: false; error: string }

export interface ServerToClientEvents {
  'presence:snapshot': (userIds: string[]) => void
  'presence:update': (userIds: string[]) => void
  'channel:message': (payload: { channelId: string; message: MessageItem }) => void
  'channel:message_updated': (payload: { channelId: string; message: MessageItem }) => void
  'channel:message_deleted': (payload: { channelId: string; messageId: string; deletedAt: string }) => void
  /** Sent to each member's personal room on every new message, used for unread badges */
  'channel:activity': (payload: ChannelActivity) => void
  'channel:typing': (payload: { channelId: string; userId: string; name: string | null }) => void
  'channel:message_reactions': (payload: { channelId: string; messageId: string; reactions: MessageReaction[] }) => void
  'channel:updated': (payload: { channelId: string; slug: string; title: string; active: boolean }) => void
  'channel:deleted': (payload: { channelId: string }) => void
  'channel:member_added': (payload: { channelId: string; userId: string }) => void
  'channel:member_removed': (payload: { channelId: string; userId: string }) => void
  'channel:member_updated': (payload: { channelId: string; userId: string; role: 'ADMIN' | 'MEMBER' }) => void
  'channel:owner_changed': (payload: { channelId: string; previousOwnerId: string; ownerId: string }) => void
  'notification:invite_revoked': (payload: { inviteId: string }) => void
  'notification:new_invite': (payload: { invite: Invite }) => void
  /** Something addressed to me: a mention, or a reply to one of my messages */
  'notification:activity': (payload: ActivityNotification) => void
}

export interface ClientToServerEvents {
  'channel:join': (payload: { slug: string }, ack?: (response: AckResponse) => void) => void
  'channel:leave': (payload: { slug: string }) => void
  'channel:typing': (payload: { channelId: string }) => void
}
