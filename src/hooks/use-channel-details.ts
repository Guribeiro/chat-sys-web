import { useQuery } from '@tanstack/react-query'

import { fetchChannel } from '@/http/fetch-channel'
import { fetchChannelMembers } from '@/http/fetch-channel-members'
import { fetchChannelInvites } from '@/http/channel-invites'

export const channelKeys = {
  details: (slug?: string) => ['channel', slug] as const,
  members: (slug?: string) => ['members', slug] as const,
  invites: (slug?: string) => ['channel-invites', slug] as const,
}

/** One channel with the viewer's permissions (works for inactive channels too, unlike the sidebar cache). */
export function useChannelDetails(slug?: string) {
  return useQuery({
    queryKey: channelKeys.details(slug),
    enabled: !!slug,
    // A 403/404 is an answer, not a hiccup: show it instead of retrying
    retry: false,
    queryFn: async () => (await fetchChannel({ slug: slug! })).data,
  })
}

/** Members of a channel; shared by the chat, the members panel and the manage screen. */
export function useChannelMembers(slug?: string) {
  return useQuery({
    queryKey: channelKeys.members(slug),
    enabled: !!slug,
    refetchOnWindowFocus: true,
    queryFn: async () => (await fetchChannelMembers({ slug: slug! })).data,
  })
}

export function useChannelInvites(slug?: string, { enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: channelKeys.invites(slug),
    enabled: !!slug && enabled,
    queryFn: async () => (await fetchChannelInvites({ slug: slug! })).data,
  })
}
