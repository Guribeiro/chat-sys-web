import { api } from "./api-client";

type Member = {
  id: number
  nome: string
}

export async function fetchMembers() {
  return api.get<Member[]>('/chat-system/members')
}