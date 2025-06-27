import { api } from "./api-client";
import { Role } from "@/schemas";

export interface Invite {
  id: string
  role: Role
  authorId: string
  inviteeId: string
  channelId: string
  createdAt: string
  author: {
    id: string
    name: string
    email: string
  },
  channel: {
    id: string
    title: string
    description: string
  }
}


export async function getPendingInvites() {
  return api.get<Invite[]>(`/me/pending-invites`)
}