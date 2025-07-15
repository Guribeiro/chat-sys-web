import { api } from "./api-client";

interface RequestPasswordRecover {
  email: string
}



export async function requestPasswordRecover({ email }: RequestPasswordRecover) {
  return api.post<void>('/sessions/password/recover', {
    email,
  })
}