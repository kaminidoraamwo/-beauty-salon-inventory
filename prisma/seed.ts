import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // テスト店舗を作成
  const shop = await prisma.shop.upsert({
    where: { id: 'shop_test' },
    update: {},
    create: {
      id: 'shop_test',
      name: 'テスト美容室',
      address: '東京都渋谷区テスト1-1-1',
      phone: '03-1234-5678',
      email: 'test@salon.com',
    },
  })

  // テストユーザーを作成
  const user = await prisma.user.upsert({
    where: { email: 'test@salon.com' },
    update: {},
    create: {
      email: 'test@salon.com',
      fullName: 'テスト ユーザー',
      password: 'test123', // 実際にはハッシュ化が必要
      role: 'ADMIN',
      shopId: shop.id,
    },
  })

  // カテゴリを作成
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: 'cat_shampoo' },
      update: {},
      create: {
        id: 'cat_shampoo',
        name: 'シャンプー',
        description: 'シャンプー類',
        shopId: shop.id,
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat_color' },
      update: {},
      create: {
        id: 'cat_color',
        name: 'カラー剤',
        description: 'カラー剤類',
        shopId: shop.id,
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat_treatment' },
      update: {},
      create: {
        id: 'cat_treatment',
        name: 'トリートメント',
        description: 'トリートメント類',
        shopId: shop.id,
      },
    }),
  ])

  // サプライヤーを作成
  const supplier = await prisma.supplier.upsert({
    where: { id: 'sup_beauty' },
    update: {},
    create: {
      id: 'sup_beauty',
      name: '美容用品株式会社',
      contactName: '営業部 田中',
      email: 'tanaka@beauty-supplier.com',
      phone: '03-9876-5432',
      address: '東京都新宿区美容1-2-3',
      shopId: shop.id,
    },
  })

  // 商品を作成
  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'SHAMPOO001' },
      update: {},
      create: {
        name: 'プレミアムシャンプー',
        description: '高品質シャンプー、リピーター多数',
        sku: 'SHAMPOO001',
        barcode: '4901234567890',
        price: 2400,
        costPrice: 1200,
        categoryId: categories[0].id,
        supplierId: supplier.id,
        shopId: shop.id,
        unit: 'ml',
        minStock: 5,
        maxStock: 50,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'COLOR001' },
      update: {},
      create: {
        name: 'カラー剤ブラウン',
        description: '人気のブラウンカラー',
        sku: 'COLOR001',
        barcode: '4901234567891',
        price: 1600,
        costPrice: 800,
        categoryId: categories[1].id,
        supplierId: supplier.id,
        shopId: shop.id,
        unit: 'g',
        minStock: 10,
        maxStock: 30,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'TREATMENT001' },
      update: {},
      create: {
        name: 'ディープトリートメント',
        description: '集中ケア用トリートメント',
        sku: 'TREATMENT001',
        barcode: '4901234567892',
        price: 3000,
        costPrice: 1500,
        categoryId: categories[2].id,
        supplierId: supplier.id,
        shopId: shop.id,
        unit: 'ml',
        minStock: 3,
        maxStock: 20,
      },
    }),
  ])

  // 在庫データを作成
  await Promise.all(
    products.map((product) =>
      prisma.inventory.upsert({
        where: {
          productId_shopId: {
            productId: product.id,
            shopId: shop.id,
          },
        },
        update: {},
        create: {
          productId: product.id,
          shopId: shop.id,
          currentStock: 20,
          reservedStock: 0,
        },
      })
    )
  )

  console.log('Seed data created successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })