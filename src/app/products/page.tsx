'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Camera,
  Download,
  Loader2
} from 'lucide-react'
import { productsApi, categoriesApi, suppliersApi, type Product, type Category, type Supplier } from '@/lib/api'

// Shop IDのハードコード（後で認証システムから取得）
const SHOP_ID = 'shop_test'

export default function ProductsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  // フォーム用の状態
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    barcode: '',
    price: '',
    costPrice: '',
    categoryId: '',
    supplierId: '',
    unit: 'ml',
    minStock: '5',
    maxStock: '50',
  })
  
  // クイック追加用の状態
  const [quickFormData, setQuickFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
  })

  // データ取得クエリ
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', SHOP_ID, searchTerm, categoryFilter],
    queryFn: () => productsApi.getProducts({
      shopId: SHOP_ID,
      ...(categoryFilter && { categoryId: categoryFilter }),
      ...(searchTerm && { search: searchTerm }),
    }),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', SHOP_ID],
    queryFn: () => categoriesApi.getCategories(SHOP_ID),
  })

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers', SHOP_ID],
    queryFn: () => suppliersApi.getSuppliers(SHOP_ID),
  })

  // 商品作成ミューテーション
  const createProductMutation = useMutation({
    mutationFn: productsApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      resetForm()
      toast({
        title: '商品を追加しました',
        description: '商品が正常に登録されました。',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'エラー',
        description: error.response?.data?.error || '商品の作成に失敗しました。',
        variant: 'destructive',
      })
    },
  })

  // 商品更新ミューテーション
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => 
      productsApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      resetForm()
      toast({
        title: '商品を更新しました',
        description: '商品情報が正常に更新されました。',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'エラー',
        description: error.response?.data?.error || '商品の更新に失敗しました。',
        variant: 'destructive',
      })
    },
  })

  // 商品削除ミューテーション
  const deleteProductMutation = useMutation({
    mutationFn: productsApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast({
        title: '商品を削除しました',
        description: '商品が正常に削除されました。',
        variant: 'destructive',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'エラー',
        description: error.response?.data?.error || '商品の削除に失敗しました。',
        variant: 'destructive',
      })
    },
  })

  // クイック追加処理
  const handleQuickAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!quickFormData.name || !quickFormData.categoryId) {
      toast({
        title: 'エラー',
        description: '商品名とカテゴリは必須です。',
        variant: 'destructive',
      })
      return
    }

    createProductMutation.mutate({
      name: quickFormData.name,
      price: parseFloat(quickFormData.price) || 0,
      categoryId: quickFormData.categoryId,
      shopId: SHOP_ID,
      unit: '個',
      minStock: 5,
      isActive: true,
    })
  }

  // 商品追加処理
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.categoryId) {
      toast({
        title: 'エラー',
        description: '必須項目を入力してください。',
        variant: 'destructive',
      })
      return
    }

    createProductMutation.mutate({
      name: formData.name,
      description: formData.description || undefined,
      sku: formData.sku,
      barcode: formData.barcode || undefined,
      price: parseFloat(formData.price) || 0,
      costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
      categoryId: formData.categoryId,
      supplierId: formData.supplierId || undefined,
      shopId: SHOP_ID,
      unit: formData.unit,
      minStock: parseInt(formData.minStock) || 0,
      maxStock: formData.maxStock ? parseInt(formData.maxStock) : undefined,
      isActive: true,
    })
  }

  // 商品更新処理
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingProduct || !formData.name || !formData.categoryId) {
      toast({
        title: 'エラー',
        description: '必須項目を入力してください。',
        variant: 'destructive',
      })
      return
    }

    updateProductMutation.mutate({
      id: editingProduct.id,
      data: {
        name: formData.name,
        description: formData.description || undefined,
        sku: formData.sku,
        barcode: formData.barcode || undefined,
        price: parseFloat(formData.price) || 0,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
        categoryId: formData.categoryId,
        supplierId: formData.supplierId || undefined,
        unit: formData.unit,
        minStock: parseInt(formData.minStock) || 0,
        maxStock: formData.maxStock ? parseInt(formData.maxStock) : undefined,
      }
    })
  }

  // フォームリセット
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sku: '',
      barcode: '',
      price: '',
      costPrice: '',
      categoryId: '',
      supplierId: '',
      unit: 'ml',
      minStock: '5',
      maxStock: '50',
    })
    setQuickFormData({
      name: '',
      categoryId: '',
      price: '',
    })
    setEditingProduct(null)
    setShowAddForm(false)
    setShowQuickAdd(false)
  }

  // 商品編集処理
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      sku: product.sku,
      barcode: product.barcode || '',
      price: product.price.toString(),
      costPrice: product.costPrice?.toString() || '',
      categoryId: product.categoryId,
      supplierId: product.supplierId || '',
      unit: product.unit,
      minStock: product.minStock.toString(),
      maxStock: product.maxStock?.toString() || '',
    })
    setShowAddForm(true)
  }

  // 商品削除処理
  const handleDeleteProduct = (product: Product) => {
    if (window.confirm(`「${product.name}」を削除してもよろしいですか？`)) {
      deleteProductMutation.mutate(product.id)
    }
  }

  // CSVエクスポート機能
  const handleExportCSV = () => {
    const headers = [
      '商品名', 'SKU', 'カテゴリ', '単位', '販売価格', '仕入価格', 'サプライヤー', '説明'
    ]
    
    const csvData = products.map(product => [
      product.name,
      product.sku,
      product.category.name,
      product.unit,
      product.price,
      product.costPrice || '',
      product.supplier?.name || '',
      product.description || ''
    ])
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `商品データ_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const isLoading = createProductMutation.isPending || updateProductMutation.isPending || deleteProductMutation.isPending

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">商品管理</h1>
            <p className="text-gray-600">商品の登録・編集・削除を行います</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={handleExportCSV}
              variant="outline"
              disabled={products.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              CSVエクスポート
            </Button>
            <Button 
              onClick={() => setShowQuickAdd(true)}
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              クイック追加
            </Button>
            <Button 
              onClick={() => setShowAddForm(true)}
              variant="outline"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              詳細追加
            </Button>
          </div>
        </div>

        {/* 検索・フィルター */}
        <Card>
          <CardHeader>
            <CardTitle>商品検索・フィルター</CardTitle>
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
                  {products.length}件表示
                </span>
                {(categoryFilter || searchTerm) && (
                  <button
                    onClick={() => {
                      setCategoryFilter('')
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

        {/* クイック商品追加フォーム */}
        {showQuickAdd && (
          <Card>
            <CardHeader>
              <CardTitle>クイック商品追加</CardTitle>
              <CardDescription>
                最低限の情報で素早く商品を追加できます
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleQuickAddProduct} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quick-name">商品名 *</Label>
                    <Input
                      id="quick-name"
                      value={quickFormData.name}
                      onChange={(e) => setQuickFormData({ ...quickFormData, name: e.target.value })}
                      placeholder="商品名を入力"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quick-categoryId">カテゴリ *</Label>
                    <select
                      id="quick-categoryId"
                      value={quickFormData.categoryId}
                      onChange={(e) => setQuickFormData({ ...quickFormData, categoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      required
                      disabled={isLoading}
                    >
                      <option value="">カテゴリを選択</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quick-price">価格（円）</Label>
                    <Input
                      id="quick-price"
                      type="number"
                      step="0.01"
                      value={quickFormData.price}
                      onChange={(e) => setQuickFormData({ ...quickFormData, price: e.target.value })}
                      placeholder="1000"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    商品を追加
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} disabled={isLoading}>
                    キャンセル
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 商品追加・編集フォーム */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingProduct ? '商品情報編集' : '新規商品登録'}</CardTitle>
              <CardDescription>
                {editingProduct ? '商品情報を編集します' : '新しい商品を登録します'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">商品名 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="商品名を入力"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU (省略可)</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="空欄の場合は自動生成されます"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">カテゴリ *</Label>
                    <select
                      id="categoryId"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      required
                      disabled={isLoading}
                    >
                      <option value="">カテゴリを選択</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplierId">サプライヤー</Label>
                    <select
                      id="supplierId"
                      value={formData.supplierId}
                      onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
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
                    <Label htmlFor="price">販売価格（円）</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="2400"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="costPrice">仕入価格（円）</Label>
                    <Input
                      id="costPrice"
                      type="number"
                      step="0.01"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                      placeholder="1200"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">単位</Label>
                    <select
                      id="unit"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      disabled={isLoading}
                    >
                      <option value="ml">ml</option>
                      <option value="g">g</option>
                      <option value="個">個</option>
                      <option value="本">本</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode">バーコード</Label>
                    <Input
                      id="barcode"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      placeholder="バーコード番号"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minStock">最小在庫数</Label>
                    <Input
                      id="minStock"
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                      placeholder="5"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxStock">最大在庫数</Label>
                    <Input
                      id="maxStock"
                      type="number"
                      value={formData.maxStock}
                      onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
                      placeholder="50"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">説明</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="商品の説明"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingProduct ? '商品を更新' : '商品を登録'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} disabled={isLoading}>
                    キャンセル
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 商品一覧 */}
        <Card>
          <CardHeader>
            <CardTitle>登録商品一覧（{products.length}件）</CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                <p className="mt-2 text-gray-500">商品データを読み込んでいます...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">
                  {searchTerm || categoryFilter ? '該当する商品が見つかりません' : '商品が登録されていません'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card key={product.id} className="border">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                            title="編集"
                            disabled={isLoading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteProduct(product)}
                            title="削除"
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">カテゴリ:</span>
                          <span>{product.category.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">単位:</span>
                          <span>{product.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">販売価格:</span>
                          <span className="font-semibold">¥{product.price.toLocaleString()}</span>
                        </div>
                        {product.costPrice && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">仕入価格:</span>
                            <span>¥{product.costPrice.toLocaleString()}</span>
                          </div>
                        )}
                        {product.supplier && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">サプライヤー:</span>
                            <span className="text-xs">{product.supplier.name}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">在庫:</span>
                          <span className={`font-medium ${
                            (product.inventory?.[0]?.currentStock || 0) <= product.minStock 
                              ? 'text-red-600' 
                              : 'text-green-600'
                          }`}>
                            {product.inventory?.[0]?.currentStock || 0}
                          </span>
                        </div>
                        {product.description && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            {product.description}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 統計情報 */}
        {!productsLoading && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">総商品数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">平均販売価格</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ¥{Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">カテゴリ数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{categories.length}</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  )
}