import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateStockSchema = z.object({
  productId: z.string(),
  shopId: z.string(),
  quantity: z.number().int(),
  movementType: z.enum(['IN', 'OUT', 'ADJUSTMENT', 'RETURN']),
  reason: z.string().optional(),
  userId: z.string().optional(),
})

// GET /api/inventory - 在庫一覧取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')
    const lowStock = searchParams.get('lowStock') === 'true'
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    
    if (!shopId) {
      return NextResponse.json(
        { error: 'shopId is required' },
        { status: 400 }
      )
    }

    const inventory = await db.inventory.findMany({
      where: {
        shopId,
        product: {
          isActive: true,
          ...(categoryId && { categoryId }),
          ...(search && {
            OR: [
              { name: { contains: search } },
              { sku: { contains: search } },
              { barcode: { contains: search } },
            ]
          }),
        }
      },
      include: {
        product: {
          include: {
            category: true,
            supplier: true,
          }
        },
      },
      orderBy: {
        product: { name: 'asc' }
      }
    })

    // 在庫レベルの計算
    const inventoryWithLevels = inventory.map(item => ({
      ...item,
      stockLevel: item.currentStock <= item.product.minStock ? 'LOW' : 
                  item.product.maxStock && item.currentStock >= item.product.maxStock ? 'HIGH' : 'NORMAL',
      availableStock: item.currentStock - item.reservedStock,
    }))

    // 低在庫フィルタリング（データ取得後に実行）
    const filteredInventory = lowStock 
      ? inventoryWithLevels.filter(item => 
          item.currentStock <= (item.product.minStock || 10)
        )
      : inventoryWithLevels

    return NextResponse.json(filteredInventory)
  } catch (error) {
    console.error('Inventory fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    )
  }
}

// POST /api/inventory - 在庫更新
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = updateStockSchema.parse(body)
    const { productId, shopId, quantity, movementType, reason, userId } = validatedData

    // 商品と在庫の存在確認
    const inventory = await db.inventory.findUnique({
      where: {
        productId_shopId: {
          productId,
          shopId
        }
      },
      include: {
        product: true
      }
    })

    if (!inventory) {
      return NextResponse.json(
        { error: 'Inventory record not found' },
        { status: 404 }
      )
    }

    const previousStock = inventory.currentStock

    // 出庫の場合、在庫不足チェック
    if ((movementType === 'OUT') && (quantity > inventory.currentStock)) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      )
    }

    // 新しい在庫数を計算
    let newStock = previousStock
    switch (movementType) {
      case 'IN':
        newStock = previousStock + Math.abs(quantity)
        break
      case 'OUT':
        newStock = previousStock - Math.abs(quantity)
        break
      case 'ADJUSTMENT':
        newStock = Math.max(0, quantity) // 調整は絶対値
        break
      case 'RETURN':
        newStock = previousStock + Math.abs(quantity)
        break
    }

    // トランザクションで在庫更新と移動履歴記録
    const result = await db.$transaction(async (tx) => {
      // 在庫更新
      const updatedInventory = await tx.inventory.update({
        where: {
          productId_shopId: {
            productId,
            shopId
          }
        },
        data: {
          currentStock: newStock,
        },
        include: {
          product: {
            include: {
              category: true,
              supplier: true,
            }
          }
        }
      })

      // 在庫移動履歴記録
      await tx.stockMovement.create({
        data: {
          productId,
          shopId,
          movementType,
          quantity: movementType === 'OUT' ? -Math.abs(quantity) : 
                   movementType === 'ADJUSTMENT' ? quantity - previousStock : 
                   Math.abs(quantity),
          previousStock,
          newStock,
          reason,
          userId,
        }
      })

      return updatedInventory
    })

    // 在庫レベルの計算
    const stockLevel = result.currentStock <= result.product.minStock ? 'LOW' : 
                      result.product.maxStock && result.currentStock >= result.product.maxStock ? 'HIGH' : 'NORMAL'

    return NextResponse.json({
      ...result,
      stockLevel,
      availableStock: result.currentStock - result.reservedStock,
    })
  } catch (error) {
    console.error('Inventory update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update inventory' },
      { status: 500 }
    )
  }
}