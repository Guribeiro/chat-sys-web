import { api } from "./api-client";
import { MessageItem } from "./fetch-channel-messages";

type Request = {
  title: string
  description: string
}

export async function createChannel({ title, description }: Request) {
  return api.post<MessageItem>(`/chat-system/channels`, {
    titulo: title,
    descricao: description
  })
}