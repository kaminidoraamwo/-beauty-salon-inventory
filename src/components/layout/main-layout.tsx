'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Sidebar } from './sidebar'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* モバイル用サイドバーオーバーレイ */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* サイドバー */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:z-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar />
      </div>

      {/* メインコンテンツエリア */}
      <div className="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
        {/* ヘッダー */}
        <header className="bg-white border-b h-16 flex items-center px-4 lg:px-6">
          {/* ハンバーガーメニューボタン（モバイルのみ） */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-4 lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          <div className="flex-1">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
              美容室商品管理システム
            </h2>
          </div>
          <div className="flex items-center space-x-2 lg:space-x-4">
            <span className="text-xs lg:text-sm text-gray-600 hidden sm:inline">
              ようこそ、{user.fullName}さん ({user.shopName})
            </span>
            <span className="text-xs text-gray-600 sm:hidden">
              {user.fullName}
            </span>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}