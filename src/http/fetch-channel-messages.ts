import { api } from "./api-client";

export interface MessageItem {
  id: string
  content: string
  authorId: string
  channelId: string
  createdAt: string
  updatedAt: string
  author: Author
}

export interface Author {
  id: string
  name: string
  email: string
}


type Request = {
  slug: string
  page?: number
}

export type FetchChannelMessagesResponse = {
  messages: MessageItem[]
  nextPage: number | null
  previousPage: number | null
}

export async function fetchChannelMessages({ slug, page = 1 }: Request) {
  return api.get<FetchChannelMessagesResponse>(`/channels/${slug}/messages`, {
    params: {
      page
    }
  })
}