import { api } from "./api-client";
import { Channel } from "./fetch-channels";

type Request = {
  slug: string
  status: string
}

export async function updateChannelStatus({ slug, status }: Request) {
  return api.patch<Channel>(`/chat-system/channels/${slug}/status`, {
    situacao: status
  })
}