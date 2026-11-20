import { api } from "./api-client";
import type { Channel } from "./fetch-channels";

export async function openDirectMessage({ userId }: { userId: string }) {
  return api.post<Channel>('/me/direct-messages', { userId })
}
