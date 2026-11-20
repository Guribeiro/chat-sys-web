import { api } from "./api-client";
import { MessageItem } from "./fetch-channel-messages";

type Request = {
  slug: string
  message: string
  replyToId?: string
  attachmentIds?: string[]
}

export async function createChannelMessage({ slug, message, replyToId, attachmentIds }: Request) {
  return api.post<MessageItem>(`/channels/${slug}/messages`, {
    content: message || undefined,
    replyToId,
    attachmentIds: attachmentIds?.length ? attachmentIds : undefined,
  })
}