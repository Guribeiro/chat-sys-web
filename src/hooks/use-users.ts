import { useEffect, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

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

function useDebounced<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

/** Server-side user search (name or e-mail), so pickers are not capped at the first page of users. */
export function useUserSearch(term: string, { enabled = true }: { enabled?: boolean } = {}) {
  const q = useDebounced(term.trim(), 250)
  const query = useQuery({
    queryKey: ['users', 'search', q],
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async () => (await fetchMembers({ q, limit: 20 })).data,
  })
  return { ...query, users: query.data ?? [], settled: q === term.trim() }
}
