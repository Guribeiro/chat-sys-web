import { api } from "./api-client";

export type WorkspaceUser = {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
}

/** Workspace users; `q` matches name or e-mail on the server. */
export async function fetchMembers({ q, limit }: { q?: string; limit?: number } = {}) {
  return api.get<WorkspaceUser[]>('/users', { params: { q: q || undefined, limit } })
}
