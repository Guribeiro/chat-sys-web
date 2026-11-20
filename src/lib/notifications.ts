/** Thin wrapper over the browser Notification API (desktop notifications while the tab is hidden). */
export const notificationsSupported = typeof window !== 'undefined' && 'Notification' in window

export function notificationPermission(): NotificationPermission | 'unsupported' {
  return notificationsSupported ? Notification.permission : 'unsupported'
}

/** Must be called from a user gesture (click), browsers ignore or penalize automatic prompts. */
export async function requestNotificationPermission() {
  if (!notificationsSupported) return 'unsupported' as const
  if (Notification.permission !== 'default') return Notification.permission
  return Notification.requestPermission()
}

type ShowOptions = {
  title: string
  body: string
  /** Same tag replaces the previous notification (one per conversation instead of a pile) */
  tag: string
  icon?: string
  onClick?: () => void
}

export function showNotification({ title, body, tag, icon, onClick }: ShowOptions) {
  if (notificationPermission() !== 'granted') return
  try {
    const notification = new Notification(title, { body, tag, icon: icon ?? '/favicon.svg' })
    notification.onclick = () => {
      window.focus()
      onClick?.()
      notification.close()
    }
  } catch {
    // Some mobile browsers only allow notifications from a service worker: the toast is enough there
  }
}
