import { api } from "./api-client";

type Request = {
  inviteId: string
}

export async function acceptInvite({ inviteId }: Request) {
  return api.post<void>(`/me/invites/${inviteId}/accept`)
}