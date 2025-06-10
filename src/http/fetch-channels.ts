import { api } from "./api-client";

type Channel = {
  id: number
  titulo: string
  descricao: string
  criado_em: string
}

export async function fetchChannels() {
  return api.get<Channel[]>('/chat-system/channels')
}