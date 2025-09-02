'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Upload, Download, CheckCircle, AlertCircle, FileText, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { productsApi, categoriesApi, suppliersApi } from '@/lib/api'

interface ImportResult {
  success: number
  errors: string[]
  total: number
}

export default function ImportPage() {
  const { toast } = useToast()
  const [shopId, setShopId] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importProgress, setImportProgress] = useState(0)

  useEffect(() => {
    const session = localStorage.getItem('beauty-salon-session')
    if (session) {
      const userData = JSON.parse(session)
      setShopId(userData.shopId)
    }
  }, [])

  // カテゴリとサプライヤーデータを取得
  const { data: categories } = useQuery({
    queryKey: ['categories', shopId],
    queryFn: () => categoriesApi.getCategories(shopId),
    enabled: !!shopId
  })

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers', shopId],
    queryFn: () => suppliersApi.getSuppliers(shopId),
    enabled: !!shopId
  })

  const { data: products } = useQuery({
    queryKey: ['products', shopId],
    queryFn: () => productsApi.getProducts({ shopId }),
    enabled: !!shopId
  })

  // ファイル選択ハンドラー
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/csv') {
      setSelectedFile(file)
      setImportResult(null)
    } else {
      toast({
        title: 'エラー',
        description: 'CSVファイルを選択してください。',
        variant: 'destructive'
      })
    }
  }

  // CSVパース関数
  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
      const record: any = {}
      headers.forEach((header, index) => {
        record[header] = values[index] || ''
      })
      return record
    })
  }

  // インポート処理
  const handleImport = async () => {
    if (!selectedFile || !categories || !suppliers) return

    setIsImporting(true)
    setImportProgress(0)

    try {
      const text = await selectedFile.text()
      const records = parseCSV(text)
      
      let success = 0
      const errors: string[] = []
      
      for (let i = 0; i < records.length; i++) {
        const record = records[i]
        
        try {
          // カテゴリ検索
          const category = categories.find(c => 
            c.name === record.カテゴリ || c.name === record.category
          )
          if (!category) {
            errors.push(`行${i + 2}: カテゴリ「${record.カテゴリ || record.category}」が見つかりません`)
            continue
          }

          // サプライヤー検索（オプション）
          let supplierId = undefined
          if (record.サプライヤー || record.supplier) {
            const supplier = suppliers.find(s => 
              s.name === record.サプライヤー || s.name === record.supplier
            )
            supplierId = supplier?.id
          }

          // 商品データ作成
          const productData = {
            name: record.商品名 || record.name || '',
            description: record.説明 || record.description || '',
            sku: record.SKU || record.sku || `AUTO-${Date.now()}-${i}`,
            barcode: record.バーコード || record.barcode || '',
            price: parseFloat(record.価格 || record.price || '0'),
            costPrice: parseFloat(record.原価 || record.cost_price || '0'),
            categoryId: category.id,
            supplierId,
            shopId,
            unit: record.単位 || record.unit || '個',
            minStock: parseInt(record.最小在庫 || record.min_stock || '0'),
            maxStock: parseInt(record.最大在庫 || record.max_stock || '100'),
            isActive: true
          }

          // 商品作成
          await productsApi.createProduct(productData)
          success++
        } catch (error: any) {
          errors.push(`行${i + 2}: ${error.message || '商品作成に失敗しました'}`)
        }

        // プログレス更新
        setImportProgress(Math.round(((i + 1) / records.length) * 100))
        
        // UI更新のため少し待機
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      setImportResult({
        success,
        errors,
        total: records.length
      })

      if (success > 0) {
        toast({
          title: 'インポート完了',
          description: `${success}件の商品をインポートしました。`
        })
      }

    } catch (error: any) {
      toast({
        title: 'エラー',
        description: 'CSVファイルの読み込みに失敗しました。',
        variant: 'destructive'
      })
    } finally {
      setIsImporting(false)
      setImportProgress(0)
    }
  }

  // テンプレートCSVダウンロード
  const downloadTemplate = () => {
    const headers = ['商品名', 'SKU', 'カテゴリ', 'サプライヤー', '価格', '原価', '単位', '最小在庫', '最大在庫', '説明']
    const sampleData = [
      ['サンプル商品', 'SAMPLE001', 'シャンプー', 'サンプルサプライヤー', '2000', '1500', '本', '5', '50', 'サンプル商品の説明'],
    ]
    
    const csvContent = [headers, ...sampleData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'product_import_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 商品データエクスポート
  const exportProducts = () => {
    if (!products) return

    const headers = ['商品名', 'SKU', 'カテゴリ', 'サプライヤー', '価格', '原価', '単位', '最小在庫', '説明', '作成日']
    const csvData = products.map(product => [
      product.name,
      product.sku,
      product.category.name,
      product.supplier?.name || '',
      product.price,
      product.costPrice || '',
      product.unit,
      product.minStock,
      product.description || '',
      new Date(product.createdAt).toLocaleDateString('ja-JP')
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: 'エクスポート完了',
      description: `${products.length}件の商品データをエクスポートしました。`
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">インポート・エクスポート</h1>
        <p className="text-gray-600 mt-2">商品データの一括管理</p>
      </div>

      {/* エクスポート機能 */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="mr-2 h-5 w-5" />
              データエクスポート
            </CardTitle>
            <CardDescription>
              登録済みの商品データをCSVファイルでダウンロードできます
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>エクスポート対象: {products?.length || 0}件の商品</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportProducts} disabled={!products?.length}>
                <Download className="mr-2 h-4 w-4" />
                商品データエクスポート
              </Button>
              <Button onClick={downloadTemplate} variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                テンプレートDL
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              データインポート
            </CardTitle>
            <CardDescription>
              CSVファイルから商品データを一括登録できます
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="csv-file">CSVファイル選択</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="mt-1"
              />
            </div>
            {selectedFile && (
              <div className="text-sm text-gray-600">
                <p>選択ファイル: {selectedFile.name}</p>
                <p>サイズ: {Math.round(selectedFile.size / 1024)}KB</p>
              </div>
            )}
            <Button 
              onClick={handleImport} 
              disabled={!selectedFile || isImporting}
              className="w-full"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  インポート中...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  インポート実行
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* インポート進行状況 */}
      {isImporting && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>インポート進行状況</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* インポート結果 */}
      {importResult && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              {importResult.errors.length === 0 ? (
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="mr-2 h-5 w-5 text-yellow-500" />
              )}
              インポート結果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{importResult.success}</div>
                <div className="text-sm text-gray-600">成功</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{importResult.errors.length}</div>
                <div className="text-sm text-gray-600">エラー</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{importResult.total}</div>
                <div className="text-sm text-gray-600">合計</div>
              </div>
            </div>
            
            {importResult.errors.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">エラー詳細:</h4>
                <div className="bg-red-50 rounded-lg p-3 max-h-48 overflow-y-auto">
                  {importResult.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700 mb-1">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* CSV形式の説明 */}
      <Card>
        <CardHeader>
          <CardTitle>CSVファイル形式について</CardTitle>
          <CardDescription>
            インポートするCSVファイルの形式と注意事項
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">必須列:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>商品名 (name)</li>
                <li>カテゴリ (category) - 既存のカテゴリ名と一致する必要があります</li>
                <li>価格 (price) - 数値で入力</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">オプション列:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>SKU (sku) - 空の場合は自動生成</li>
                <li>サプライヤー (supplier) - 既存のサプライヤー名</li>
                <li>原価 (cost_price) - 数値</li>
                <li>単位 (unit) - デフォルト: 個</li>
                <li>最小在庫 (min_stock) - 数値</li>
                <li>最大在庫 (max_stock) - 数値</li>
                <li>説明 (description)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">既存カテゴリ:</h4>
              <div className="flex flex-wrap gap-2">
                {categories?.map(category => (
                  <span key={category.id} className="px-2 py-1 bg-gray-100 rounded text-sm">
                    {category.name}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">既存サプライヤー:</h4>
              <div className="flex flex-wrap gap-2">
                {suppliers?.map(supplier => (
                  <span key={supplier.id} className="px-2 py-1 bg-gray-100 rounded text-sm">
                    {supplier.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">注意事項</h4>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>文字エンコーディングはUTF-8で保存してください</li>
                      <li>カンマを含む値は二重引用符で囲んでください</li>
                      <li>カテゴリ・サプライヤー名は完全一致する必要があります</li>
                      <li>価格・数量は半角数字で入力してください</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}