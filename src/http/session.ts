import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL

export type SessionUser = {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
}

export type Session = {
  token: string
  refreshToken: string
  user: SessionUser
}

// Plain axios (not the shared `api` instance) so these calls never trigger the 401 interceptor
export async function refreshSession(refreshToken: string) {
  const { data } = await axios.post<Session>(`${API_URL}/sessions/refresh`, { refreshToken })
  return data
}

export async function logoutSession(refreshToken: string) {
  await axios.post(`${API_URL}/sessions/logout`, { refreshToken })
}
