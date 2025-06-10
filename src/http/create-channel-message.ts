import { api } from "./api-client";
import { MessageItem } from "./fetch-channel-messages";

type Request = {
  channelId: string
  message: string
}

export async function createChannelMessage({ channelId, message }: Request) {
  return api.post<MessageItem>(`/chat-system/channels/${channelId}/messages`, {
    conteudo: message
  })
}