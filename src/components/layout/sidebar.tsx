'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Home,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  FileSpreadsheet
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'

const sidebarItems = [
  {
    title: 'ダッシュボード',
    href: '/dashboard',
    icon: Home
  },
  {
    title: '商品管理',
    href: '/products',
    icon: Package
  },
  {
    title: '在庫管理',
    href: '/inventory',
    icon: ShoppingCart
  },
  {
    title: '在庫一覧表',
    href: '/stock-list',
    icon: FileSpreadsheet
  },
  {
    title: '発注管理',
    href: '/orders',
    icon: Package
  },
  {
    title: 'レポート',
    href: '/reports',
    icon: BarChart3
  },
  {
    title: '設定',
    href: '/settings',
    icon: Settings
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push('/auth')
  }

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* ロゴエリア */}
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold text-gray-900">
          Beauty Salon Inventory
        </h1>
      </div>

      {/* ナビゲーションメニュー */}
      <nav className="flex-1 space-y-1 p-4">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100',
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-gray-900'
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* ログアウトボタン */}
      <div className="border-t p-4">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          ログアウト
        </Button>
      </div>
    </div>
  )
}