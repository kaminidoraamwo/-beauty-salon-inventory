import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const createSupplierSchema = z.object({
  name: z.string().min(1),
  contactName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  shopId: z.string(),
})

// GET /api/suppliers - サプライヤー一覧取得
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

    const suppliers = await db.supplier.findMany({
      where: { shopId },
      include: {
        _count: {
          select: { 
            products: { where: { isActive: true } },
            orders: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(suppliers)
  } catch (error) {
    console.error('Suppliers fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    )
  }
}

// POST /api/suppliers - サプライヤー作成
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = createSupplierSchema.parse(body)

    const supplier = await db.supplier.create({
      data: validatedData,
      include: {
        _count: {
          select: { products: true, orders: true }
        }
      }
    })

    return NextResponse.json(supplier, { status: 201 })
  } catch (error) {
    console.error('Supplier creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create supplier' },
      { status: 500 }
    )
  }
}