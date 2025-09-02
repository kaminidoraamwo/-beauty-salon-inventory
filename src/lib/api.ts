import axios from 'axios'

// Base API configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// API Types
export interface Product {
  id: string
  name: string
  description?: string
  sku: string
  barcode?: string
  price: number
  costPrice?: number
  categoryId: string
  supplierId?: string
  shopId: string
  unit: string
  minStock: number
  maxStock?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  category: {
    id: string
    name: string
  }
  supplier?: {
    id: string
    name: string
  }
  inventory?: {
    id: string
    currentStock: number
    reservedStock: number
  }[]
}

export interface Category {
  id: string
  name: string
  description?: string
  shopId: string
  createdAt: string
  updatedAt: string
  _count?: {
    products: number
  }
}

export interface Supplier {
  id: string
  name: string
  contactName?: string
  email?: string
  phone?: string
  address?: string
  shopId: string
  createdAt: string
  updatedAt: string
  _count?: {
    products: number
    orders: number
  }
}

export interface InventoryItem {
  id: string
  productId: string
  shopId: string
  currentStock: number
  reservedStock: number
  createdAt: string
  updatedAt: string
  product: {
    id: string
    name: string
    sku: string
    unit: string
    minStock: number
    maxStock?: number
    category: {
      id: string
      name: string
    }
    supplier?: {
      id: string
      name: string
    }
  }
  stockLevel?: 'LOW' | 'NORMAL' | 'HIGH'
  availableStock?: number
}

export interface Order {
  id: string
  orderNumber: string
  supplierId: string
  shopId: string
  userId: string
  status: 'PENDING' | 'ORDERED' | 'DELIVERED' | 'CANCELLED'
  orderDate: string
  deliveryDate?: string
  totalAmount: number
  notes?: string
  createdAt: string
  updatedAt: string
  supplier: {
    id: string
    name: string
    contactName?: string
    phone?: string
  }
  user: {
    id: string
    fullName: string
  }
  orderItems: OrderItem[]
  _count?: {
    orderItems: number
  }
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  createdAt: string
  product: {
    id: string
    name: string
    sku: string
    unit: string
  }
}

export interface StockMovement {
  id: string
  productId: string
  shopId: string
  movementType: 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN'
  quantity: number
  previousStock: number
  newStock: number
  reason?: string
  orderId?: string
  userId?: string
  createdAt: string
  product: {
    id: string
    name: string
    sku: string
    unit: string
  }
}

// API Client functions
export const productsApi = {
  // 商品一覧取得
  getProducts: (params: {
    shopId: string
    categoryId?: string
    search?: string
  }): Promise<Product[]> => 
    api.get('/products', { params }).then(res => res.data),

  // 商品詳細取得
  getProduct: (id: string): Promise<Product> => 
    api.get(`/products/${id}`).then(res => res.data),

  // 商品作成
  createProduct: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'category' | 'supplier' | 'inventory'>): Promise<Product> =>
    api.post('/products', data).then(res => res.data),

  // 商品更新
  updateProduct: (id: string, data: Partial<Product>): Promise<Product> =>
    api.put(`/products/${id}`, data).then(res => res.data),

  // 商品削除
  deleteProduct: (id: string): Promise<void> =>
    api.delete(`/products/${id}`).then(res => res.data),
}

export const categoriesApi = {
  // カテゴリ一覧取得
  getCategories: (shopId: string): Promise<Category[]> =>
    api.get('/categories', { params: { shopId } }).then(res => res.data),

  // カテゴリ作成
  createCategory: (data: { name: string; description?: string; shopId: string }): Promise<Category> =>
    api.post('/categories', data).then(res => res.data),
}

export const suppliersApi = {
  // サプライヤー一覧取得
  getSuppliers: (shopId: string): Promise<Supplier[]> =>
    api.get('/suppliers', { params: { shopId } }).then(res => res.data),

  // サプライヤー作成
  createSupplier: (data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | '_count'>): Promise<Supplier> =>
    api.post('/suppliers', data).then(res => res.data),
}

export const inventoryApi = {
  // 在庫一覧取得
  getInventory: (params: {
    shopId: string
    lowStock?: boolean
    categoryId?: string
    search?: string
  }): Promise<InventoryItem[]> =>
    api.get('/inventory', { params }).then(res => res.data),

  // 在庫更新
  updateStock: (data: {
    productId: string
    shopId: string
    quantity: number
    movementType: 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN'
    reason?: string
    userId?: string
  }): Promise<InventoryItem> =>
    api.post('/inventory', data).then(res => res.data),

  // 在庫移動履歴取得
  getStockMovements: (params: {
    shopId: string
    productId?: string
    movementType?: string
    page?: number
    limit?: number
  }): Promise<{
    movements: StockMovement[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }> =>
    api.get('/inventory/movements', { params }).then(res => res.data),
}

export const ordersApi = {
  // 発注一覧取得
  getOrders: (params: {
    shopId: string
    status?: string
    supplierId?: string
    page?: number
    limit?: number
  }): Promise<{
    orders: Order[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }> =>
    api.get('/orders', { params }).then(res => res.data),

  // 発注詳細取得
  getOrder: (id: string): Promise<Order> =>
    api.get(`/orders/${id}`).then(res => res.data),

  // 発注作成
  createOrder: (data: {
    supplierId: string
    shopId: string
    userId: string
    deliveryDate?: string
    notes?: string
    orderItems: {
      productId: string
      quantity: number
      unitPrice: number
    }[]
  }): Promise<Order> =>
    api.post('/orders', data).then(res => res.data),

  // 発注状態更新
  updateOrderStatus: (id: string, data: {
    status: 'PENDING' | 'ORDERED' | 'DELIVERED' | 'CANCELLED'
    userId?: string
  }): Promise<Order> =>
    api.put(`/orders/${id}`, data).then(res => res.data),

  // 発注削除（キャンセル）
  deleteOrder: (id: string): Promise<void> =>
    api.delete(`/orders/${id}`).then(res => res.data),
}

// Auth API
export const authApi = {
  // ログイン
  login: (data: { email: string; password: string }): Promise<{
    user: {
      id: string
      email: string
      fullName: string
      role: string
      shopId: string
      shopName: string
      loginTime: string
    }
    shop: {
      id: string
      name: string
      address?: string
      phone?: string
      email?: string
    }
  }> =>
    api.post('/auth/login', data).then(res => res.data),

  // 新規登録
  register: (data: {
    email: string
    password: string
    fullName: string
    shopName: string
    shopAddress?: string
    shopPhone?: string
    shopEmail?: string
  }): Promise<{
    user: {
      id: string
      email: string
      fullName: string
      role: string
      shopId: string
      shopName: string
      loginTime: string
    }
    shop: {
      id: string
      name: string
      address?: string
      phone?: string
      email?: string
    }
  }> =>
    api.post('/auth/register', data).then(res => res.data),
}

export interface ReportData {
  summary: {
    totalProducts: number
    activeProducts: number
    lowStockCount: number
    totalOrders: number
    pendingOrders: number
    deliveredOrders: number
    totalOrderValue: number
  }
  lowStockItems: {
    productId: string
    productName: string
    sku: string
    unit: string
    currentStock: number
    minStock: number
    category: string
    stockLevel: 'CRITICAL' | 'LOW'
  }[]
  recentMovements: {
    id: string
    productName: string
    sku: string
    movementType: 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN'
    quantity: number
    previousStock: number
    newStock: number
    reason?: string
    createdAt: string
  }[]
  categoryStats: {
    name: string
    productCount: number
  }[]
  supplierStats: {
    name: string
    productCount: number
    orderCount: number
  }[]
  monthlyTrend: {
    month: string
    orderCount: number
    totalAmount: number
  }[]
}

export const reportsApi = {
  // レポートデータ取得
  getReports: (params: {
    shopId: string
    startDate?: string
    endDate?: string
  }): Promise<ReportData> =>
    api.get('/reports', { params }).then(res => res.data),
}

export default api