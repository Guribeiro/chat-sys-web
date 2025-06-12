import { api } from "./api-client";

type Request = {
  slug: string
  member_id: number
}

export async function removeMemberFromChannel({ slug, member_id }: Request) {
  return api.delete<void>(`/chat-system/channels/${slug}/members/${member_id}`)
}