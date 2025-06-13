import { api } from "./api-client";

export type Channel = {
  id: number
  titulo: string
  descricao: string
  slug: string
  membros_count: number
  criado_em: string
}

export async function fetchChannels() {
  return api.get<Channel[]>('/chat-system/channels')
}