import { api } from "./api-client";

interface CreateAccount {
  name: string
  email: string
  password: string
}

export async function createAccount({ name, email, password }: CreateAccount) {
  return api.post<void>('/sessions/account', { name, email, password })
}
