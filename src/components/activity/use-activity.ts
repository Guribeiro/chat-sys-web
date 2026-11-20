import { useInfiniteQuery } from '@tanstack/react-query'

import { fetchActivity } from '@/http/fetch-activity'

export const ACTIVITY_KEY = ['activity'] as const

/** Mentions of me and replies to my messages; the first page also carries the unread count. */
export function useActivity() {
  const query = useInfiniteQuery({
    queryKey: ACTIVITY_KEY,
    queryFn: ({ pageParam }) => fetchActivity({ cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })

  return {
    ...query,
    items: query.data?.pages.flatMap((page) => page.items) ?? [],
    unreadCount: query.data?.pages[0]?.unreadCount ?? 0,
  }
}
