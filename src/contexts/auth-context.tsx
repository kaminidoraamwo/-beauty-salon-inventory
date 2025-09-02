'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface User {
  id: string
  email: string
  fullName: string
  shopName: string
  loginTime: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // LocalStorageからセッション情報を取得
    const checkSession = () => {
      try {
        const sessionData = localStorage.getItem('beauty-salon-session')
        if (sessionData) {
          const session = JSON.parse(sessionData)
          setUser(session)
        }
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // StorageEventを監視してタブ間でのセッション変更を同期
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'beauty-salon-session') {
        if (e.newValue) {
          try {
            const session = JSON.parse(e.newValue)
            setUser(session)
          } catch (error) {
            console.error('Session sync error:', error)
          }
        } else {
          setUser(null)
        }
      }
    }

    // カスタムイベントを監視（同じタブ内での認証状態変更用）
    const handleAuthChange = () => {
      checkSession()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('auth-changed', handleAuthChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('auth-changed', handleAuthChange)
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('beauty-salon-session')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}