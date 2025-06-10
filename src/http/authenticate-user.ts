import { api } from "./api-client";

interface AuthenticateUser {
  email: string
  password: string
}

interface Response {
  user: {
    id: number
    admin: boolean
    name: string
    iddepartamento: number
  },
  token: string
}

export async function authenticateUser({ email, password }: AuthenticateUser) {
  return api.post<Response>('/users/authenticate', {
    email,
    password
  })
}