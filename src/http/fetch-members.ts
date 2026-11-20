import { api } from "./api-client";

type User = {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
}

export async function fetchMembers() {
  return api.get<User[]>('/users')
}