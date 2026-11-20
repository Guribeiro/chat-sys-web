import { api } from "./api-client";
import { Attachment } from "./fetch-channel-messages";

type Request = {
  slug: string
  file: File
  onProgress?: (fraction: number) => void
  signal?: AbortSignal
}

/** Uploads one file to the channel; it is linked to a message when the message is sent. */
export async function uploadAttachment({ slug, file, onProgress, signal }: Request) {
  const body = new FormData()
  body.append('files', file)
  const { data } = await api.post<{ attachments: Attachment[] }>(`/channels/${slug}/attachments`, body, {
    signal,
    onUploadProgress: (event) => {
      if (event.total) onProgress?.(event.loaded / event.total)
    },
  })
  return data.attachments[0]
}
