# 開発手順詳細ガイド

## 🎯 このドキュメントの使い方

このドキュメントは美容室商品管理システムの開発を段階的に進めるためのステップバイステップガイドです。各セクションを順番に実行してください。

---

## 📦 Phase 1: 環境構築（Day 1-2）

### Step 1.1: 必要ツールの確認
```bash
# Node.js バージョン確認（18.17以上必要）
node --version

# Git確認
git --version

# 未インストールの場合
# Node.js: https://nodejs.org/ からダウンロード
# Git: https://git-scm.com/ からダウンロード
```

### Step 1.2: プロジェクト作成
```bash
# Next.jsプロジェクト作成
npx create-next-app@latest beauty-salon-inventory \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd beauty-salon-inventory
```

### Step 1.3: 依存関係インストール
```bash
# Supabase関連
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# Form・Validation
npm install @hookform/resolvers react-hook-form zod

# State管理・Utility
npm install zustand date-fns lucide-react

# UI Components
npm install @radix-ui/react-select @radix-ui/react-dialog @radix-ui/react-tabs
npm install recharts class-variance-authority clsx tailwind-merge

# Development
npm install -D @types/node
```

### Step 1.4: shadcn/ui セットアップ
```bash
# 初期化
npx shadcn-ui@latest init -d

# 基本コンポーネント追加
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add table
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
```

### Step 1.5: プロジェクト構造確認
```
beauty-salon-inventory/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/          # React Components
│   │   └── ui/             # shadcn/ui components
│   └── lib/                # Utilities
│       └── utils.ts
├── public/
├── package.json
└── tailwind.config.js
```

---

## 🗄️ Phase 2: Supabase設定（Day 2-3）

### Step 2.1: Supabaseプロジェクト作成
1. https://supabase.com にアクセス
2. "Start your project" クリック
3. GitHubでサインアップ
4. "New project" を作成:
   - **Project name**: beauty-salon-inventory
   - **Database password**: 強力なパスワード設定
   - **Region**: Northeast Asia (Tokyo)

### Step 2.2: API Key取得
```bash
# Supabase Dashboard > Settings > API
# 以下をコピー:
# - Project URL
# - anon/public key

# .env.localファイル作成
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EOF

# .env.exampleも作成（GitHubにpush用）
cat > .env.example << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EOF
```

### Step 2.3: データベーステーブル作成
```sql
-- Supabase Dashboard > SQL Editor で以下を実行

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 店舗テーブル
CREATE TABLE public.shops (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. プロファイルテーブル
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    email VARCHAR(255),
    full_name VARCHAR(255),
    role VARCHAR(20) DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. 商品マスターテーブル
CREATE TABLE public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    category VARCHAR(100),
    volume VARCHAR(50),
    unit VARCHAR(20) DEFAULT 'ml',
    purchase_price INTEGER DEFAULT 0,
    selling_price INTEGER DEFAULT 0,
    supplier_name VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. 在庫テーブル
CREATE TABLE public.inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    current_quantity INTEGER NOT NULL DEFAULT 0,
    expiry_date DATE,
    batch_number VARCHAR(50),
    last_updated_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. 在庫取引履歴テーブル
CREATE TABLE public.inventory_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('in', 'out', 'adjustment')),
    quantity INTEGER NOT NULL,
    reason VARCHAR(255),
    notes TEXT,
    performed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. サプライヤーテーブル
CREATE TABLE public.suppliers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Step 2.4: Row Level Security (RLS) 設定
```sql
-- RLS有効化
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- 基本的なRLSポリシー
CREATE POLICY "Users can view own shop" ON public.shops FOR ALL USING (
    id IN (SELECT shop_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can view own profile" ON public.profiles FOR ALL USING (
    id = auth.uid()
);

CREATE POLICY "Users can manage shop products" ON public.products FOR ALL USING (
    shop_id IN (SELECT shop_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can manage shop inventory" ON public.inventory FOR ALL USING (
    product_id IN (
        SELECT id FROM public.products 
        WHERE shop_id IN (SELECT shop_id FROM public.profiles WHERE id = auth.uid())
    )
);

CREATE POLICY "Users can view shop transactions" ON public.inventory_transactions FOR ALL USING (
    product_id IN (
        SELECT id FROM public.products 
        WHERE shop_id IN (SELECT shop_id FROM public.profiles WHERE id = auth.uid())
    )
);

CREATE POLICY "Users can manage shop suppliers" ON public.suppliers FOR ALL USING (
    shop_id IN (SELECT shop_id FROM public.profiles WHERE id = auth.uid())
);
```

---

## 💻 Phase 3: 基本実装（Day 3-7）

### Step 3.1: Supabase接続ファイル作成
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      shops: {
        Row: {
          id: string
          name: string
          owner_email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_email?: string | null
        }
        Update: {
          name?: string
          owner_email?: string | null
        }
      }
      products: {
        Row: {
          id: string
          shop_id: string
          name: string
          brand: string | null
          category: string | null
          volume: string | null
          unit: string | null
          purchase_price: number | null
          selling_price: number | null
          supplier_name: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          shop_id: string
          name: string
          brand?: string | null
          category?: string | null
          volume?: string | null
          unit?: string | null
          purchase_price?: number | null
          selling_price?: number | null
          supplier_name?: string | null
          notes?: string | null
        }
        Update: {
          name?: string
          brand?: string | null
          category?: string | null
          volume?: string | null
          unit?: string | null
          purchase_price?: number | null
          selling_price?: number | null
          supplier_name?: string | null
          notes?: string | null
        }
      }
      inventory: {
        Row: {
          id: string
          product_id: string
          current_quantity: number
          expiry_date: string | null
          batch_number: string | null
          last_updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          product_id: string
          current_quantity?: number
          expiry_date?: string | null
          batch_number?: string | null
          last_updated_by?: string | null
        }
        Update: {
          current_quantity?: number
          expiry_date?: string | null
          batch_number?: string | null
          last_updated_by?: string | null
        }
      }
    }
  }
}
```

### Step 3.2: 基本レイアウト作成
```typescript
// src/app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Beauty Salon Inventory',
  description: '美容室在庫管理システム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

### Step 3.3: 認証ページ作成
```typescript
// src/app/auth/page.tsx
import { AuthForm } from '@/components/auth-form'

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Beauty Salon Inventory
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            美容室在庫管理システム
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}
```

---

## 📝 継続的な進捗管理

### 毎日の作業記録
```markdown
## 作業ログ

### 2024-08-30
- [x] プロジェクト作成完了
- [x] Supabase設定完了
- [ ] 認証機能実装中

### 2024-08-31  
- [ ] 認証機能完成
- [ ] 基本レイアウト作成
- [ ] ダッシュボード画面着手
```

### 問題・解決記録
```markdown
## トラブルシューティング記録

### 問題: Supabase接続エラー
**日付**: 2024-08-30
**エラー**: Invalid API key
**解決**: .env.localファイルの環境変数を再確認
**メモ**: 環境変数の値にスペースが入っていた

### 問題: TypeScriptエラー
**日付**: 2024-08-31  
**エラー**: Property 'id' does not exist on type
**解決**: Database型定義を更新
**メモ**: Supabaseの型生成コマンドを実行
```

---

## 🔄 定期レビュー・振り返り

### 週次レビュー項目
- [ ] 今週の目標達成度
- [ ] 発生した問題と解決策
- [ ] 次週の計画調整
- [ ] 新しく学んだ技術・知識
- [ ] 改善できるプロセス

### 技術的負債チェック
- [ ] コードの品質確認
- [ ] テストカバレッジ
- [ ] セキュリティ確認
- [ ] パフォーマンス測定
- [ ] ドキュメント更新

---

**このドキュメントは開発の進行に合わせて随時更新してください。**