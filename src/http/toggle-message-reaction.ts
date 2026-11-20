import { api } from "./api-client";
import { MessageReaction } from "./fetch-channel-messages";

type Request = {
  slug: string
  messageId: string
  emoji: string
}

export async function toggleMessageReaction({ slug, messageId, emoji }: Request) {
  return api.post<{ messageId: string; reactions: MessageReaction[] }>(
    `/channels/${slug}/messages/${messageId}/reactions`,
    { emoji },
  )
}
