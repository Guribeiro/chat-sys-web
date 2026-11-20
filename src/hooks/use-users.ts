import { useQuery } from '@tanstack/react-query'

import { fetchMembers } from '@/http/fetch-members'

/**
 * Every user of the workspace (shared cache key: ['users']).
 * Always read through this hook so every observer uses the same options: the cached data
 * may be undefined until the first fetch, never rely on `initialData` for a shared key.
 */
export function useUsers({ enabled = true }: { enabled?: boolean } = {}) {
  const query = useQuery({
    queryKey: ['users'],
    enabled,
    queryFn: async () => (await fetchMembers()).data,
  })
  return { ...query, users: query.data ?? [] }
}
