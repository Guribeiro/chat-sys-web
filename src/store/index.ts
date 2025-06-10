import { create } from 'zustand'

import { authSlice } from './auth'

export const useStore = create(() => ({
  ...authSlice()
}))
