import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// バリデーションスキーマ
const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  sku: z.string().optional(), // SKUをオプションに変更
  barcode: z.string().optional(),
  price: z.number().positive(),
  costPrice: z.number().positive().optional(),
  categoryId: z.string(),
  supplierId: z.string().optional(),
  shopId: z.string(),
  unit: z.string().default('個'),
  minStock: z.number().int().min(0).default(0),
  maxStock: z.number().int().positive().optional(),
})

// GET /api/products - 商品一覧取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    
    if (!shopId) {
      return NextResponse.json(
        { error: 'shopId is required' },
        { status: 400 }
      )
    }

    const products = await db.product.findMany({
      where: {
        shopId,
        ...(categoryId && { categoryId }),
        ...(search && {
          OR: [
            { name: { contains: search } },
            { sku: { contains: search } },
            { barcode: { contains: search } },
          ]
        }),
        isActive: true,
      },
      include: {
        category: true,
        supplier: true,
        inventory: true,
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - 商品作成
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = createProductSchema.parse(body)

    // SKUが提供された場合のみ重複チェック
    if (validatedData.sku) {
      const existingSku = await db.product.findUnique({
        where: { sku: validatedData.sku }
      })

      if (existingSku) {
        return NextResponse.json(
          { error: 'SKU already exists' },
          { status: 409 }
        )
      }
    } else {
      // SKUが空の場合は自動生成（オプション）
      validatedData.sku = `PRD-${Date.now()}`
    }

    const product = await db.$transaction(async (tx) => {
      // 商品作成
      const newProduct = await tx.product.create({
        data: validatedData,
        include: {
          category: true,
          supplier: true,
        }
      })

      // 初期在庫レコード作成
      await tx.inventory.create({
        data: {
          productId: newProduct.id,
          shopId: validatedData.shopId,
          currentStock: 0,
          reservedStock: 0,
        }
      })

      return newProduct
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Product creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}