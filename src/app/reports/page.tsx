'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  ShoppingCart,
  FileText,
  Calendar,
  Download
} from 'lucide-react'
import { reportsApi, ReportData } from '@/lib/api'

export default function ReportsPage() {
  const [shopId, setShopId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    const session = localStorage.getItem('beauty-salon-session')
    if (session) {
      const userData = JSON.parse(session)
      setShopId(userData.shopId)
    }
  }, [])

  // 今月の開始日・終了日をデフォルトに設定
  useEffect(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    setStartDate(startOfMonth.toISOString().split('T')[0])
    setEndDate(endOfMonth.toISOString().split('T')[0])
  }, [])

  const { data: reportData, isLoading, refetch } = useQuery<ReportData>({
    queryKey: ['reports', shopId, startDate, endDate],
    queryFn: () => reportsApi.getReports({ shopId, startDate, endDate }),
    enabled: !!shopId
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'IN': return '入庫'
      case 'OUT': return '出庫'
      case 'ADJUSTMENT': return '調整'
      case 'RETURN': return '返品'
      default: return type
    }
  }

  const getMovementTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'IN': return 'bg-green-100 text-green-800'
      case 'OUT': return 'bg-red-100 text-red-800'
      case 'ADJUSTMENT': return 'bg-yellow-100 text-yellow-800'
      case 'RETURN': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">レポート・分析</h1>
        <p className="text-gray-600 mt-2">在庫と発注の分析データです</p>
      </div>

      {/* 期間選択 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            期間設定
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-2">開始日</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">終了日</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
            <Button onClick={() => refetch()}>
              更新
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* サマリーカード */}
      {reportData && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">総商品数</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.summary.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  アクティブ商品数
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">低在庫商品</CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  {reportData.summary.lowStockCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  要注意商品数
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">発注数</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.summary.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  期間内総発注数
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">発注総額</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(reportData.summary.totalOrderValue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  期間内総額
                </p>
              </CardContent>
            </Card>
          </div>

          {/* タブ */}
          <Tabs defaultValue="inventory" className="space-y-4">
            <TabsList>
              <TabsTrigger value="inventory">在庫状況</TabsTrigger>
              <TabsTrigger value="movements">在庫移動</TabsTrigger>
              <TabsTrigger value="stats">統計情報</TabsTrigger>
            </TabsList>

            {/* 低在庫商品 */}
            <TabsContent value="inventory" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>低在庫商品</CardTitle>
                      <CardDescription>
                        在庫が少なくなっている商品の一覧です
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportToCSV(reportData.lowStockItems, 'low_stock_items')}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      CSVエクスポート
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>商品名</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>カテゴリ</TableHead>
                        <TableHead>現在庫数</TableHead>
                        <TableHead>最小在庫数</TableHead>
                        <TableHead>状態</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.lowStockItems.map((item) => (
                        <TableRow key={item.productId}>
                          <TableCell className="font-medium">
                            {item.productName}
                          </TableCell>
                          <TableCell>{item.sku}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>
                            {item.currentStock} {item.unit}
                          </TableCell>
                          <TableCell>
                            {item.minStock} {item.unit}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={item.stockLevel === 'CRITICAL' ? 'destructive' : 'secondary'}
                            >
                              {item.stockLevel === 'CRITICAL' ? '危険' : '注意'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 在庫移動履歴 */}
            <TabsContent value="movements" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>最近の在庫移動</CardTitle>
                      <CardDescription>
                        最新10件の在庫移動履歴です
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportToCSV(reportData.recentMovements, 'recent_movements')}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      CSVエクスポート
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>商品名</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>移動タイプ</TableHead>
                        <TableHead>数量</TableHead>
                        <TableHead>移動前</TableHead>
                        <TableHead>移動後</TableHead>
                        <TableHead>日時</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.recentMovements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell className="font-medium">
                            {movement.productName}
                          </TableCell>
                          <TableCell>{movement.sku}</TableCell>
                          <TableCell>
                            <Badge className={getMovementTypeBadgeColor(movement.movementType)}>
                              {getMovementTypeLabel(movement.movementType)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {movement.movementType === 'OUT' ? '-' : '+'}
                            {movement.quantity}
                          </TableCell>
                          <TableCell>{movement.previousStock}</TableCell>
                          <TableCell>{movement.newStock}</TableCell>
                          <TableCell>{formatDate(movement.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 統計情報 */}
            <TabsContent value="stats" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>カテゴリ別商品数</CardTitle>
                    <CardDescription>
                      各カテゴリの商品登録数
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {reportData.categoryStats.map((stat) => (
                        <div key={stat.name} className="flex justify-between items-center">
                          <span className="font-medium">{stat.name}</span>
                          <Badge variant="secondary">
                            {stat.productCount} 商品
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>サプライヤー別統計</CardTitle>
                    <CardDescription>
                      各サプライヤーの商品数・発注数
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {reportData.supplierStats.map((stat) => (
                        <div key={stat.name} className="border-b pb-2">
                          <div className="font-medium">{stat.name}</div>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>商品: {stat.productCount}</span>
                            <span>発注: {stat.orderCount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}