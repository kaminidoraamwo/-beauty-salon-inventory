'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { 
  Plus,
  Minus,
  Search,
  Package,
  AlertTriangle,
  History,
  Download,
  Filter,
  Loader2
} from 'lucide-react'
import { inventoryApi, categoriesApi, type InventoryItem } from '@/lib/api'

// Shop IDのハードコード（後で認証システムから取得）
const SHOP_ID = 'shop_test'

export default function InventoryPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showLowStock, setShowLowStock] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [stockChange, setStockChange] = useState('')
  const [movementType, setMovementType] = useState<'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN'>('IN')
  const [reason, setReason] = useState('')
  
  // データ取得クエリ
  const { data: inventory = [], isLoading: inventoryLoading } = useQuery({
    queryKey: ['inventory', SHOP_ID, searchTerm, categoryFilter, showLowStock],
    queryFn: () => inventoryApi.getInventory({
      shopId: SHOP_ID,
      ...(categoryFilter && { categoryId: categoryFilter }),
      ...(searchTerm && { search: searchTerm }),
      ...(showLowStock && { lowStock: true }),
    }),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', SHOP_ID],
    queryFn: () => categoriesApi.getCategories(SHOP_ID),
  })

  // 在庫更新ミューテーション
  const updateStockMutation = useMutation({
    mutationFn: inventoryApi.updateStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      setShowStockModal(false)
      setSelectedItem(null)
      setStockChange('')
      setReason('')
      toast({
        title: '在庫を更新しました',
        description: '在庫数が正常に更新されました。',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'エラー',
        description: error.response?.data?.error || '在庫の更新に失敗しました。',
        variant: 'destructive',
      })
    },
  })

  // 在庫更新処理
  const handleStockUpdate = () => {
    if (!selectedItem || !stockChange) {
      toast({
        title: 'エラー',
        description: '必須項目を入力してください。',
        variant: 'destructive',
      })
      return
    }

    const quantity = parseInt(stockChange)
    if (isNaN(quantity)) {
      toast({
        title: 'エラー',
        description: '数量は数字で入力してください。',
        variant: 'destructive',
      })
      return
    }

    updateStockMutation.mutate({
      productId: selectedItem.productId,
      shopId: SHOP_ID,
      quantity: Math.abs(quantity),
      movementType,
      reason: reason || undefined,
      userId: 'user_test', // 後で認証システムから取得
    })
  }

  // 在庫モーダルを開く
  const openStockModal = (item: InventoryItem, type: 'IN' | 'OUT' | 'ADJUSTMENT') => {
    setSelectedItem(item)
    setMovementType(type)
    setStockChange('')
    setReason('')
    setShowStockModal(true)
  }

  // CSVエクスポート機能
  const handleExportCSV = () => {
    const headers = [
      '商品名', 'SKU', 'カテゴリ', '現在庫数', '予約在庫', '利用可能在庫', '最小在庫', '最大在庫', '在庫状態', '単位'
    ]
    
    const csvData = inventory.map(item => [
      item.product.name,
      item.product.sku,
      item.product.category.name,
      item.currentStock,
      item.reservedStock,
      item.availableStock || (item.currentStock - item.reservedStock),
      item.product.minStock,
      item.product.maxStock || '',
      item.stockLevel || 'NORMAL',
      item.product.unit
    ])
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `在庫データ_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 在庫レベルの色を取得
  const getStockLevelColor = (item: InventoryItem) => {
    const level = item.stockLevel || (item.currentStock <= item.product.minStock ? 'LOW' : 'NORMAL')
    switch (level) {
      case 'LOW':
        return 'text-red-600 bg-red-50'
      case 'HIGH':
        return 'text-orange-600 bg-orange-50'
      default:
        return 'text-green-600 bg-green-50'
    }
  }

  // 在庫レベルのラベルを取得
  const getStockLevelLabel = (item: InventoryItem) => {
    const level = item.stockLevel || (item.currentStock <= item.product.minStock ? 'LOW' : 'NORMAL')
    switch (level) {
      case 'LOW':
        return '不足'
      case 'HIGH':
        return '過多'
      default:
        return '正常'
    }
  }

  const isLoading = updateStockMutation.isPending

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">在庫管理</h1>
            <p className="text-gray-600">商品の在庫状況を確認・更新します</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={handleExportCSV}
              variant="outline"
              disabled={inventory.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              CSVエクスポート
            </Button>
            <Button 
              onClick={() => setShowLowStock(!showLowStock)}
              variant={showLowStock ? "default" : "outline"}
              className={showLowStock ? "bg-red-600 hover:bg-red-700" : ""}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              {showLowStock ? '全て表示' : '不足在庫のみ'}
            </Button>
          </div>
        </div>

        {/* 検索・フィルター */}
        <Card>
          <CardHeader>
            <CardTitle>在庫検索・フィルター</CardTitle>
            <CardDescription>商品名・SKUで検索、カテゴリでフィルターできます</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 検索バー */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="商品名、SKUで検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* カテゴリフィルター */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category-filter">カテゴリフィルター</Label>
                  <select
                    id="category-filter"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">全カテゴリ</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* フィルター結果表示 */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  {inventory.length}件表示
                  {showLowStock && ' （不足在庫のみ）'}
                </span>
                {(categoryFilter || searchTerm || showLowStock) && (
                  <button
                    onClick={() => {
                      setCategoryFilter('')
                      setSearchTerm('')
                      setShowLowStock(false)
                    }}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    フィルターをクリア
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 在庫一覧 */}
        <Card>
          <CardHeader>
            <CardTitle>在庫一覧（{inventory.length}件）</CardTitle>
          </CardHeader>
          <CardContent>
            {inventoryLoading ? (
              <div className="text-center py-8">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                <p className="mt-2 text-gray-500">在庫データを読み込んでいます...</p>
              </div>
            ) : inventory.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">
                  {searchTerm || categoryFilter || showLowStock ? '該当する在庫が見つかりません' : '在庫データがありません'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        商品情報
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        現在庫
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        予約在庫
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        利用可能
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状態
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inventory.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              SKU: {item.product.sku} | {item.product.category.name}
                            </div>
                            {item.product.supplier && (
                              <div className="text-xs text-gray-400">
                                {item.product.supplier.name}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.currentStock} {item.product.unit}
                          </div>
                          <div className="text-xs text-gray-500">
                            最小: {item.product.minStock}
                            {item.product.maxStock && ` / 最大: ${item.product.maxStock}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.reservedStock} {item.product.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.availableStock || (item.currentStock - item.reservedStock)} {item.product.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockLevelColor(item)}`}>
                            {getStockLevelLabel(item)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openStockModal(item, 'IN')}
                            className="text-green-600 hover:text-green-700"
                            disabled={isLoading}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openStockModal(item, 'OUT')}
                            className="text-red-600 hover:text-red-700"
                            disabled={isLoading || item.currentStock <= 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openStockModal(item, 'ADJUSTMENT')}
                            className="text-blue-600 hover:text-blue-700"
                            disabled={isLoading}
                          >
                            調整
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 統計情報 */}
        {!inventoryLoading && inventory.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">総商品数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inventory.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">在庫不足</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {inventory.filter(item => 
                    (item.stockLevel === 'LOW' || item.currentStock <= item.product.minStock)
                  ).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">総在庫数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {inventory.reduce((sum, item) => sum + item.currentStock, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">予約在庫数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {inventory.reduce((sum, item) => sum + item.reservedStock, 0)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 在庫更新モーダル */}
        {showStockModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                在庫{movementType === 'IN' ? '入庫' : movementType === 'OUT' ? '出庫' : '調整'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="font-medium">{selectedItem.product.name}</p>
                  <p className="text-sm text-gray-500">
                    現在庫: {selectedItem.currentStock} {selectedItem.product.unit}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stock-change">
                    {movementType === 'ADJUSTMENT' ? '調整後の在庫数' : '数量'}
                  </Label>
                  <Input
                    id="stock-change"
                    type="number"
                    value={stockChange}
                    onChange={(e) => setStockChange(e.target.value)}
                    placeholder={movementType === 'ADJUSTMENT' ? '新しい在庫数を入力' : '変更する数量を入力'}
                    min="0"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reason">理由（任意）</Label>
                  <Input
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="在庫変更の理由を入力"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="flex space-x-2 mt-6">
                <Button 
                  onClick={handleStockUpdate} 
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  更新
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowStockModal(false)}
                  disabled={isLoading}
                >
                  キャンセル
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}