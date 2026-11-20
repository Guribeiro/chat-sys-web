import { api } from "./api-client";
import type { Role } from '@/schemas'

export type Member = {
  /** Membership id (used by the member endpoints), not the user id */
  id: string
  role: Role
  memberId: string
  channelId: string
  createdAt: string | null
  /** The channel owner: always ADMIN, can not be removed or demoted */
  isOwner?: boolean
  member: {
    id: string
    name: string
    email: string
    avatarUrl?: string | null
  }
}

export async function fetchChannelMembers({ slug }: { slug: string }) {
  return api.get<Member[]>(`/channels/${slug}/members`)
}

export async function updateMemberRole({ slug, memberId, role }: { slug: string; memberId: string; role: Role }) {
  return api.patch<Member>(`/channels/${slug}/members/${memberId}`, { role })
}

export async function transferChannelOwnership({ slug, memberId }: { slug: string; memberId: string }) {
  return api.post<void>(`/channels/${slug}/transfer-ownership`, { memberId })
}
