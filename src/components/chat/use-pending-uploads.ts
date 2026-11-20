import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import type { Attachment } from '@/http/fetch-channel-messages'
import { uploadAttachment } from '@/http/upload-attachments'
import { handleAxiosError } from '@/lib/axios-error-handler'

export const MAX_ATTACHMENTS = 5
export const MAX_FILE_MB = 10

export type PendingUpload = {
  localId: string
  file: File
  /** Object URL for an instant local preview of images */
  previewUrl: string | null
  progress: number
  attachment: Attachment | null
  error: boolean
  controller: AbortController
}

/** Files picked in the composer: uploaded right away, sent later as attachmentIds. */
export function usePendingUploads(slug: string) {
  const [uploads, setUploads] = useState<PendingUpload[]>([])
  const uploadsRef = useRef(uploads)
  uploadsRef.current = uploads

  const patch = (localId: string, changes: Partial<PendingUpload>) =>
    setUploads(current => current.map(item => (item.localId === localId ? { ...item, ...changes } : item)))

  const addFiles = useCallback((files: File[]) => {
    const room = MAX_ATTACHMENTS - uploadsRef.current.length
    if (room <= 0) return toast.error(`Máximo de ${MAX_ATTACHMENTS} arquivos por mensagem`)
    if (files.length > room) toast.warning(`Só ${room} arquivo(s) foram adicionados (máximo ${MAX_ATTACHMENTS})`)

    const accepted = files.slice(0, room).filter(file => {
      if (file.size <= MAX_FILE_MB * 1024 * 1024) return true
      toast.error(`${file.name} é maior que ${MAX_FILE_MB} MB`)
      return false
    })

    const items: PendingUpload[] = accepted.map(file => ({
      localId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      progress: 0,
      attachment: null,
      error: false,
      controller: new AbortController(),
    }))
    setUploads(current => [...current, ...items])

    for (const item of items) {
      uploadAttachment({
        slug,
        file: item.file,
        signal: item.controller.signal,
        onProgress: (progress) => patch(item.localId, { progress }),
      })
        .then(attachment => patch(item.localId, { attachment, progress: 1 }))
        .catch(error => {
          if (item.controller.signal.aborted) return
          patch(item.localId, { error: true })
          toast.error(`${item.file.name}: ${handleAxiosError(error)}`)
        })
    }
  }, [slug])

  const remove = useCallback((localId: string) => {
    setUploads(current => {
      const item = current.find(upload => upload.localId === localId)
      item?.controller.abort()
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl)
      return current.filter(upload => upload.localId !== localId)
    })
  }, [])

  /** After sending: forget the items (the message now owns the attachments). */
  const clear = useCallback(() => {
    uploadsRef.current.forEach(item => item.previewUrl && URL.revokeObjectURL(item.previewUrl))
    setUploads([])
  }, [])

  // Leaving the channel abandons unsent uploads (the server sweeps them later)
  useEffect(() => () => {
    uploadsRef.current.forEach(item => {
      item.controller.abort()
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
    })
    setUploads([])
  }, [slug])

  const ready = uploads.filter(item => item.attachment).map(item => item.attachment as Attachment)
  const busy = uploads.some(item => !item.attachment && !item.error)

  return { uploads, addFiles, remove, clear, ready, busy }
}
