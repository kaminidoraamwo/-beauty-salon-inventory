import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const reportsQuerySchema = z.object({
  shopId: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

// GET /api/reports - レポートデータ取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const { shopId, startDate, endDate } = reportsQuerySchema.parse({
      shopId: searchParams.get('shopId'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
    })

    const dateFilter = startDate && endDate ? {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate + 'T23:59:59.999Z'),
      }
    } : {}

    // 並行してデータを取得
    const [
      totalProducts,
      activeProducts,
      lowStockProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalOrderValue,
      recentStockMovements,
      categoryStats,
      supplierStats,
      monthlyOrderTrend
    ] = await Promise.all([
      // 商品統計
      db.product.count({ where: { shopId, isActive: true } }),
      db.product.count({ where: { shopId, isActive: true } }),
      db.inventory.count({
        where: {
          shopId,
          currentStock: {
            lte: 10 // 簡易的に10以下を低在庫とする
          }
        }
      }),

      // 発注統計
      db.order.count({ where: { shopId, ...dateFilter } }),
      db.order.count({ where: { shopId, status: 'PENDING', ...dateFilter } }),
      db.order.count({ where: { shopId, status: 'DELIVERED', ...dateFilter } }),
      db.order.aggregate({
        where: { shopId, ...dateFilter },
        _sum: { totalAmount: true }
      }),

      // 在庫移動履歴（最新10件）
      db.stockMovement.findMany({
        where: { shopId, ...dateFilter },
        include: {
          product: {
            select: {
              name: true,
              sku: true,
              unit: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),

      // カテゴリ別統計
      db.category.findMany({
        where: { shopId },
        include: {
          _count: {
            select: { products: true }
          }
        }
      }),

      // サプライヤー別統計
      db.supplier.findMany({
        where: { shopId },
        include: {
          _count: {
            select: { 
              products: true,
              orders: {
                where: dateFilter
              }
            }
          }
        }
      }),

      // 月別発注トレンド（過去12ヶ月）
      db.$queryRaw`
        SELECT 
          strftime('%Y-%m', createdAt) as month,
          COUNT(*) as orderCount,
          SUM(totalAmount) as totalAmount
        FROM "Order" 
        WHERE shopId = ${shopId}
        AND createdAt >= date('now', '-12 months')
        GROUP BY strftime('%Y-%m', createdAt)
        ORDER BY month ASC
      `
    ])

    // 低在庫商品の詳細を取得
    const lowStockDetails = await db.inventory.findMany({
      where: {
        shopId,
        currentStock: {
          lte: 10 // 簡易的に10以下を低在庫とする
        }
      },
      include: {
        product: {
          select: {
            name: true,
            sku: true,
            unit: true,
            minStock: true,
            category: {
              select: { name: true }
            }
          }
        }
      },
      take: 20
    })

    const reportData = {
      summary: {
        totalProducts,
        activeProducts,
        lowStockCount: lowStockDetails.length,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalOrderValue: totalOrderValue._sum.totalAmount || 0,
      },
      lowStockItems: lowStockDetails.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        sku: item.product.sku,
        unit: item.product.unit,
        currentStock: item.currentStock,
        minStock: item.product.minStock,
        category: item.product.category.name,
        stockLevel: item.currentStock <= item.product.minStock ? 'CRITICAL' : 'LOW'
      })),
      recentMovements: recentStockMovements.map(movement => ({
        id: movement.id,
        productName: movement.product.name,
        sku: movement.product.sku,
        movementType: movement.movementType,
        quantity: movement.quantity,
        previousStock: movement.previousStock,
        newStock: movement.newStock,
        reason: movement.reason,
        createdAt: movement.createdAt
      })),
      categoryStats: categoryStats.map(cat => ({
        name: cat.name,
        productCount: cat._count.products
      })),
      supplierStats: supplierStats.map(supplier => ({
        name: supplier.name,
        productCount: supplier._count.products,
        orderCount: supplier._count.orders
      })),
      monthlyTrend: monthlyOrderTrend || []
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Reports error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}