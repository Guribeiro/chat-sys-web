// Socket.io event contracts. Keep in sync with api/src/socket/events.ts
// (dates arrive serialized as ISO strings on the client)
import type { MessageItem } from '@/http/fetch-channel-messages'
import type { Invite } from '@/http/get-pending-invites'

export type AckResponse = { ok: true; channelId: string } | { ok: false; error: string }

export interface ServerToClientEvents {
  'presence:snapshot': (userIds: string[]) => void
  'presence:update': (userIds: string[]) => void
  'channel:message': (payload: { channelId: string; message: MessageItem }) => void
  'channel:updated': (payload: { channelId: string; slug: string; title: string; active: boolean }) => void
  'channel:deleted': (payload: { channelId: string }) => void
  'channel:member_added': (payload: { channelId: string; userId: string }) => void
  'channel:member_removed': (payload: { channelId: string; userId: string }) => void
  'notification:new_invite': (payload: { invite: Invite }) => void
}

export interface ClientToServerEvents {
  'channel:join': (payload: { slug: string }, ack?: (response: AckResponse) => void) => void
  'channel:leave': (payload: { slug: string }) => void
}
