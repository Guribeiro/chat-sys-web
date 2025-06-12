import { api } from "./api-client";

export type Member = {
  id: number
  usuario_id: number
  usuario_nome: string
  canal_id: number
  criado_em: string
  criado_em_formatada: string
}

type Request = {
  slug: string
  page?: number
}

export type FetchChannelMembersResponse = {
  members: Member[]
  nextPage: number | null
  previousPage: number | null
}

export async function fetchChannelMemebers({ slug, page = 1 }: Request) {
  return api.get<FetchChannelMembersResponse>(`/chat-system/channels/${slug}/members`, {
    params: {
      page
    }
  })
}