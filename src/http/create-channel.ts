import { api } from "./api-client";
import { Channel } from "./fetch-channels";

type Request = {
  title: string
  description?: string | null
}

export async function createChannel({ title, description }: Request) {
  return api.post<Channel>(`/channels`, {
    title,
    description
  })
}