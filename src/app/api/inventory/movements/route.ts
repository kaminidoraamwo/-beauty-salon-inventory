import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/inventory/movements - 在庫移動履歴取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')
    const productId = searchParams.get('productId')
    const movementType = searchParams.get('movementType')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    
    if (!shopId) {
      return NextResponse.json(
        { error: 'shopId is required' },
        { status: 400 }
      )
    }

    const where = {
      shopId,
      ...(productId && { productId }),
      ...(movementType && { movementType: movementType as any }),
    }

    // 総件数を取得
    const total = await db.stockMovement.count({ where })

    // 在庫移動履歴を取得
    const movements = await db.stockMovement.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            unit: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit,
    })

    return NextResponse.json({
      movements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Stock movements fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock movements' },
      { status: 500 }
    )
  }
}