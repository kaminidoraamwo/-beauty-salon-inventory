'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Store, User } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { authApi } from '@/lib/api'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [shopName, setShopName] = useState('')
  const [shopAddress, setShopAddress] = useState('')
  const [shopPhone, setShopPhone] = useState('')
  const [shopEmail, setShopEmail] = useState('')
  const [activeTab, setActiveTab] = useState('login')
  const router = useRouter()
  const { toast } = useToast()

  // ログインミューテーション
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // セッションデータをローカルストレージに保存
      localStorage.setItem('beauty-salon-session', JSON.stringify(data.user))
      
      // 認証状態変更を通知
      window.dispatchEvent(new Event('auth-changed'))
      
      toast({
        title: 'ログイン成功',
        description: `${data.shop.name}にログインしました。`
      })

      // ダッシュボードにリダイレクト
      setTimeout(() => {
        router.push('/dashboard')
      }, 100)
    },
    onError: (error: any) => {
      toast({
        title: 'ログインエラー',
        description: error.response?.data?.error || 'ログインに失敗しました。',
        variant: 'destructive'
      })
    }
  })

  // 新規登録ミューテーション
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      // セッションデータをローカルストレージに保存
      localStorage.setItem('beauty-salon-session', JSON.stringify(data.user))
      
      // 認証状態変更を通知
      window.dispatchEvent(new Event('auth-changed'))
      
      toast({
        title: '登録完了',
        description: `${data.shop.name}のアカウントを作成しました。`
      })

      // ダッシュボードにリダイレクト
      setTimeout(() => {
        router.push('/dashboard')
      }, 100)
    },
    onError: (error: any) => {
      toast({
        title: '登録エラー',
        description: error.response?.data?.error || '新規登録に失敗しました。',
        variant: 'destructive'
      })
    }
  })

  // ログイン処理
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast({
        title: 'エラー',
        description: 'メールアドレスとパスワードを入力してください。',
        variant: 'destructive'
      })
      return
    }

    loginMutation.mutate({ email, password })
  }

  // 新規登録処理
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション
    if (!email || !password || !fullName || !shopName) {
      toast({
        title: 'エラー',
        description: '必須項目をすべて入力してください。',
        variant: 'destructive'
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: 'パスワードエラー',
        description: 'パスワードが一致しません。',
        variant: 'destructive'
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: 'パスワードエラー',
        description: 'パスワードは6文字以上で入力してください。',
        variant: 'destructive'
      })
      return
    }

    registerMutation.mutate({
      email,
      password,
      fullName,
      shopName,
      shopAddress: shopAddress || undefined,
      shopPhone: shopPhone || undefined,
      shopEmail: shopEmail || undefined,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <Store className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Beauty Salon Inventory
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            美容室在庫管理システム
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">ログイン</TabsTrigger>
            <TabsTrigger value="signup">新規登録</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">ログイン</CardTitle>
                <CardDescription className="text-center">
                  アカウントにログインしてください
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">メールアドレス</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="example@salon.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={registerMutation.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">パスワード</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="パスワードを入力"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={registerMutation.isPending}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                    {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    ログイン
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">新規登録</CardTitle>
                <CardDescription className="text-center">
                  新しいアカウントを作成してください
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full-name">お名前</Label>
                      <Input
                        id="full-name"
                        placeholder="田中 太郎"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        disabled={registerMutation.isPending}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shop-name">店舗名</Label>
                      <Input
                        id="shop-name"
                        placeholder="○○美容室"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        required
                        disabled={registerMutation.isPending}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">メールアドレス</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="example@salon.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={registerMutation.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">パスワード</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="6文字以上のパスワード"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={registerMutation.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">パスワード確認</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="パスワードを再入力"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={registerMutation.isPending}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                    {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    アカウントを作成
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        {/* テスト用の情報 */}
        <Card className="bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-medium text-blue-800 mb-2">テスト用アカウント</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>メール: test@salon.com</p>
                <p>パスワード: test123</p>
                <p className="text-xs text-blue-600 mt-2">
                  ※ 上記アカウントでもログイン可能です
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}