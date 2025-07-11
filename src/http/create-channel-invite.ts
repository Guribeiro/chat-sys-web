import { api } from "./api-client";
import { Role } from "@/schemas";

type Request = {
  slug: string
  invitee_id: string
  role: Role
}

export async function createChannelInvite({ slug, invitee_id, role }: Request) {
  return api.post(`/channels/${slug}/invites`, {
    invitee_id,
    role
  })
}