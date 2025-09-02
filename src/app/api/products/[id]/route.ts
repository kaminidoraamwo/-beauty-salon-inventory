import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  sku: z.string().min(1).optional(),
  barcode: z.string().optional(),
  price: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  unit: z.string().optional(),
  minStock: z.number().int().min(0).optional(),
  maxStock: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
})

// GET /api/products/[id] - 商品詳細取得
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
        inventory: true,
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Product fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - 商品更新
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateProductSchema.parse(body)

    // 商品存在確認
    const existingProduct = await db.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // SKU重複チェック（自分以外で同じSKUがないか）
    if (validatedData.sku && validatedData.sku !== existingProduct.sku) {
      const duplicateSku = await db.product.findFirst({
        where: {
          sku: validatedData.sku,
          id: { not: id }
        }
      })

      if (duplicateSku) {
        return NextResponse.json(
          { error: 'SKU already exists' },
          { status: 409 }
        )
      }
    }

    const updatedProduct = await db.product.update({
      where: { id },
      data: validatedData,
      include: {
        category: true,
        supplier: true,
        inventory: true,
      },
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Product update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - 商品削除（論理削除）
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await db.product.findUnique({
      where: { id }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // 論理削除（isActive: false）
    await db.product.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Product delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}