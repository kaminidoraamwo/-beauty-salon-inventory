'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

export function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [shopName, setShopName] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            shop_name: shopName,
          }
        }
      })

      if (error) throw error

      toast({
        title: '登録成功',
        description: 'メールを確認してアカウントを有効化してください。',
      })
    } catch (error: any) {
      toast({
        title: 'エラー',
        description: error.message || '登録に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast({
        title: 'ログイン成功',
        description: 'ダッシュボードにリダイレクトします。',
      })

      // ダッシュボードへリダイレクト
      window.location.href = '/dashboard'
    } catch (error: any) {
      toast({
        title: 'エラー',
        description: error.message || 'ログインに失敗しました',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">ログイン</TabsTrigger>
          <TabsTrigger value="signup">新規登録</TabsTrigger>
        </TabsList>
        
        <TabsContent value="signin">
          <Card>
            <CardHeader>
              <CardTitle>ログイン</CardTitle>
              <CardDescription>
                アカウントにログインして在庫管理を開始しましょう
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">メールアドレス</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="example@salon.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">パスワード</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ログイン中...
                    </>
                  ) : (
                    'ログイン'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>新規登録</CardTitle>
              <CardDescription>
                アカウントを作成して在庫管理を始めましょう
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">お名前</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="山田太郎"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-shop">美容室名</Label>
                  <Input
                    id="signup-shop"
                    type="text"
                    placeholder="Beauty Salon"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    required
                    disabled={loading}
                  />
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
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">パスワード</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    6文字以上で設定してください
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      登録中...
                    </>
                  ) : (
                    '新規登録'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}