import { api } from "./api-client";

export interface MessageItem {
  id: string
  /** null when the message was deleted */
  content: string | null
  authorId: string
  channelId: string
  createdAt: string
  updatedAt: string
  editedAt: string | null
  deletedAt: string | null
  author: Author
  parentId: string | null
  /** Quoted preview of the message this one replies to */
  parent: MessageParent | null
  reactions: MessageReaction[]
  /** Users referenced by `<@id>` tokens inside the content */
  mentions: MessageMention[]
  attachments: Attachment[]
  /** Client-only: optimistic message still being sent */
  pending?: boolean
}

export interface MessageParent {
  id: string
  content: string | null
  deletedAt: string | null
  authorId: string
  author: { id: string; name: string | null }
  attachmentCount: number
}

export interface Attachment {
  id: string
  name: string
  mime: string
  size: number
  width: number | null
  height: number | null
  /** API-relative path, resolve with assetUrl() */
  url: string
  thumbnailUrl: string | null
}

export interface MessageReaction {
  emoji: string
  userId: string
  user: { name: string | null }
}

export interface MessageMention {
  userId: string
  user: { id: string; name: string | null }
}

export interface Author {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
}

type Request = {
  slug: string
  cursor?: string
  limit?: number
}

export type FetchChannelMessagesResponse = {
  /** Chronological order (oldest first) */
  messages: MessageItem[]
  /** Pass as `cursor` to load older messages; null when the start of the channel was reached */
  nextCursor: string | null
}

export async function fetchChannelMessages({ slug, cursor, limit = 30 }: Request) {
  return api.get<FetchChannelMessagesResponse>(`/channels/${slug}/messages`, {
    params: { cursor, limit }
  })
}
