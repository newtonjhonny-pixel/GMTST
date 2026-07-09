'use client'
import { createContext, useContext, useEffect, useState } from 'react'

interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  sidebarCollapsed: false,
  toggleSidebar: () => {},
})

const THEME_KEY = 'gestaotst-theme'
const SIDEBAR_KEY = 'gestaotst-sidebar-collapsed'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null
    if (saved) setTheme(saved)
    const savedSidebar = localStorage.getItem(SIDEBAR_KEY)
    if (savedSidebar === 'true') setSidebarCollapsed(true)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  const toggleSidebar = () => {
    setSidebarCollapsed(v => {
      localStorage.setItem(SIDEBAR_KEY, String(!v))
      return !v
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, sidebarCollapsed, toggleSidebar }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
