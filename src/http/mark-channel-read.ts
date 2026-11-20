import { api } from "./api-client";

export async function markChannelRead({ slug }: { slug: string }) {
  return api.post<void>(`/channels/${slug}/read`)
}
