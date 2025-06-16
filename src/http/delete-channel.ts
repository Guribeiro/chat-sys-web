import { api } from "./api-client";
import { Channel } from "./fetch-channels";

type Request = {
  slug: string
}

export async function deleteChannel({ slug }: Request) {
  return api.delete<Channel>(`/chat-system/channels/${slug}`)
}