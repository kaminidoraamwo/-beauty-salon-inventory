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
  Search,
  Package,
  Calendar,
  Eye,
  Edit,
  Truck,
  Check,
  X,
  Download,
  Loader2,
  ShoppingCart,
  AlertCircle
} from 'lucide-react'
import { ordersApi, suppliersApi, productsApi, inventoryApi, type Order, type Supplier, type Product } from '@/lib/api'

// Shop IDのハードコード（後で認証システムから取得）
const SHOP_ID = 'shop_test'

export default function OrdersPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showQuickOrder, setShowQuickOrder] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  
  // 新規発注用の状態
  const [orderData, setOrderData] = useState({
    supplierId: '',
    deliveryDate: '',
    notes: '',
  })
  const [orderItems, setOrderItems] = useState<{
    productId: string
    quantity: number
    unitPrice: number
  }[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [itemQuantity, setItemQuantity] = useState('')
  const [itemPrice, setItemPrice] = useState('')

  // データ取得クエリ
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', SHOP_ID, searchTerm, statusFilter, supplierFilter],
    queryFn: () => ordersApi.getOrders({
      shopId: SHOP_ID,
      ...(statusFilter && { status: statusFilter }),
      ...(supplierFilter && { supplierId: supplierFilter }),
    }),
  })

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers', SHOP_ID],
    queryFn: () => suppliersApi.getSuppliers(SHOP_ID),
  })

  const { data: products = [] } = useQuery({
    queryKey: ['products', SHOP_ID],
    queryFn: () => productsApi.getProducts({ shopId: SHOP_ID }),
  })

  // 低在庫商品を取得
  const { data: lowStockItems = [] } = useQuery({
    queryKey: ['inventory', SHOP_ID, 'lowStock'],
    queryFn: () => inventoryApi.getInventory({ shopId: SHOP_ID, lowStock: true }),
  })

  // 発注作成ミューテーション
  const createOrderMutation = useMutation({
    mutationFn: ordersApi.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      setShowCreateModal(false)
      resetOrderForm()
      toast({
        title: '発注を作成しました',
        description: '発注が正常に作成されました。',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'エラー',
        description: error.response?.data?.error || '発注の作成に失敗しました。',
        variant: 'destructive',
      })
    },
  })

  // 発注状態更新ミューテーション
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'PENDING' | 'ORDERED' | 'DELIVERED' | 'CANCELLED' }) =>
      ordersApi.updateOrderStatus(id, { status, userId: 'user_test' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast({
        title: '発注状態を更新しました',
        description: '発注状態が正常に更新されました。',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'エラー',
        description: error.response?.data?.error || '発注状態の更新に失敗しました。',
        variant: 'destructive',
      })
    },
  })

  // 発注詳細取得
  const { data: orderDetail } = useQuery({
    queryKey: ['order', selectedOrder?.id],
    queryFn: () => ordersApi.getOrder(selectedOrder!.id),
    enabled: !!selectedOrder?.id,
  })

  const orders = ordersData?.orders || []

  // フォームリセット
  const resetOrderForm = () => {
    setOrderData({ supplierId: '', deliveryDate: '', notes: '' })
    setOrderItems([])
    setSelectedProduct('')
    setItemQuantity('')
    setItemPrice('')
  }

  // 発注アイテム追加
  const addOrderItem = () => {
    if (!selectedProduct || !itemQuantity || !itemPrice) {
      toast({
        title: 'エラー',
        description: '商品、数量、単価をすべて入力してください。',
        variant: 'destructive',
      })
      return
    }

    const product = products.find(p => p.id === selectedProduct)
    if (!product) return

    const existingItem = orderItems.find(item => item.productId === selectedProduct)
    if (existingItem) {
      toast({
        title: 'エラー',
        description: 'この商品は既に追加されています。',
        variant: 'destructive',
      })
      return
    }

    const newItem = {
      productId: selectedProduct,
      quantity: parseInt(itemQuantity),
      unitPrice: parseFloat(itemPrice),
    }

    setOrderItems([...orderItems, newItem])
    setSelectedProduct('')
    setItemQuantity('')
    setItemPrice('')
  }

  // 発注アイテム削除
  const removeOrderItem = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.productId !== productId))
  }

  // クイック発注（低在庫商品の自動発注）
  const handleQuickOrder = () => {
    if (lowStockItems.length === 0) {
      toast({
        title: '低在庫商品がありません',
        description: '発注が必要な商品がありません。',
      })
      return
    }

    // サプライヤー別にグループ化
    const supplierGroups = lowStockItems.reduce((groups: any, item: any) => {
      const supplierId = item.product.supplierId
      if (!supplierId) return groups
      
      if (!groups[supplierId]) {
        groups[supplierId] = []
      }
      groups[supplierId].push(item)
      return groups
    }, {})

    // 各サプライヤーごとに発注を作成
    Object.entries(supplierGroups).forEach(([supplierId, items]: [string, any[]]) => {
      const orderItems = items.map((item: any) => ({
        productId: item.productId,
        quantity: Math.max(item.product.maxStock || 20, 10), // 最大在庫まで発注
        unitPrice: item.product.costPrice || item.product.price * 0.7, // 仕入価格か販売価格の70%
      }))

      createOrderMutation.mutate({
        supplierId,
        shopId: SHOP_ID,
        userId: 'user_test',
        notes: '低在庫商品の自動発注',
        orderItems,
      })
    })

    setShowQuickOrder(false)
  }

  // 発注作成
  const handleCreateOrder = () => {
    if (!orderData.supplierId || orderItems.length === 0) {
      toast({
        title: 'エラー',
        description: 'サプライヤーと発注商品を選択してください。',
        variant: 'destructive',
      })
      return
    }

    createOrderMutation.mutate({
      supplierId: orderData.supplierId,
      shopId: SHOP_ID,
      userId: 'user_test', // 後で認証システムから取得
      deliveryDate: orderData.deliveryDate || undefined,
      notes: orderData.notes || undefined,
      orderItems,
    })
  }

  // 発注状態の色を取得
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50'
      case 'ORDERED':
        return 'text-blue-600 bg-blue-50'
      case 'DELIVERED':
        return 'text-green-600 bg-green-50'
      case 'CANCELLED':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  // 発注状態のラベルを取得
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '保留中'
      case 'ORDERED':
        return '発注済み'
      case 'DELIVERED':
        return '納品済み'
      case 'CANCELLED':
        return 'キャンセル'
      default:
        return status
    }
  }

  // CSVエクスポート
  const handleExportCSV = () => {
    const headers = [
      '発注番号', 'サプライヤー', '状態', '発注日', '納品予定日', '総額', '商品数', '備考'
    ]
    
    const csvData = orders.map(order => [
      order.orderNumber,
      order.supplier.name,
      getStatusLabel(order.status),
      new Date(order.orderDate).toLocaleDateString('ja-JP'),
      order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('ja-JP') : '',
      `¥${order.totalAmount.toLocaleString()}`,
      order.orderItems?.length || order._count?.orderItems || 0,
      order.notes || ''
    ])
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `発注データ_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const isLoading = createOrderMutation.isPending || updateOrderStatusMutation.isPending

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">発注管理</h1>
            <p className="text-gray-600">商品の発注・納品状況を管理します</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={handleExportCSV}
              variant="outline"
              disabled={orders.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              CSVエクスポート
            </Button>
            <Button 
              onClick={() => setShowQuickOrder(true)}
              className="bg-orange-600 hover:bg-orange-700"
              disabled={isLoading || lowStockItems.length === 0}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              自動発注 ({lowStockItems.length})
            </Button>
            <Button 
              onClick={() => setShowCreateModal(true)}
              variant="outline"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              手動発注
            </Button>
          </div>
        </div>

        {/* 検索・フィルター */}
        <Card>
          <CardHeader>
            <CardTitle>発注検索・フィルター</CardTitle>
            <CardDescription>発注番号で検索、状態・サプライヤーでフィルターできます</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 検索バー */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="発注番号で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* フィルター */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status-filter">状態フィルター</Label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">全ての状態</option>
                    <option value="PENDING">保留中</option>
                    <option value="ORDERED">発注済み</option>
                    <option value="DELIVERED">納品済み</option>
                    <option value="CANCELLED">キャンセル</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier-filter">サプライヤーフィルター</Label>
                  <select
                    id="supplier-filter"
                    value={supplierFilter}
                    onChange={(e) => setSupplierFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">全サプライヤー</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* フィルター結果表示 */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  {orders.length}件表示
                </span>
                {(statusFilter || supplierFilter || searchTerm) && (
                  <button
                    onClick={() => {
                      setStatusFilter('')
                      setSupplierFilter('')
                      setSearchTerm('')
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

        {/* 発注一覧 */}
        <Card>
          <CardHeader>
            <CardTitle>発注一覧（{orders.length}件）</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="text-center py-8">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                <p className="mt-2 text-gray-500">発注データを読み込んでいます...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">
                  {searchTerm || statusFilter || supplierFilter ? '該当する発注が見つかりません' : '発注データがありません'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        発注情報
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        サプライヤー
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        総額
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状態
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        日付
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.orderNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order._count?.orderItems || 0}商品
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.supplier.name}</div>
                          {order.supplier.contactName && (
                            <div className="text-sm text-gray-500">{order.supplier.contactName}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ¥{order.totalAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>発注: {new Date(order.orderDate).toLocaleDateString('ja-JP')}</div>
                          {order.deliveryDate && (
                            <div className="text-gray-500">納期: {new Date(order.deliveryDate).toLocaleDateString('ja-JP')}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowDetailModal(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.status === 'PENDING' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrderStatusMutation.mutate({ id: order.id, status: 'ORDERED' })}
                              className="text-blue-600 hover:text-blue-700"
                              disabled={isLoading}
                            >
                              <Truck className="h-4 w-4" />
                            </Button>
                          )}
                          {order.status === 'ORDERED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrderStatusMutation.mutate({ id: order.id, status: 'DELIVERED' })}
                              className="text-green-600 hover:text-green-700"
                              disabled={isLoading}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          {(order.status === 'PENDING' || order.status === 'ORDERED') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrderStatusMutation.mutate({ id: order.id, status: 'CANCELLED' })}
                              className="text-red-600 hover:text-red-700"
                              disabled={isLoading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
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
        {!ordersLoading && orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">総発注数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">保留中</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {orders.filter(order => order.status === 'PENDING').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">発注済み</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {orders.filter(order => order.status === 'ORDERED').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">総発注額</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ¥{orders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 自動発注確認モーダル */}
        {showQuickOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h3 className="text-lg font-semibold mb-4">自動発注確認</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-orange-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">{lowStockItems.length}個の低在庫商品があります</span>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                  <h4 className="font-medium mb-2">発注予定商品:</h4>
                  <div className="space-y-2">
                    {lowStockItems.slice(0, 10).map((item: any) => (
                      <div key={item.productId} className="flex justify-between text-sm">
                        <span>{item.product.name}</span>
                        <span className="text-red-600">在庫: {item.currentStock}</span>
                      </div>
                    ))}
                    {lowStockItems.length > 10 && (
                      <div className="text-sm text-gray-500">...他{lowStockItems.length - 10}個</div>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>• サプライヤー別に自動的に発注書を作成します</p>
                  <p>• 各商品の最大在庫数まで発注します</p>
                  <p>• 仕入価格が設定されている場合はその価格を使用します</p>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-6">
                <Button 
                  onClick={handleQuickOrder}
                  className="bg-orange-600 hover:bg-orange-700 flex-1"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  自動発注を実行
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowQuickOrder(false)}
                  disabled={isLoading}
                >
                  キャンセル
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 新規発注モーダル */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">新規発注作成</h3>
              
              <div className="space-y-6">
                {/* 発注基本情報 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplier">サプライヤー *</Label>
                    <select
                      id="supplier"
                      value={orderData.supplierId}
                      onChange={(e) => setOrderData({ ...orderData, supplierId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      disabled={isLoading}
                    >
                      <option value="">サプライヤーを選択</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="delivery-date">納品予定日</Label>
                    <Input
                      id="delivery-date"
                      type="date"
                      value={orderData.deliveryDate}
                      onChange={(e) => setOrderData({ ...orderData, deliveryDate: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">備考</Label>
                    <Input
                      id="notes"
                      value={orderData.notes}
                      onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
                      placeholder="発注に関する備考"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* 商品追加フォーム */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-medium mb-4">発注商品</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="product">商品</Label>
                      <select
                        id="product"
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        disabled={isLoading}
                      >
                        <option value="">商品を選択</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.sku})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">数量</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={itemQuantity}
                        onChange={(e) => setItemQuantity(e.target.value)}
                        placeholder="数量"
                        min="1"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit-price">単価（円）</Label>
                      <Input
                        id="unit-price"
                        type="number"
                        step="0.01"
                        value={itemPrice}
                        onChange={(e) => setItemPrice(e.target.value)}
                        placeholder="単価"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2 flex items-end">
                      <Button 
                        onClick={addOrderItem} 
                        disabled={isLoading}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        追加
                      </Button>
                    </div>
                  </div>

                  {/* 発注アイテム一覧 */}
                  {orderItems.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">商品</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">数量</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">単価</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">小計</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orderItems.map((item) => {
                            const product = products.find(p => p.id === item.productId)
                            const subtotal = item.quantity * item.unitPrice
                            return (
                              <tr key={item.productId}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {product?.name}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.quantity} {product?.unit}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ¥{item.unitPrice.toLocaleString()}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  ¥{subtotal.toLocaleString()}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => removeOrderItem(item.productId)}
                                    className="text-red-600 hover:text-red-700"
                                    disabled={isLoading}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan={3} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                              合計:
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-gray-900">
                              ¥{orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toLocaleString()}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2 mt-6 pt-6 border-t">
                <Button 
                  onClick={handleCreateOrder} 
                  className="flex-1"
                  disabled={isLoading || !orderData.supplierId || orderItems.length === 0}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  発注作成
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateModal(false)
                    resetOrderForm()
                  }}
                  disabled={isLoading}
                >
                  キャンセル
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 発注詳細モーダル */}
        {showDetailModal && orderDetail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">発注詳細</h3>
                <Button
                  variant="outline"
                  onClick={() => setShowDetailModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* 発注情報 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">発注番号</Label>
                    <p className="text-sm text-gray-900">{orderDetail.orderNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">サプライヤー</Label>
                    <p className="text-sm text-gray-900">{orderDetail.supplier.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">発注日</Label>
                    <p className="text-sm text-gray-900">
                      {new Date(orderDetail.orderDate).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">納品予定日</Label>
                    <p className="text-sm text-gray-900">
                      {orderDetail.deliveryDate 
                        ? new Date(orderDetail.deliveryDate).toLocaleDateString('ja-JP')
                        : '未設定'
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">状態</Label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(orderDetail.status)}`}>
                      {getStatusLabel(orderDetail.status)}
                    </span>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">発注者</Label>
                    <p className="text-sm text-gray-900">{orderDetail.user.fullName}</p>
                  </div>
                </div>

                {orderDetail.notes && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">備考</Label>
                    <p className="text-sm text-gray-900">{orderDetail.notes}</p>
                  </div>
                )}

                {/* 発注商品一覧 */}
                <div>
                  <h4 className="text-md font-medium mb-4">発注商品</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">商品</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">数量</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">単価</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">小計</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orderDetail.orderItems.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                              <div className="text-sm text-gray-500">SKU: {item.product.sku}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.quantity} {item.product.unit}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              ¥{item.unitPrice.toLocaleString()}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ¥{item.totalPrice.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            合計:
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-900">
                            ¥{orderDetail.totalAmount.toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}