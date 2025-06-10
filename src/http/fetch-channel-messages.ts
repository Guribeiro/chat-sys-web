import { api } from "./api-client";

export type MessageItem = {
  id: number
  conteudo: string
  usuario_id: number
  usuario_nome: string
  canal_id: number
  enviado_em: string
  enviado_em_formatada: string
}

type Request = {
  channelId: string
  page?: number
}

export type FetchChannelMessagesResponse = {
  messages: MessageItem[]
  nextPage: number | null
  previousPage: number | null
}

export async function fetchChannelMessages({ channelId, page = 1 }: Request) {
  return api.get<FetchChannelMessagesResponse>(`/chat-system/channels/${channelId}/messages`, {
    params: {
      page
    }
  })
}