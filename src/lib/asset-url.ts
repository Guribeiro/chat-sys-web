const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

/** Uploaded files come as API-relative paths (`/uploads/...`); resolve them against the API origin. */
export function assetUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  return path.startsWith('/') ? `${API_URL}${path}` : path
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
