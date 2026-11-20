import type { InfiniteData, QueryClient } from '@tanstack/react-query'
import type { FetchChannelMessagesResponse, MessageItem } from '@/http/fetch-channel-messages'

export type MessagesData = InfiniteData<FetchChannelMessagesResponse, string | undefined>

export const messagesQueryKey = (slug: string) => ['channel-messages', slug] as const

/**
 * Helpers that patch the infinite messages query in place, so socket events, optimistic
 * sends, edits and deletes all live in a single source of truth.
 * Page 0 holds the newest messages; each next page is older.
 */
function update(queryClient: QueryClient, slug: string, fn: (data: MessagesData) => MessagesData) {
  queryClient.setQueryData<MessagesData>(messagesQueryKey(slug), (data) => (data?.pages.length ? fn(data) : data))
}

const hasMessage = (data: MessagesData, id: string) =>
  data.pages.some((page) => page.messages.some((message) => message.id === id))

/** Appends a message to the newest page, unless it is already there. */
export function appendMessage(queryClient: QueryClient, slug: string, message: MessageItem) {
  update(queryClient, slug, (data) => {
    if (hasMessage(data, message.id)) return data
    const [newest, ...older] = data.pages
    return { ...data, pages: [{ ...newest, messages: [...newest.messages, message] }, ...older] }
  })
}

export function patchMessage(
  queryClient: QueryClient,
  slug: string,
  id: string,
  patch: Partial<MessageItem>,
) {
  update(queryClient, slug, (data) => ({
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      messages: page.messages.map((message) => (message.id === id ? { ...message, ...patch } : message)),
    })),
  }))
}

export function removeMessage(queryClient: QueryClient, slug: string, id: string) {
  update(queryClient, slug, (data) => ({
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      messages: page.messages.filter((message) => message.id !== id),
    })),
  }))
}

/** Swaps an optimistic message for the one saved by the server (which may already have arrived via socket). */
export function confirmMessage(queryClient: QueryClient, slug: string, tempId: string, message: MessageItem) {
  update(queryClient, slug, (data) => {
    const alreadyThere = hasMessage(data, message.id)
    return {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        messages: alreadyThere
          ? page.messages.filter((item) => item.id !== tempId)
          : page.messages.map((item) => (item.id === tempId ? message : item)),
      })),
    }
  })
}

/** A deleted message must also disappear from the quotes of the replies pointing at it. */
export function markMessageDeleted(queryClient: QueryClient, slug: string, id: string, deletedAt: string) {
  update(queryClient, slug, (data) => ({
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      messages: page.messages.map((message) => {
        if (message.id === id) return { ...message, content: null, deletedAt, reactions: [], mentions: [] }
        if (message.parent?.id === id) return { ...message, parent: { ...message.parent, content: null, deletedAt } }
        return message
      }),
    })),
  }))
}

/** Finds a message currently loaded in the cache (used for optimistic reaction toggles). */
export function findMessage(queryClient: QueryClient, slug: string, id: string): MessageItem | undefined {
  const data = queryClient.getQueryData<MessagesData>(messagesQueryKey(slug))
  for (const page of data?.pages ?? []) {
    const found = page.messages.find((message) => message.id === id)
    if (found) return found
  }
}
