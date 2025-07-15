import { api } from "./api-client";

interface ResetPassword {
  code: string
  password: string
}



export async function resetPassword({ code, password }: ResetPassword) {
  return api.post<void>('/sessions/password/reset', {
    code,
    password,
  })
}