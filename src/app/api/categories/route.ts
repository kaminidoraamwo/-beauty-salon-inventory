import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const createCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  shopId: z.string(),
})

// GET /api/categories - カテゴリ一覧取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')
    
    if (!shopId) {
      return NextResponse.json(
        { error: 'shopId is required' },
        { status: 400 }
      )
    }

    const categories = await db.category.findMany({
      where: { shopId },
      include: {
        _count: {
          select: { products: { where: { isActive: true } } }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Categories fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/categories - カテゴリ作成
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = createCategorySchema.parse(body)

    const category = await db.category.create({
      data: validatedData,
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Category creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}