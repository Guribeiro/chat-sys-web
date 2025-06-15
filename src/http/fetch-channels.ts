import { api } from "./api-client";

export type Channel = {
  id: number
  titulo: string
  descricao: string
  situacao: 'ATIVO' | 'INATIVO',
  slug: string
  membros_count: number
  criado_em: string
}

type Request = {
  status?: 'ATIVO' | 'INATIVO' | null
}

export async function fetchChannels({ status = 'ATIVO' }: Request) {
  return api.get<Channel[]>('/chat-system/channels', {
    params: {
      situacao: status
    }
  })
}