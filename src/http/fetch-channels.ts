import { Role } from "@/schemas";
import { api } from "./api-client";

export type Channel = {
  id: number
  title: string
  description: string
  active: boolean
  slug: string
  _count: {
    members: number
  }
}

export type Status = 'active' | 'deactive' | null

type Request = {
  status?: Status
  role?: Role
}

export async function fetchChannels({ status, role }: Request) {
  return api.get<Channel[]>('/me/channels', {
    params: {
      status,
      role
    }
  })
}