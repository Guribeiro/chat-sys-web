import { authenticateUser } from '@/http/authenticate-user'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { toast } from 'sonner'
import { handleAxiosError } from '@/lib/axios-error-handler'
import { api } from '@/http/api-client'

interface SigninDTO {
  email: string
  password: string
}

type Auth = {
  token: string
  user: {
    admin: boolean
    id: number
    iddepartamento: number
    name: string
  }
}

interface AuthState {
  auth: Auth | null,
  loading: boolean
  signin: (data: SigninDTO) => Promise<void>
  signout: () => void
}

export const authSlice = create<AuthState>()(
  persist((set) => ({
    auth: JSON.parse(localStorage.getItem('auth-storage')),
    loading: false,
    signin: async ({ email, password }) => {
      try {
        set({ loading: true })
        const { data } = await authenticateUser({ email, password })

        api.defaults.headers.common = { 'Authorization': `bearer ${data.token}` };

        set({ auth: data })
      } catch (error) {
        const message = handleAxiosError(error)
        toast.error(message)
      } finally {
        set({ loading: false })
      }
    },
    signout: () => {
      delete api.defaults.headers.common.Authorization;
      set({ auth: null })
    }
  }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // <-- RE-ADD THIS LINE
      onRehydrateStorage: (state) => {
        // console.log({ state })
        // This function runs when the store is rehydrated from storage.
        // `state` here refers to the state that was loaded from storage.
        return (state, error) => {
          if (error) {
            console.error('An error occurred during rehydration:', error);
          }

          if (state?.auth?.token) {
            api.defaults.headers.common = { 'Authorization': `bearer ${state.auth.token}` };
          }

          return state
          // Optional: You can do something after rehydration is complete
          // For example, if you need to ensure some other initial setup happens.
        };
      },
    },
  )
)
