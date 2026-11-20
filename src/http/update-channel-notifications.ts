import { api } from './api-client'

export async function updateChannelNotifications({ slug, muted }: { slug: string; muted: boolean }) {
  const { data } = await api.patch<{ muted: boolean }>(`/channels/${slug}/notifications`, { muted })
  return data
}
