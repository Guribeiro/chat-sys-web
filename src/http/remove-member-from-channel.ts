import { api } from "./api-client";

type Request = {
  slug: string
  member_id: string
}

export async function removeMemberFromChannel({ slug, member_id }: Request) {
  return api.delete<void>(`/channels/${slug}/members/${member_id}`)
}