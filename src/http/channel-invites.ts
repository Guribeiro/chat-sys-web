import { api } from "./api-client";
import type { Role } from "@/schemas";

type UserSummary = { id: string; name: string; email: string; avatarUrl?: string | null }

export type ChannelInvite = {
  id: string
  role: Role
  createdAt: string
  author: UserSummary
  invitee: UserSummary
}

/** Pending invites of a channel (admins only). */
export async function fetchChannelInvites({ slug }: { slug: string }) {
  return api.get<ChannelInvite[]>(`/channels/${slug}/invites`)
}

export async function revokeChannelInvite({ slug, inviteId }: { slug: string; inviteId: string }) {
  return api.delete<void>(`/channels/${slug}/invites/${inviteId}`)
}
