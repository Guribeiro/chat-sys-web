import { api } from "./api-client";
import type { SessionUser } from "./session";

export async function updateProfile({ name }: { name: string }) {
  return api.patch<SessionUser>('/me', { name })
}

export async function changePassword(body: { currentPassword: string; newPassword: string; refreshToken?: string }) {
  return api.patch<void>('/me/password', body)
}

export async function uploadAvatar(file: File) {
  const body = new FormData()
  body.append('avatar', file)
  return api.put<SessionUser>('/me/avatar', body)
}

export async function removeAvatar() {
  return api.delete<SessionUser>('/me/avatar')
}
