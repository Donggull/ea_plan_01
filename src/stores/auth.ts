import { create } from 'zustand'
import { User } from '@/types'

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (_user: User | null) => void
  setLoading: (_loading: boolean) => void
  signOut: () => void
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  isLoading: true,
  setUser: user => set({ user }),
  setLoading: loading => set({ isLoading: loading }),
  signOut: () => set({ user: null }),
}))
