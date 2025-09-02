'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Download,
  Save,
  FileSpreadsheet,
  Search,
  ChevronDown,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useToast } from '@/hooks/use-toast'

interface StockItem {
  id: string
  name: string
  category: string
  initial_stock: number
  in_stock: number
  out_stock: number
  sold_stock: number
  external_transfer: number
  current_stock: number
  sortOrder?: number
}

export default function StockListPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [sortMode, setSortMode] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  
  // 商品データと在庫データを取得
  const [products] = useLocalStorage<any[]>('beauty-salon-products', [])
  const [inventory, setInventory] = useLocalStorage<any[]>('beauty-salon-inventory', [])
  const [stockData, setStockData] = useState<StockItem[]>([])
  const [editedData, setEditedData] = useState<StockItem[]>([])

  // カテゴリ一覧（順番指定）
  const categoryOrder = [
    'カラー剤',
    'ヘアマニキュア', 
    'ブリーチ剤',
    'パーマ剤',
    '２液',
    '矯正剤',
    'エステル剤',
    'シャンプー',
    'トリートメント',
    'アウトバス',
    'ヘアケア剤',
    'スタイリング剤',
    '電化製品',
    'その他'
  ]

  // 在庫データを初期化
  useEffect(() => {
    const initialStockData: StockItem[] = products.map((product, index) => {
      const inv = inventory.find(i => i.product_id === product.id)
      return {
        id: product.id,
        name: product.name,
        category: product.category || 'その他',
        initial_stock: inv?.initial_stock || 0,
        in_stock: inv?.in_stock || 0,
        out_stock: inv?.out_stock || 0,
        sold_stock: inv?.sold_stock || 0,
        external_transfer: inv?.external_transfer || 0,
        current_stock: inv?.current_quantity || 0,
        sortOrder: inv?.sortOrder || index
      }
    })
    setStockData(initialStockData)
    setEditedData(initialStockData)
    
    // 初期状態で全カテゴリを展開
    const categories = new Set(initialStockData.map(item => item.category))
    setExpandedCategories(categories)
  }, [products, inventory])

  // フィルタリング
  const filteredStock = editedData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // カテゴリごとにグループ化
  const groupedStock = categoryOrder.reduce((acc, category) => {
    const items = filteredStock
      .filter(item => item.category === category)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    if (items.length > 0) {
      acc[category] = items
    }
    return acc
  }, {} as Record<string, StockItem[]>)

  // カテゴリの展開/折りたたみ
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  // 全カテゴリ展開/折りたたみ
  const toggleAllCategories = () => {
    if (expandedCategories.size === Object.keys(groupedStock).length) {
      setExpandedCategories(new Set())
    } else {
      setExpandedCategories(new Set(Object.keys(groupedStock)))
    }
  }

  // 編集モード切り替え
  const toggleEditMode = () => {
    setEditMode(!editMode)
    setSortMode(false)
    if (!editMode) {
      setEditedData([...stockData])
    }
  }

  // 並び替えモード切り替え
  const toggleSortMode = () => {
    setSortMode(!sortMode)
    setEditMode(false)
  }

  // データ更新
  const handleCellChange = (id: string, field: keyof StockItem, value: string) => {
    const numValue = parseInt(value) || 0
    setEditedData(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: numValue }
        // 現在庫を自動計算（外部移動は現在庫から引く）
        if (field !== 'current_stock' && field !== 'id' && field !== 'name' && field !== 'category' && field !== 'sortOrder') {
          updated.current_stock = updated.initial_stock + updated.in_stock - updated.out_stock - updated.sold_stock - updated.external_transfer
        }
        return updated
      }
      return item
    }))
  }

  // 並び順変更
  const moveItem = (category: string, fromIndex: number, direction: 'up' | 'down') => {
    const categoryItems = groupedStock[category]
    if (!categoryItems) return
    
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
    if (toIndex < 0 || toIndex >= categoryItems.length) return
    
    const newItems = [...categoryItems]
    const temp = newItems[fromIndex]
    newItems[fromIndex] = newItems[toIndex]
    newItems[toIndex] = temp
    
    // sortOrderを更新
    newItems.forEach((item, index) => {
      item.sortOrder = index
    })
    
    // 全体のデータを更新
    setEditedData(prev => {
      const updated = [...prev]
      newItems.forEach(item => {
        const index = updated.findIndex(i => i.id === item.id)
        if (index !== -1) {
          updated[index] = item
        }
      })
      return updated
    })
  }

  // 保存処理
  const handleSave = () => {
    // 在庫データを更新
    const updatedInventory = inventory.map(inv => {
      const stockItem = editedData.find(item => item.id === inv.product_id)
      if (stockItem) {
        return {
          ...inv,
          initial_stock: stockItem.initial_stock,
          in_stock: stockItem.in_stock,
          out_stock: stockItem.out_stock,
          sold_stock: stockItem.sold_stock,
          external_transfer: stockItem.external_transfer,
          current_quantity: stockItem.current_stock,
          sortOrder: stockItem.sortOrder,
          last_updated: new Date().toISOString()
        }
      }
      return inv
    })

    // 新規商品の在庫データを追加
    editedData.forEach(item => {
      if (!inventory.find(inv => inv.product_id === item.id)) {
        updatedInventory.push({
          id: Date.now().toString() + Math.random(),
          product_id: item.id,
          product_name: item.name,
          category: item.category,
          initial_stock: item.initial_stock,
          in_stock: item.in_stock,
          out_stock: item.out_stock,
          sold_stock: item.sold_stock,
          external_transfer: item.external_transfer,
          current_quantity: item.current_stock,
          sortOrder: item.sortOrder,
          status: item.current_stock === 0 ? 'out' : item.current_stock < 10 ? 'low' : 'normal',
          last_updated: new Date().toISOString()
        })
      }
    })

    setInventory(updatedInventory)
    setStockData([...editedData])
    setEditMode(false)
    setSortMode(false)

    toast({
      title: '保存完了',
      description: '在庫データを保存しました。'
    })
  }

  // CSVエクスポート
  const handleExportCSV = () => {
    const headers = ['カテゴリ', '商品名', '月初在庫', '入荷数', '出庫数', '販売数', '外部移動', '現在庫']
    const csvData: any[] = []
    
    Object.entries(groupedStock).forEach(([category, items]) => {
      items.forEach(item => {
        csvData.push([
          category,
          item.name,
          item.initial_stock,
          item.in_stock,
          item.out_stock,
          item.sold_stock,
          item.external_transfer,
          item.current_stock
        ])
      })
    })
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `在庫一覧_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // カテゴリごとの合計計算
  const getCategoryTotal = (items: StockItem[]) => ({
    initial: items.reduce((sum, item) => sum + item.initial_stock, 0),
    in: items.reduce((sum, item) => sum + item.in_stock, 0),
    out: items.reduce((sum, item) => sum + item.out_stock, 0),
    sold: items.reduce((sum, item) => sum + item.sold_stock, 0),
    external: items.reduce((sum, item) => sum + item.external_transfer, 0),
    current: items.reduce((sum, item) => sum + item.current_stock, 0)
  })

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">在庫一覧表</h1>
            <p className="text-gray-600">カテゴリ別の在庫状況を管理</p>
          </div>
          <div className="flex space-x-2">
            {(editMode || sortMode) ? (
              <>
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  保存
                </Button>
                <Button onClick={() => { setEditMode(false); setSortMode(false) }} variant="outline">
                  キャンセル
                </Button>
              </>
            ) : (
              <>
                <Button onClick={toggleSortMode} variant="outline">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  並び替え
                </Button>
                <Button onClick={toggleEditMode}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  編集モード
                </Button>
                <Button onClick={handleExportCSV} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  CSVエクスポート
                </Button>
              </>
            )}
          </div>
        </div>

        {/* 検索バーとカテゴリ展開ボタン */}
        <div className="flex space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="商品名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={toggleAllCategories} variant="outline">
            {expandedCategories.size === Object.keys(groupedStock).length ? '全て折りたたむ' : '全て展開'}
          </Button>
        </div>

        {/* カテゴリ別在庫一覧表 */}
        {Object.entries(groupedStock).map(([category, items]) => {
          const isExpanded = expandedCategories.has(category)
          const totals = getCategoryTotal(items)
          
          return (
            <Card key={category}>
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => toggleCategory(category)}
              >
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    {isExpanded ? <ChevronDown className="h-5 w-5 mr-2" /> : <ChevronRight className="h-5 w-5 mr-2" />}
                    {category} ({items.length}商品)
                  </div>
                  <div className="text-sm font-normal text-gray-600">
                    現在庫合計: <span className="font-bold text-lg">{totals.current}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              
              {isExpanded && (
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          {sortMode && <th className="border border-gray-300 px-2 py-2 w-20">順序</th>}
                          <th className="border border-gray-300 px-4 py-2 text-left font-medium">商品名</th>
                          <th className="border border-gray-300 px-4 py-2 text-center font-medium w-20">月初</th>
                          <th className="border border-gray-300 px-4 py-2 text-center font-medium w-20">入荷数</th>
                          <th className="border border-gray-300 px-4 py-2 text-center font-medium w-20">出庫数</th>
                          <th className="border border-gray-300 px-4 py-2 text-center font-medium w-20">販売数</th>
                          <th className="border border-gray-300 px-4 py-2 text-center font-medium w-24 bg-orange-50">外部移動</th>
                          <th className="border border-gray-300 px-4 py-2 text-center font-medium w-24 bg-blue-50">現在庫</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, index) => (
                          <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            {sortMode && (
                              <td className="border border-gray-300 px-2 py-1">
                                <div className="flex justify-center space-x-1">
                                  <button
                                    onClick={() => moveItem(category, index, 'up')}
                                    disabled={index === 0}
                                    className="px-1 py-0.5 text-xs bg-gray-200 rounded disabled:opacity-50"
                                  >
                                    ↑
                                  </button>
                                  <button
                                    onClick={() => moveItem(category, index, 'down')}
                                    disabled={index === items.length - 1}
                                    className="px-1 py-0.5 text-xs bg-gray-200 rounded disabled:opacity-50"
                                  >
                                    ↓
                                  </button>
                                </div>
                              </td>
                            )}
                            <td className="border border-gray-300 px-4 py-2 font-medium">{item.name}</td>
                            <td className="border border-gray-300 px-2 py-1 text-center">
                              {editMode ? (
                                <input
                                  type="number"
                                  value={item.initial_stock}
                                  onChange={(e) => handleCellChange(item.id, 'initial_stock', e.target.value)}
                                  className="w-full text-center p-1 border rounded"
                                  min="0"
                                />
                              ) : (
                                item.initial_stock || ''
                              )}
                            </td>
                            <td className="border border-gray-300 px-2 py-1 text-center">
                              {editMode ? (
                                <input
                                  type="number"
                                  value={item.in_stock}
                                  onChange={(e) => handleCellChange(item.id, 'in_stock', e.target.value)}
                                  className="w-full text-center p-1 border rounded"
                                  min="0"
                                />
                              ) : (
                                item.in_stock || ''
                              )}
                            </td>
                            <td className="border border-gray-300 px-2 py-1 text-center">
                              {editMode ? (
                                <input
                                  type="number"
                                  value={item.out_stock}
                                  onChange={(e) => handleCellChange(item.id, 'out_stock', e.target.value)}
                                  className="w-full text-center p-1 border rounded"
                                  min="0"
                                />
                              ) : (
                                item.out_stock || ''
                              )}
                            </td>
                            <td className="border border-gray-300 px-2 py-1 text-center">
                              {editMode ? (
                                <input
                                  type="number"
                                  value={item.sold_stock}
                                  onChange={(e) => handleCellChange(item.id, 'sold_stock', e.target.value)}
                                  className="w-full text-center p-1 border rounded"
                                  min="0"
                                />
                              ) : (
                                item.sold_stock || ''
                              )}
                            </td>
                            <td className="border border-gray-300 px-2 py-1 text-center bg-orange-50">
                              {editMode ? (
                                <input
                                  type="number"
                                  value={item.external_transfer}
                                  onChange={(e) => handleCellChange(item.id, 'external_transfer', e.target.value)}
                                  className="w-full text-center p-1 border rounded"
                                  min="0"
                                />
                              ) : (
                                item.external_transfer || ''
                              )}
                            </td>
                            <td className={`border border-gray-300 px-2 py-1 text-center font-bold ${
                              item.current_stock === 0 ? 'bg-red-100 text-red-600' : 
                              item.current_stock < 10 ? 'bg-yellow-100 text-yellow-700' : 
                              'bg-blue-50'
                            }`}>
                              {item.current_stock}
                            </td>
                          </tr>
                        ))}
                        {/* カテゴリ小計 */}
                        <tr className="bg-gray-200 font-bold">
                          <td className="border border-gray-300 px-4 py-2" colSpan={sortMode ? 2 : 1}>
                            小計
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{totals.initial}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{totals.in}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{totals.out}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{totals.sold}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center bg-orange-100">{totals.external}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center bg-blue-100">{totals.current}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}

        {/* 全体合計 */}
        <Card className="bg-gray-50">
          <CardContent className="py-4">
            <div className="grid grid-cols-7 gap-4 text-center font-bold">
              <div>
                <p className="text-sm text-gray-600">月初合計</p>
                <p className="text-lg">{filteredStock.reduce((sum, item) => sum + item.initial_stock, 0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">入荷合計</p>
                <p className="text-lg">{filteredStock.reduce((sum, item) => sum + item.in_stock, 0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">出庫合計</p>
                <p className="text-lg">{filteredStock.reduce((sum, item) => sum + item.out_stock, 0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">販売合計</p>
                <p className="text-lg">{filteredStock.reduce((sum, item) => sum + item.sold_stock, 0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">外部移動合計</p>
                <p className="text-lg text-orange-600">{filteredStock.reduce((sum, item) => sum + item.external_transfer, 0)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">現在庫合計</p>
                <p className="text-2xl text-blue-600">{filteredStock.reduce((sum, item) => sum + item.current_stock, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* モード説明 */}
        {editMode && (
          <Card className="bg-yellow-50">
            <CardContent className="py-3">
              <p className="text-sm text-yellow-800">
                💡 編集モード：各セルをクリックして数値を直接編集できます。現在庫は自動計算されます（月初 + 入荷 - 出庫 - 販売 - 外部移動）。
              </p>
            </CardContent>
          </Card>
        )}
        {sortMode && (
          <Card className="bg-blue-50">
            <CardContent className="py-3">
              <p className="text-sm text-blue-800">
                💡 並び替えモード：↑↓ボタンで商品の表示順を変更できます。カテゴリ内での順序を自由に設定できます。
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}