import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/** Per-device preferences (a laptop may want desktop notifications, a shared screen may not). */
interface PreferencesState {
  desktopNotifications: boolean
  /** The "enable notifications" hint in the activity panel was dismissed */
  notificationsHintDismissed: boolean
  setDesktopNotifications: (enabled: boolean) => void
  dismissNotificationsHint: () => void
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      desktopNotifications: false,
      notificationsHintDismissed: false,
      setDesktopNotifications: (desktopNotifications) => set({ desktopNotifications }),
      dismissNotificationsHint: () => set({ notificationsHintDismissed: true }),
    }),
    {
      name: 'preferences',
      // localStorage may be unavailable (private mode, blocked storage): fall back to memory
      storage: createJSONStorage(() => {
        try {
          window.localStorage.getItem('preferences')
          return window.localStorage
        } catch {
          const memory = new Map<string, string>()
          return {
            getItem: (key) => memory.get(key) ?? null,
            setItem: (key, value) => void memory.set(key, value),
            removeItem: (key) => void memory.delete(key),
          }
        }
      }),
    },
  ),
)
