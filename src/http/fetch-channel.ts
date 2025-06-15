import { api } from "./api-client";
import { Channel } from "./fetch-channels";


type Request = {
  slug: string
}


export async function fetchChannel({ slug }: Request) {
  return api.get<Channel>(`/chat-system/channels/${slug}`)
}