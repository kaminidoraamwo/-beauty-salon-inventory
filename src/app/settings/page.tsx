'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Settings,
  User,
  Store,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Save,
  RefreshCw
} from 'lucide-react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useToast } from '@/hooks/use-toast'

// 設定データの型定義
interface AppSettings {
  shopName: string
  ownerName: string
  address: string
  phone: string
  email: string
  lowStockThreshold: number
  currency: string
  language: string
  notifications: {
    lowStock: boolean
    expiring: boolean
    dailyReport: boolean
  }
}

export default function SettingsPage() {
  const { toast } = useToast()
  
  // アプリ設定をローカルストレージで管理
  const [settings, setSettings] = useLocalStorage<AppSettings>('beauty-salon-settings', {
    shopName: '○○美容室',
    ownerName: '田中 太郎',
    address: '東京都渋谷区○○1-1-1',
    phone: '03-1234-5678',
    email: 'info@salon.com',
    lowStockThreshold: 10,
    currency: 'JPY',
    language: 'ja',
    notifications: {
      lowStock: true,
      expiring: true,
      dailyReport: false
    }
  })

  // 商品・在庫データを取得（データ管理用）
  const [products] = useLocalStorage<any[]>('beauty-salon-products', [])
  const [inventory] = useLocalStorage<any[]>('beauty-salon-inventory', [])
  const [inventoryHistory] = useLocalStorage<any[]>('beauty-salon-inventory-history', [])
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [backupData, setBackupData] = useState<string>('')

  // 設定保存
  const handleSaveSettings = () => {
    setSettings(settings)
    toast({
      title: '設定を保存しました',
      description: '設定が正常に保存されました。'
    })
  }

  // データバックアップ
  const handleBackupData = () => {
    const allData = {
      products,
      inventory,
      inventoryHistory,
      settings,
      exportDate: new Date().toISOString()
    }
    
    const dataStr = JSON.stringify(allData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `美容室システムバックアップ_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: 'バックアップ完了',
      description: 'データのバックアップファイルをダウンロードしました。'
    })
  }

  // データ復元
  const handleRestoreData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        
        if (data.products) {
          localStorage.setItem('beauty-salon-products', JSON.stringify(data.products))
        }
        if (data.inventory) {
          localStorage.setItem('beauty-salon-inventory', JSON.stringify(data.inventory))
        }
        if (data.inventoryHistory) {
          localStorage.setItem('beauty-salon-inventory-history', JSON.stringify(data.inventoryHistory))
        }
        if (data.settings) {
          localStorage.setItem('beauty-salon-settings', JSON.stringify(data.settings))
          setSettings(data.settings)
        }

        toast({
          title: 'データ復元完了',
          description: 'バックアップからデータを復元しました。ページを再読み込みしてください。'
        })
        
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } catch (error) {
        toast({
          title: 'エラー',
          description: '不正なバックアップファイルです。',
          variant: 'destructive'
        })
      }
    }
    reader.readAsText(file)
  }

  // 全データ削除
  const handleDeleteAllData = () => {
    localStorage.removeItem('beauty-salon-products')
    localStorage.removeItem('beauty-salon-inventory')
    localStorage.removeItem('beauty-salon-inventory-history')
    
    setShowDeleteConfirm(false)
    toast({
      title: 'データを削除しました',
      description: '全てのデータが削除されました。ページを再読み込みしてください。',
      variant: 'destructive'
    })
    
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">設定</h1>
          <p className="text-gray-600">システムの設定を管理します</p>
        </div>

        {/* 店舗情報設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Store className="h-5 w-5 mr-2" />
              店舗情報
            </CardTitle>
            <CardDescription>美容室の基本情報を設定します</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shop-name">店舗名</Label>
                <Input
                  id="shop-name"
                  value={settings.shopName}
                  onChange={(e) => setSettings({...settings, shopName: e.target.value})}
                  placeholder="○○美容室"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner-name">オーナー名</Label>
                <Input
                  id="owner-name"
                  value={settings.ownerName}
                  onChange={(e) => setSettings({...settings, ownerName: e.target.value})}
                  placeholder="田中 太郎"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">住所</Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) => setSettings({...settings, address: e.target.value})}
                placeholder="東京都渋谷区○○1-1-1"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">電話番号</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => setSettings({...settings, phone: e.target.value})}
                  placeholder="03-1234-5678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({...settings, email: e.target.value})}
                  placeholder="info@salon.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* システム設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              システム設定
            </CardTitle>
            <CardDescription>システムの動作を設定します</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="low-stock">在庫少量アラート閾値</Label>
                <Input
                  id="low-stock"
                  type="number"
                  value={settings.lowStockThreshold}
                  onChange={(e) => setSettings({...settings, lowStockThreshold: parseInt(e.target.value) || 10})}
                  min="1"
                  max="100"
                />
                <p className="text-xs text-gray-500">
                  この数量以下になったらアラートを表示します
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">通貨単位</Label>
                <select
                  id="currency"
                  value={settings.currency}
                  onChange={(e) => setSettings({...settings, currency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="JPY">日本円 (¥)</option>
                  <option value="USD">米ドル ($)</option>
                  <option value="EUR">ユーロ (€)</option>
                </select>
              </div>
            </div>

            {/* 通知設定 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">通知設定</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>在庫少量アラート</Label>
                    <p className="text-xs text-gray-500">在庫が少なくなった時に通知</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.lowStock}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: {...settings.notifications, lowStock: e.target.checked}
                    })}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>期限切れアラート</Label>
                    <p className="text-xs text-gray-500">商品の期限が近づいた時に通知</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.expiring}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: {...settings.notifications, expiring: e.target.checked}
                    })}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>日次レポート</Label>
                    <p className="text-xs text-gray-500">毎日の売上レポートを通知</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.dailyReport}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: {...settings.notifications, dailyReport: e.target.checked}
                    })}
                    className="h-4 w-4"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={handleSaveSettings}>
                <Save className="h-4 w-4 mr-2" />
                設定を保存
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* データ管理 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <RefreshCw className="h-5 w-5 mr-2" />
              データ管理
            </CardTitle>
            <CardDescription>データのバックアップ・復元・削除を行います</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* バックアップ */}
              <div className="space-y-2">
                <Button onClick={handleBackupData} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  データバックアップ
                </Button>
                <p className="text-xs text-gray-500">
                  全データをJSONファイルでエクスポートします
                </p>
              </div>

              {/* 復元 */}
              <div className="space-y-2">
                <Label htmlFor="restore-file" className="cursor-pointer">
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm text-center hover:bg-gray-50">
                    <Upload className="h-4 w-4 mr-2 inline" />
                    データ復元
                  </div>
                </Label>
                <input
                  id="restore-file"
                  type="file"
                  accept=".json"
                  onChange={handleRestoreData}
                  className="hidden"
                />
                <p className="text-xs text-gray-500">
                  バックアップファイルから復元します
                </p>
              </div>

              {/* 削除 */}
              <div className="space-y-2">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  全データ削除
                </Button>
                <p className="text-xs text-gray-500">
                  全てのデータを完全に削除します
                </p>
              </div>
            </div>

            {/* データ統計 */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">データ統計</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">商品数:</span>
                  <span className="ml-2 font-semibold">{products.length}件</span>
                </div>
                <div>
                  <span className="text-gray-500">在庫アイテム:</span>
                  <span className="ml-2 font-semibold">{inventory.length}件</span>
                </div>
                <div>
                  <span className="text-gray-500">在庫履歴:</span>
                  <span className="ml-2 font-semibold">{inventoryHistory.length}件</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* システム情報 */}
        <Card>
          <CardHeader>
            <CardTitle>システム情報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">システム名:</span>
                <span>Beauty Salon Inventory System</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">バージョン:</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">最終更新:</span>
                <span>{new Date().toLocaleDateString('ja-JP')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ブラウザ:</span>
                <span>{navigator.userAgent.split(' ').pop()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 削除確認モーダル */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  データ削除の確認
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  全ての商品データ、在庫データ、履歴データが完全に削除されます。
                  この操作は元に戻せません。
                </p>
                <p className="text-sm font-medium text-red-600">
                  本当に削除してもよろしいですか？
                </p>
                <div className="flex space-x-2 pt-4">
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAllData}
                  >
                    削除する
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    キャンセル
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  )
}