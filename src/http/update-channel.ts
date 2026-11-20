import { api } from "./api-client";
import { Channel } from "./fetch-channels";

type Request = {
  slug: string
  title: string
  description?: string | null
}

export async function updateChannel({ slug, title, description }: Request) {
  return api.put<Channel>(`/channels/${slug}`, {
    title,
    description
  })
}