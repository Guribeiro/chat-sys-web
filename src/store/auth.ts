import { authenticateUser } from '@/http/authenticate-user'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { toast } from 'sonner'
import { handleAxiosError } from '@/lib/axios-error-handler'
import { api, setupAuthRefresh } from '@/http/api-client'
import { logoutSession, refreshSession, type SessionUser } from '@/http/session'
import { disconnectSocket, onSocketUnauthorized, setSocketToken } from '@/socket'

interface SigninDTO {
  email: string
  password: string
}

type Auth = {
  token: string
  /** Missing for sessions stored before refresh tokens existed: those just sign in again */
  refreshToken?: string
  user: SessionUser
}

interface AuthState {
  auth: Auth | null,
  loading: boolean
  signin: (data: SigninDTO) => Promise<void>
  signout: () => void
  /** Gets a new access token; returns null (and signs out) when the session is over */
  refresh: () => Promise<string | null>
  updateUser: (user: Partial<SessionUser>) => void
}

function applyToken(token: string | null) {
  if (token) api.defaults.headers.common.Authorization = `bearer ${token}`
  else delete api.defaults.headers.common.Authorization
  setSocketToken(token)
}

export const authSlice = create<AuthState>()(
  persist((set, get) => ({
    auth: null,
    loading: false,
    signin: async ({ email, password }) => {
      try {
        set({ loading: true })
        const { data } = await authenticateUser({ email, password })
        applyToken(data.token)
        set({ auth: data })
      } catch (error) {
        const message = handleAxiosError(error)
        toast.error(message)
      } finally {
        set({ loading: false })
      }
    },
    signout: () => {
      const refreshToken = get().auth?.refreshToken
      // Revoke server side too (best effort), so the refresh token can not be reused
      if (refreshToken) logoutSession(refreshToken).catch(() => { })
      applyToken(null)
      disconnectSocket()
      set({ auth: null })
    },
    refresh: async () => {
      const refreshToken = get().auth?.refreshToken
      if (!refreshToken) {
        get().signout()
        return null
      }
      try {
        const session = await refreshSession(refreshToken)
        applyToken(session.token)
        set({ auth: session })
        return session.token
      } catch {
        toast.error('Sua sessão expirou. Entre novamente.')
        get().signout()
        return null
      }
    },
    updateUser: (user) => {
      const auth = get().auth
      if (auth) set({ auth: { ...auth, user: { ...auth.user, ...user } } })
    },
  }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ auth: state.auth }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('An error occurred during rehydration:', error);
          }
          if (state?.auth?.token) applyToken(state.auth.token)
        };
      },
    },
  )
)

setupAuthRefresh(() => authSlice.getState().refresh())
onSocketUnauthorized(() => authSlice.getState().refresh())
