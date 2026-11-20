import { useState } from 'react'
import { Download, FileArchive, FileSpreadsheet, FileText, File as FileIcon } from 'lucide-react'

import type { Attachment } from '@/http/fetch-channel-messages'
import { assetUrl, formatBytes } from '@/lib/asset-url'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog'

const isImage = (attachment: Pick<Attachment, 'mime'>) => attachment.mime.startsWith('image/')

function fileIcon(mime: string) {
  if (mime.includes('spreadsheet') || mime === 'text/csv') return FileSpreadsheet
  if (mime.includes('zip')) return FileArchive
  if (mime === 'application/pdf' || mime.startsWith('text/') || mime.includes('word')) return FileText
  return FileIcon
}

type MessageAttachmentsProps = {
  attachments: Attachment[]
  inverted?: boolean
}

export function MessageAttachments({ attachments, inverted }: MessageAttachmentsProps) {
  const [preview, setPreview] = useState<Attachment | null>(null)
  if (!attachments.length) return null

  const images = attachments.filter(isImage)
  const files = attachments.filter(attachment => !isImage(attachment))

  return (
    <div className="mb-1 flex flex-col gap-1.5">
      {images.length > 0 && (
        <div className={cn('grid gap-1', images.length === 1 ? 'grid-cols-1' : 'grid-cols-2')}>
          {images.map(image => (
            <button
              key={image.id}
              type="button"
              onClick={() => setPreview(image)}
              className="overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label={`Abrir imagem ${image.name}`}
            >
              <img
                src={assetUrl(image.thumbnailUrl ?? image.url)}
                alt={image.name}
                loading="lazy"
                width={image.width ?? undefined}
                height={image.height ?? undefined}
                className={cn(
                  'w-full bg-black/10 object-cover transition-opacity hover:opacity-90',
                  images.length === 1 ? 'max-h-72' : 'aspect-square',
                )}
              />
            </button>
          ))}
        </div>
      )}

      {files.map(file => {
        const Icon = fileIcon(file.mime)
        return (
          <a
            key={file.id}
            href={assetUrl(file.url)}
            download={file.name}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors',
              inverted ? 'bg-black/15 hover:bg-black/25' : 'bg-foreground/[0.06] hover:bg-foreground/10',
            )}
          >
            <Icon className="h-6 w-6 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{file.name}</span>
              <span className="opacity-75">{formatBytes(file.size)}</span>
            </span>
            <Download className="h-4 w-4 shrink-0" />
          </a>
        )
      })}

      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-w-[min(90vw,1100px)] p-2 sm:p-3">
          <DialogTitle className="sr-only">{preview?.name}</DialogTitle>
          <DialogDescription className="sr-only">Visualização da imagem enviada</DialogDescription>
          {preview && (
            <div className="flex flex-col gap-2">
              <img
                src={assetUrl(preview.url)}
                alt={preview.name}
                className="max-h-[80vh] w-full rounded-md object-contain"
              />
              <div className="flex items-center justify-between gap-2 px-1 text-sm">
                <span className="truncate text-muted-foreground">
                  {preview.name} · {formatBytes(preview.size)}
                </span>
                <a
                  href={assetUrl(preview.url)}
                  download={preview.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  <Download className="h-4 w-4" /> Baixar
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
