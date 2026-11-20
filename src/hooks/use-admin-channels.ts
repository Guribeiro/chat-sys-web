import { useQuery } from '@tanstack/react-query'

import { fetchChannels, type Status } from '@/http/fetch-channels'

/** Prefix shared by every "channels I administer" query: invalidate it after creating, renaming or deleting. */
export const ADMIN_CHANNELS_KEY = ['admin', 'channels'] as const

/** Group channels where I am ADMIN (or owner), optionally filtered by status. */
export function useAdminChannels(status: Status = null) {
  return useQuery({
    queryKey: [...ADMIN_CHANNELS_KEY, 'list', status ?? 'all'],
    queryFn: async () => (await fetchChannels({ status, role: 'ADMIN' })).data,
  })
}
