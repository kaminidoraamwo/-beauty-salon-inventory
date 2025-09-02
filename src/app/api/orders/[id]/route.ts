import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'ORDERED', 'DELIVERED', 'CANCELLED']),
  userId: z.string().optional(),
})

// GET /api/orders/[id] - 発注詳細取得
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
  try {
    const order = await db.order.findUnique({
      where: { id },
      include: {
        supplier: true,
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
                category: {
                  select: {
                    id: true,
                    name: true,
                  }
                }
              }
            }
          },
          orderBy: {
            product: { name: 'asc' }
          }
        }
      },
    })

    if (!order) {
    const { id } = await params
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    const { id } = await params
    console.error('Order fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// PUT /api/orders/[id] - 発注状態更新
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
  try {
    const body = await request.json()
    const validatedData = updateOrderStatusSchema.parse(body)
    const { status, userId } = validatedData

    // 発注の存在確認
    const existingOrder = await db.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    if (!existingOrder) {
    const { id } = await params
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // 納品処理の場合は在庫を自動更新
    if (status === 'DELIVERED' && existingOrder.status !== 'DELIVERED') {
    const { id } = await params
      const updatedOrder = await db.$transaction(async (tx) => {
        // 発注状態を更新
        const order = await tx.order.update({
          where: { id },
          data: { status },
          include: {
            supplier: true,
            user: {
              select: {
                id: true,
                fullName: true,
              }
            },
            orderItems: {
              include: {
                product: true
              }
            }
          }
        })

        // 各発注アイテムの在庫を更新
        for (const orderItem of order.orderItems) {
    const { id } = await params
          // 在庫レコードを取得または作成
          const inventory = await tx.inventory.upsert({
            where: {
              productId_shopId: {
                productId: orderItem.productId,
                shopId: order.shopId,
              }
            },
            create: {
              productId: orderItem.productId,
              shopId: order.shopId,
              currentStock: orderItem.quantity,
              reservedStock: 0,
            },
            update: {
              currentStock: {
                increment: orderItem.quantity
              }
            }
          })

          // 在庫移動履歴を記録
          await tx.stockMovement.create({
            data: {
              productId: orderItem.productId,
              shopId: order.shopId,
              movementType: 'IN',
              quantity: orderItem.quantity,
              previousStock: inventory.currentStock - orderItem.quantity,
              newStock: inventory.currentStock,
              reason: `発注納品: ${order.orderNumber}`,
              orderId: order.id,
              userId,
            }
          })
        }

        return order
      })

      return NextResponse.json(updatedOrder)
    }

    // 通常の状態更新
    const updatedOrder = await db.order.update({
      where: { id },
      data: { status },
      include: {
        supplier: true,
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
        }
      }
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    const { id } = await params
    console.error('Order update error:', error)
    
    if (error instanceof z.ZodError) {
    const { id } = await params
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

// DELETE /api/orders/[id] - 発注削除（キャンセル）
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
  try {
    const order = await db.order.findUnique({
      where: { id }
    })

    if (!order) {
    const { id } = await params
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // 納品済みの発注は削除不可
    if (order.status === 'DELIVERED') {
    const { id } = await params
      return NextResponse.json(
        { error: 'Cannot delete delivered order' },
        { status: 400 }
      )
    }

    // 発注をキャンセル状態に更新
    await db.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })

    return NextResponse.json({ message: 'Order cancelled successfully' })
  } catch (error) {
    const { id } = await params
    console.error('Order delete error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    )
  }
}