# Beauty Salon Inventory - 美容室商品管理システム

## 📋 プロジェクト概要

小規模美容室向けの在庫管理Webアプリケーション
- **目的**: Excel管理からの脱却、デジタル在庫管理
- **技術**: Next.js + Supabase (完全無料構成)
- **開発期間**: 4週間
- **対象**: 従業員1-5名の美容室

## 🚀 クイックスタート

```bash
# 1. プロジェクト作成
npx create-next-app@latest beauty-salon-inventory --typescript --tailwind --eslint --app --src-dir

# 2. 依存関係インストール
cd beauty-salon-inventory
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @hookform/resolvers react-hook-form zod zustand date-fns lucide-react

# 3. shadcn/ui セットアップ
npx shadcn-ui@latest init -d
npx shadcn-ui@latest add button card form input table select dialog alert badge tabs

# 4. 開発サーバー起動
npm run dev
```

## 📅 開発スケジュール

### Week 1: 基盤構築
- [x] プロジェクト作成・環境構築
- [x] Supabase設定・DB設計
- [ ] 認証機能実装
- [ ] 基本レイアウト・ナビゲーション

### Week 2: コア機能
- [ ] 商品管理機能（CRUD）
- [ ] 在庫管理機能
- [ ] 使用期限管理・アラート

### Week 3: 応用機能
- [ ] レポート機能
- [ ] 発注管理機能
- [ ] バーコード読み取り

### Week 4: 仕上げ
- [ ] PWA対応
- [ ] テスト・バグ修正
- [ ] デプロイ・本番環境

## 🔧 技術スタック

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Storage)
- **UI**: shadcn/ui, Radix UI
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Deployment**: Vercel

## 📖 詳細ドキュメント

- [開発手順詳細](./DEVELOPMENT.md)
- [要件定義](./docs/requirements.md)
- [データベース設計](./docs/database-design.md)
- [API仕様](./docs/api-reference.md)
- [デプロイ手順](./docs/deployment.md)

## 🎯 実装機能

### ✅ 実装済み
- [ ] ユーザー認証
- [ ] 基本レイアウト

### 🚧 開発中
- [ ] 商品管理
- [ ] 在庫管理

### 📋 予定
- [ ] レポート機能
- [ ] 発注管理
- [ ] バーコード機能
- [ ] PWA対応

## 📊 進捗管理

### 今週のタスク
- [ ] Supabaseデータベース構築
- [ ] ログイン画面実装
- [ ] ダッシュボード基本画面

### 次週のタスク  
- [ ] 商品登録機能
- [ ] 在庫数量管理
- [ ] 期限切れアラート

## 🔗 重要リンク

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

## 💡 開発メモ

### 環境変数設定
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### よく使うコマンド
```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 新しいshadcn/uiコンポーネント追加
npx shadcn-ui@latest add [component-name]

# Supabase型生成
npx supabase gen types typescript --project-id YOUR_PROJECT_ID
```

## 🐛 トラブルシューティング

### よくある問題と解決法
1. **Supabase接続エラー**: 環境変数の確認
2. **認証エラー**: RLSポリシーの設定確認  
3. **ビルドエラー**: TypeScript型定義の確認

## 📞 サポート・連絡先

- **開発者**: [あなたの名前]
- **Email**: [メールアドレス]
- **GitHub**: [GitHubアカウント]

---

**最終更新**: 2024年8月30日