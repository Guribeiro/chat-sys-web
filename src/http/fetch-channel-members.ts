import { api } from "./api-client";
import { Role } from '@/schemas'

export type Member = {
  id: string
  role: Role,
  memberId: string
  channelId: string
  createdAt: string | null
  member: {
    id: string
    name: string
    email: string
  }
}

type Request = {
  slug: string
}

export type FetchChannelMembersResponse = {
  members: Member[]
  nextPage: number | null
  previousPage: number | null
}

export async function fetchChannelMemebers({ slug }: Request) {
  return api.get<Member[]>(`/channels/${slug}/members`)
}