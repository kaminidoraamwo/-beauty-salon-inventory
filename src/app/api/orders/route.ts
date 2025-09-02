import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
})

const createOrderSchema = z.object({
  supplierId: z.string(),
  shopId: z.string(),
  userId: z.string(),
  deliveryDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  orderItems: z.array(orderItemSchema).min(1),
})

const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'ORDERED', 'DELIVERED', 'CANCELLED']),
})

// 発注番号生成関数
async function generateOrderNumber(): Promise<string> {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  
  // 今日の発注数を取得
  const startOfDay = new Date(today)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(today)
  endOfDay.setHours(23, 59, 59, 999)
  
  const todayOrdersCount = await db.order.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      }
    }
  })
  
  const sequence = (todayOrdersCount + 1).toString().padStart(3, '0')
  return `ORD-${dateStr}-${sequence}`
}

// GET /api/orders - 発注一覧取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')
    const status = searchParams.get('status')
    const supplierId = searchParams.get('supplierId')
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
      ...(status && { status: status as any }),
      ...(supplierId && { supplierId }),
    }

    // 総件数を取得
    const total = await db.order.count({ where })

    // 発注一覧を取得
    const orders = await db.order.findMany({
      where,
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            contactName: true,
            phone: true,
          }
        },
        user: {
          select: {
            id: true,
            fullName: true,
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                unit: true,
              }
            }
          }
        },
        _count: {
          select: { orderItems: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit,
    })

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST /api/orders - 発注作成
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = createOrderSchema.parse(body)
    const { orderItems, deliveryDate, ...orderData } = validatedData

    // 発注番号生成
    const orderNumber = await generateOrderNumber()

    // 商品の存在確認と価格計算
    const productIds = orderItems.map(item => item.productId)
    const products = await db.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      }
    })

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'Some products not found or inactive' },
        { status: 400 }
      )
    }

    // 合計金額計算
    let totalAmount = 0
    const processedOrderItems = orderItems.map(item => {
      const totalPrice = item.quantity * item.unitPrice
      totalAmount += totalPrice
      return {
        ...item,
        totalPrice,
      }
    })

    // トランザクションで発注とアイテムを作成
    const order = await db.$transaction(async (tx) => {
      // 発注作成
      const newOrder = await tx.order.create({
        data: {
          ...orderData,
          orderNumber,
          deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
          totalAmount,
        },
        include: {
          supplier: true,
          user: {
            select: {
              id: true,
              fullName: true,
            }
          }
        }
      })

      // 発注アイテム作成
      const createdOrderItems = await Promise.all(
        processedOrderItems.map(item =>
          tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  unit: true,
                }
              }
            }
          })
        )
      )

      return {
        ...newOrder,
        orderItems: createdOrderItems,
      }
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Order creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}