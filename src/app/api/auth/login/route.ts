import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// POST /api/auth/login - ログイン
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    // ユーザー検索
    const user = await db.user.findUnique({
      where: { email },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
          }
        }
      }
    })

    // ユーザー存在確認とパスワード検証
    if (!user || user.password !== password) { // 実際にはハッシュ化されたパスワードと比較
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // セッションデータを作成
    const sessionData = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      shopId: user.shopId,
      shopName: user.shop.name,
      loginTime: new Date().toISOString()
    }

    return NextResponse.json({
      user: sessionData,
      shop: user.shop
    })
  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}