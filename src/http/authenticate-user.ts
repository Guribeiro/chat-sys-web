import { api } from "./api-client";

interface AuthenticateUser {
  email: string
  password: string
}

interface Response {
  user: {
    admin: boolean
    id: string
    name: string
    email: string
  }
  token: string
}

export async function authenticateUser({ email, password }: AuthenticateUser) {
  return api.post<Response>('/sessions/password', {
    email,
    password
  })
}