import { api } from "./api-client";

export type Channel = {
  id: number
  title: string
  description: string
  active: boolean
  slug: string
}

export async function fetchChannels() {
  return api.get<Channel[]>('/me/channels')
}