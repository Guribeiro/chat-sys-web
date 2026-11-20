import { useQuery } from '@tanstack/react-query'

import { fetchChannels } from '@/http/fetch-channels'

/** The active channels and DMs of the current user (shared cache key: ['channels']). */
export function useChannels() {
  return useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      const { data } = await fetchChannels({ status: 'active' })
      return data
    },
  })
}

export function useChannel(slug?: string) {
  const query = useChannels()
  return { ...query, channel: query.data?.find(channel => channel.slug === slug) }
}
