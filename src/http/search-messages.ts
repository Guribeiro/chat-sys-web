import { api } from "./api-client";

export type SearchResult = {
  id: string
  channelId: string
  slug: string
  /** Channel title, or the other person's name for a DM */
  title: string
  type: 'GROUP' | 'DIRECT'
  createdAt: string
  author: { id: string; name: string | null; avatarUrl: string | null }
  /** Highlighted fragments are wrapped in \u0001 ... \u0002 */
  snippet: string
}

export async function searchMessages({ q, signal }: { q: string; signal?: AbortSignal }) {
  return api.get<{ results: SearchResult[] }>('/me/search', { params: { q, limit: 20 }, signal })
}
