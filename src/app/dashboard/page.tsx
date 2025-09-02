'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Package,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Calendar,
  Activity,
  Users
} from 'lucide-react'
import { useLocalStorage } from '@/hooks/use-local-storage'

export default function DashboardPage() {
  // 商品データと在庫データを取得
  const [products] = useLocalStorage<any[]>('beauty-salon-products', [])
  const [inventory] = useLocalStorage<any[]>('beauty-salon-inventory', [])
  const [inventoryHistory] = useLocalStorage<any[]>('beauty-salon-inventory-history', [])
  
  // 統計データの計算
  const [stats, setStats] = useState({
    totalProducts: 0,
    inventoryItems: 0,
    outOfStock: 0,
    lowStock: 0,
    totalValue: 0,
    monthlySales: 0,
    recentProducts: [] as any[],
    alerts: [] as any[]
  })

  useEffect(() => {
    // 総商品数
    const totalProducts = products.length

    // 在庫アイテム数（在庫がある商品）
    const inventoryItems = inventory.filter(item => item.current_quantity > 0).length

    // 在庫切れ商品数
    const outOfStock = inventory.filter(item => 
      item.status === 'out' || item.current_quantity === 0
    ).length

    // 在庫少商品数
    const lowStock = inventory.filter(item => 
      item.status === 'low' || (item.current_quantity > 0 && item.current_quantity < 10)
    ).length

    // 在庫総価値（販売価格ベース）
    const totalValue = products.reduce((sum, product) => {
      const inv = inventory.find(i => i.product_id === product.id)
      const quantity = inv?.current_quantity || 0
      return sum + (product.selling_price * quantity)
    }, 0)

    // 今月の売上（在庫履歴から販売数を計算）
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthlySales = inventoryHistory
      .filter(history => {
        const date = new Date(history.created_at)
        return date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear &&
               history.reason === '販売'
      })
      .reduce((sum, history) => {
        const product = products.find(p => p.id === history.product_id)
        return sum + (Math.abs(history.quantity_change) * (product?.selling_price || 0))
      }, 0)

    // 最近登録された商品（最新5件）
    const recentProducts = products
      .slice(-5)
      .reverse()
      .map(product => ({
        ...product,
        inventory: inventory.find(i => i.product_id === product.id)
      }))

    // アラート対象商品
    const alerts = inventory
      .filter(item => item.status === 'out' || item.status === 'low' || item.status === 'expiring')
      .map(item => {
        const product = products.find(p => p.id === item.product_id)
        return {
          ...item,
          product_name: item.product_name || product?.name,
          alertType: item.status === 'out' ? '在庫切れ' : 
                     item.status === 'low' ? '在庫少' : '期限切れ間近'
        }
      })
      .slice(0, 5)

    setStats({
      totalProducts,
      inventoryItems,
      outOfStock,
      lowStock,
      totalValue,
      monthlySales,
      recentProducts,
      alerts
    })
  }, [products, inventory, inventoryHistory])

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-gray-600">商品と在庫の概要を確認できます</p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                総商品数
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                登録済み商品
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                在庫アイテム
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inventoryItems}</div>
              <p className="text-xs text-muted-foreground">
                在庫あり商品
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                要注意商品
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.outOfStock + stats.lowStock}
              </div>
              <p className="text-xs text-muted-foreground">
                在庫切れ: {stats.outOfStock} / 在庫少: {stats.lowStock}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                在庫価値
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ¥{stats.totalValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                販売価格ベース
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 追加の統計カード */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                月間売上
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ¥{stats.monthlySales.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                今月の販売実績
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                カテゴリ数
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(products.map(p => p.category)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                商品カテゴリ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                在庫回転率
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inventoryHistory.length}
              </div>
              <p className="text-xs text-muted-foreground">
                在庫変動履歴
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                仕入先数
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(products.map(p => p.supplier_name).filter(s => s)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                取引先企業
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 最近の活動 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>最近の商品登録</CardTitle>
              <CardDescription>
                新しく登録された商品一覧
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentProducts.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          {product.category} / {product.brand}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">¥{product.selling_price.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">
                          在庫: {product.inventory?.current_quantity || 0}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  まだ商品が登録されていません
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>在庫アラート</CardTitle>
              <CardDescription>
                在庫切れや在庫少の商品
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.alerts.length > 0 ? (
                <div className="space-y-3">
                  {stats.alerts.map((alert, index) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{alert.product_name}</p>
                        <p className="text-sm text-gray-500">
                          現在庫: {alert.current_quantity}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        alert.status === 'out' ? 'bg-red-100 text-red-700' :
                        alert.status === 'low' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {alert.alertType}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  現在アラートはありません
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 在庫状況サマリー */}
        <Card>
          <CardHeader>
            <CardTitle>カテゴリ別在庫状況</CardTitle>
            <CardDescription>
              各カテゴリの在庫数と価値
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from(new Set(products.map(p => p.category))).map(category => {
                const categoryProducts = products.filter(p => p.category === category)
                const categoryInventory = categoryProducts.reduce((sum, product) => {
                  const inv = inventory.find(i => i.product_id === product.id)
                  return sum + (inv?.current_quantity || 0)
                }, 0)
                const categoryValue = categoryProducts.reduce((sum, product) => {
                  const inv = inventory.find(i => i.product_id === product.id)
                  return sum + (product.selling_price * (inv?.current_quantity || 0))
                }, 0)

                return (
                  <div key={category} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
                    <div className="flex-1">
                      <p className="font-medium">{category}</p>
                      <p className="text-sm text-gray-500">
                        {categoryProducts.length}商品
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{categoryInventory}個</p>
                      <p className="text-sm text-gray-500">
                        ¥{categoryValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}