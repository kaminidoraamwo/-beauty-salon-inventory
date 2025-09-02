import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1),
  shopName: z.string().min(1),
  shopAddress: z.string().optional(),
  shopPhone: z.string().optional(),
  shopEmail: z.string().email().optional(),
})

// POST /api/auth/register - 新規登録
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)
    const { email, password, fullName, shopName, shopAddress, shopPhone, shopEmail } = validatedData

    // メールアドレス重複チェック
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }

    // トランザクションで店舗とユーザーを作成
    const result = await db.$transaction(async (tx) => {
      // 店舗作成
      const shop = await tx.shop.create({
        data: {
          name: shopName,
          address: shopAddress,
          phone: shopPhone,
          email: shopEmail,
        }
      })

      // ユーザー作成（初回登録は管理者権限）
      const user = await tx.user.create({
        data: {
          email,
          password, // 実際にはハッシュ化が必要
          fullName,
          role: 'ADMIN',
          shopId: shop.id,
        },
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

      // デフォルトカテゴリを作成
      await Promise.all([
        tx.category.create({
          data: {
            name: 'シャンプー',
            description: 'シャンプー類',
            shopId: shop.id,
          }
        }),
        tx.category.create({
          data: {
            name: 'カラー剤',
            description: 'カラー剤類', 
            shopId: shop.id,
          }
        }),
        tx.category.create({
          data: {
            name: 'トリートメント',
            description: 'トリートメント類',
            shopId: shop.id,
          }
        }),
        tx.category.create({
          data: {
            name: 'スタイリング剤',
            description: 'スタイリング剤類',
            shopId: shop.id,
          }
        })
      ])

      return user
    })

    // セッションデータを作成
    const sessionData = {
      id: result.id,
      email: result.email,
      fullName: result.fullName,
      role: result.role,
      shopId: result.shopId,
      shopName: result.shop.name,
      loginTime: new Date().toISOString()
    }

    return NextResponse.json({
      user: sessionData,
      shop: result.shop
    }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}