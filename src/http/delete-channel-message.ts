import { api } from "./api-client";

type Request = {
  slug: string
  messageId: string
}

export async function deleteChannelMessage({ slug, messageId }: Request) {
  return api.delete<void>(`/channels/${slug}/messages/${messageId}`)
}
