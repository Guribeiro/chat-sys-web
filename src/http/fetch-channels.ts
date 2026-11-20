import { Role } from "@/schemas";
import { api } from "./api-client";

export type Channel = {
  id: string
  title: string
  description: string
  active: boolean
  slug: string
  _count: {
    members: number
  }
  /** Messages from other members since my last read */
  unreadCount?: number
  /** Unread messages that mention me or reply to me (shown even when muted) */
  unreadMentionCount?: number
  /** Muted channels only notify for mentions and replies */
  muted?: boolean
  type?: 'GROUP' | 'DIRECT'
  /** DM only: the other participant */
  peer?: { id: string; name: string; email: string; avatarUrl?: string | null } | null
}

export type Status = 'active' | 'deactive' | null

type Request = {
  status?: Status
  role?: Role
}

export async function fetchChannels({ status, role }: Request) {
  return api.get<Channel[]>('/me/channels', {
    params: {
      status,
      role
    }
  })
}