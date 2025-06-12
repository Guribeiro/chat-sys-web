import { api } from "./api-client";
import { MessageItem } from "./fetch-channel-messages";

type Request = {
  slug: string
  member_id: string
}

export async function createChannelMember({ slug, member_id }: Request) {
  return api.post<MessageItem>(`/chat-system/channels/${slug}/members`, {
    member_id,
  })
}