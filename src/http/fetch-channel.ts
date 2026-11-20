import { api } from "./api-client";
import type { Role } from "@/schemas";

/** A channel as GET /channels/:slug returns it, plus what the current user may do there. */
export type ChannelDetails = {
  id: string
  title: string
  description: string | null
  slug: string
  active: boolean
  type: 'GROUP' | 'DIRECT'
  ownerId: string
  createdAt: string
  viewer: {
    role: Role
    isOwner: boolean
    /** Owner or ADMIN: may manage members, invites and settings */
    isAdmin: boolean
  }
}

export async function fetchChannel({ slug }: { slug: string }) {
  return api.get<ChannelDetails>(`/channels/${slug}`)
}
