import { api } from "./api-client";
import { MessageItem } from "./fetch-channel-messages";

type Request = {
  slug: string
  messageId: string
  content: string
}

export async function updateChannelMessage({ slug, messageId, content }: Request) {
  return api.patch<MessageItem>(`/channels/${slug}/messages/${messageId}`, { content })
}
