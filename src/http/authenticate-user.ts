import { api } from "./api-client";

interface AuthenticateUser {
  email: string
  password: string
}

import type { Session } from "./session";

type Response = Session

export async function authenticateUser({ email, password }: AuthenticateUser) {
  return api.post<Response>('/sessions/password', {
    email,
    password
  })
}