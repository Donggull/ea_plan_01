import { create } from 'zustand'

interface ThemeState {
  isDarkMode: boolean
  toggleTheme: () => void
  setTheme: (_isDark: boolean) => void
}

export const useThemeStore = create<ThemeState>(set => ({
  isDarkMode: false,
  toggleTheme: () =>
    set(state => {
      const newMode = !state.isDarkMode
      if (typeof window !== 'undefined') {
        document.documentElement.classList.toggle('dark', newMode)
        localStorage.setItem('theme', newMode ? 'dark' : 'light')
      }
      return { isDarkMode: newMode }
    }),
  setTheme: isDark =>
    set(() => {
      if (typeof window !== 'undefined') {
        document.documentElement.classList.toggle('dark', isDark)
        localStorage.setItem('theme', isDark ? 'dark' : 'light')
      }
      return { isDarkMode: isDark }
    }),
}))
