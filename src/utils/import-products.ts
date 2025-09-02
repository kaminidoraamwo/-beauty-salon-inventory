// 商品データのインポート用スクリプト

export const productData = [
  // カラー剤シリーズ
  { name: 'クイック NB7', category: 'カラー剤', brand: 'クイック', initial: 37, in: 18, out: 13, current: 42 },
  { name: 'クイック NB5', category: 'カラー剤', brand: 'クイック', initial: 16, in: 3, sold: 4, current: 15 },
  { name: '3NB', category: 'カラー剤', brand: '', initial: 7, in: 2, sold: 1, current: 8 },
  { name: '5NB', category: 'カラー剤', brand: '', initial: 6, in: 2, sold: 1, current: 7 },
  { name: '7NB', category: 'カラー剤', brand: '', initial: 13, in: 6, sold: 8, current: 11 },
  { name: '9NB', category: 'カラー剤', brand: '', initial: 30, in: 36, sold: 30, current: 36 },
  { name: '5BB', category: 'カラー剤', brand: '', initial: 1, sold: 1, current: 0 },
  { name: '5GA', category: 'カラー剤', brand: '', initial: 5, in: 1, sold: 1, current: 5 },
  { name: '7GA', category: 'カラー剤', brand: '', initial: 5, in: 2, sold: 2, current: 5 },
  { name: '12GA', category: 'カラー剤', brand: '', initial: 10, in: 2, sold: 6, current: 6 },
  { name: '5GB', category: 'カラー剤', brand: '', initial: 5, current: 5 },
  { name: '7GB', category: 'カラー剤', brand: '', initial: 3, current: 3 },
  { name: '12GB', category: 'カラー剤', brand: '', initial: 2, current: 2 },
  { name: '5GP', category: 'カラー剤', brand: '', initial: 4, sold: 1, current: 3 },
  { name: '7GP', category: 'カラー剤', brand: '', initial: 4, sold: 1, current: 3 },
  { name: '12GP', category: 'カラー剤', brand: '', initial: 3, current: 3 },
  { name: '2GNB', category: 'カラー剤', brand: '', initial: 2, current: 2 },
  { name: '5GNB', category: 'カラー剤', brand: '', initial: 6, sold: 1, current: 5 },
  { name: '7GNB', category: 'カラー剤', brand: '', initial: 5, in: 2, sold: 2, current: 5 },
  { name: '12GNB', category: 'カラー剤', brand: '', initial: 4, in: 3, sold: 2, current: 5 },
  { name: '3MT', category: 'カラー剤', brand: '', initial: 9, in: 3, sold: 4, current: 8 },
  { name: '6YM', category: 'カラー剤', brand: '', initial: 3, in: 1, current: 4 },
  { name: '8YM', category: 'カラー剤', brand: '', initial: 4, in: 1, sold: 1, current: 4 },
  { name: '10YM', category: 'カラー剤', brand: '', initial: 4, in: 1, sold: 1, current: 4 },
  { name: 'BV6', category: 'カラー剤', brand: '', initial: 2, current: 2 },
  { name: 'BV8', category: 'カラー剤', brand: '', initial: 3, sold: 1, current: 2 },
  { name: 'BV10', category: 'カラー剤', brand: '', initial: 4, current: 4 },
  { name: 'RV6', category: 'カラー剤', brand: '', initial: 1, in: 2, current: 3 },
  { name: 'RV8', category: 'カラー剤', brand: '', initial: 2, in: 1, sold: 1, current: 2 },
  { name: 'RV10', category: 'カラー剤', brand: '', initial: 2, in: 2, sold: 1, current: 3 },
  { name: 'C6', category: 'カラー剤', brand: '', initial: 1, current: 1 },
  { name: 'B6', category: 'カラー剤', brand: '', initial: 0, current: 0 },
  { name: 'BB', category: 'カラー剤', brand: '', initial: 0, current: 0 },
  { name: 'V6', category: 'カラー剤', brand: '', initial: 3, current: 3 },
  { name: 'V8', category: 'カラー剤', brand: '', initial: 1, current: 1 },
  { name: 'V10', category: 'カラー剤', brand: '', initial: 3, current: 3 },
  { name: 'P8', category: 'カラー剤', brand: '', initial: 1, in: 1, current: 2 },
  { name: 'P10', category: 'カラー剤', brand: '', initial: 1, in: 1, current: 2 },
  { name: 'O7', category: 'カラー剤', brand: '', initial: 1, current: 1 },
  { name: 'O10', category: 'カラー剤', brand: '', initial: 1, current: 1 },
  { name: 'R7', category: 'カラー剤', brand: '', initial: 2, sold: 1, current: 1 },
  { name: 'C8', category: 'カラー剤', brand: '', initial: 0, current: 0 },
  { name: 'C10', category: 'カラー剤', brand: '', initial: 1, sold: 1, current: 0 },
  { name: 'レッド', category: 'カラー剤', brand: '', initial: 1, current: 1 },
  { name: 'イエロー', category: 'カラー剤', brand: '', initial: 2, current: 2 },
  { name: 'マット', category: 'カラー剤', brand: '', initial: 1, current: 1 },
  { name: 'ブルー', category: 'カラー剤', brand: '', initial: 1, current: 1 },
  { name: 'バイオレット', category: 'カラー剤', brand: '', initial: 1, current: 1 },
  { name: 'アッシュ', category: 'カラー剤', brand: '', initial: 1, current: 1 },
  { name: 'ライトナー', category: 'カラー剤', brand: '', initial: 0, current: 0 },
  { name: 'グレー5', category: 'カラー剤', brand: '', initial: 4, in: 1, sold: 1, current: 4 },
  { name: 'グレー7', category: 'カラー剤', brand: '', initial: 4, in: 2, sold: 2, current: 4 },
  { name: 'グレー9', category: 'カラー剤', brand: '', initial: 4, in: 1, sold: 1, current: 4 },
  { name: 'グレー11', category: 'カラー剤', brand: '', initial: 4, current: 4 },
  { name: 'サンドベージュ5', category: 'カラー剤', brand: '', initial: 5, sold: 1, current: 4 },
  { name: 'サンドベージュ7', category: 'カラー剤', brand: '', initial: 5, sold: 1, current: 4 },
  { name: 'サンドベージュ9', category: 'カラー剤', brand: '', initial: 5, sold: 1, current: 4 },
  { name: 'サンドベージュ11', category: 'カラー剤', brand: '', initial: 2, in: 2, current: 4 },
  { name: 'ハイライトナー14', category: 'カラー剤', brand: '', initial: 0, in: 2, sold: 1, current: 1 },
  { name: 'ウルトラバイオレット', category: 'カラー剤', brand: '', initial: 1, current: 1 },
  { name: 'ネイビーブルー', category: 'カラー剤', brand: '', initial: 2, current: 2 },
  { name: 'ピンク6', category: 'カラー剤', brand: '', initial: 2, current: 2 },
  { name: 'クリア0', category: 'カラー剤', brand: '', initial: 7, in: 6, sold: 2, current: 11 },

  // マニキュアシリーズ
  { name: 'ナチュラルブラウン', category: 'ヘアマニキュア', brand: '', initial: 2, in: 4, out: 2, current: 4 },
  { name: 'ダークブラウン', category: 'ヘアマニキュア', brand: '', initial: 0, in: 2, current: 2 },
  { name: 'カッパーブラウン', category: 'ヘアマニキュア', brand: '', initial: 0, current: 0 },
  { name: 'オレンジブラウン', category: 'ヘアマニキュア', brand: '', initial: 0, current: 0 },
  { name: 'ピンク', category: 'ヘアマニキュア', brand: '', initial: 1, in: 1, out: 1, current: 1 },
  { name: 'オレンジ', category: 'ヘアマニキュア', brand: '', initial: 1, out: 1, current: 0 },
  { name: 'レッド', category: 'ヘアマニキュア', brand: '', initial: 1, in: 1, out: 1, current: 1 },
  { name: 'ブルー', category: 'ヘアマニキュア', brand: '', initial: 1, current: 1 },
  { name: 'パープル', category: 'ヘアマニキュア', brand: '', initial: 0, current: 0 },
  { name: 'イエロー', category: 'ヘアマニキュア', brand: '', initial: 1, current: 1 },
  { name: 'グリーン', category: 'ヘアマニキュア', brand: '', initial: 1, current: 1 },
  { name: 'ブラック', category: 'ヘアマニキュア', brand: '', initial: 1, in: 1, out: 1, current: 1 },
  { name: 'クリア', category: 'ヘアマニキュア', brand: '', initial: 2, in: 2, out: 1, current: 3 },

  // その他カテゴリ
  { name: '過水6%', category: 'その他', brand: '', initial: 4, in: 25, out: 18, current: 11 },
  { name: '過水3%', category: 'その他', brand: '', initial: 2, in: 2, out: 1, current: 3 },
  { name: 'ジェルオキシ2%', category: 'その他', brand: '', initial: 3, out: 1, current: 2 },
  { name: '過水2%', category: 'その他', brand: '', initial: 1, in: 1, current: 2 },
  { name: 'H1', category: 'その他', brand: '', initial: 3, in: 4, out: 2, current: 5 },
  { name: 'HD1', category: 'その他', brand: '', initial: 3, in: 3, out: 1, current: 5 },
  { name: 'CE SP', category: 'その他', brand: '', initial: 0, current: 0 },
  { name: 'CE TR', category: 'その他', brand: '', initial: 2, current: 2 },
  { name: 'エドルブリーチ', category: 'ブリーチ剤', brand: '', initial: 0, in: 1, current: 1 },
  { name: 'バブルオイル', category: 'その他', brand: '', initial: 2, current: 2 },
  { name: 'ACリムーバー', category: 'その他', brand: '', initial: 0, current: 0 },
  { name: 'カラーリムーバー', category: 'その他', brand: '', initial: 1, current: 1 },
  { name: 'プロテクトクリーム', category: 'その他', brand: '', initial: 1, in: 2, out: 1, current: 2 },
  { name: 'GMT', category: 'その他', brand: '', initial: 2, in: 3, out: 3, current: 2 },
  { name: 'スピエラ', category: 'その他', brand: '', initial: 0, current: 0 },
  { name: 'Pフェイスシート', category: 'その他', brand: '', initial: 7, in: 24, out: 10, current: 21 },
  { name: 'ラップ', category: 'その他', brand: '', initial: 1, in: 20, out: 9, current: 12 },
  { name: 'イヤーキャップ', category: 'その他', brand: '', initial: 2, current: 2 },
  { name: 'スペアペーパー', category: 'その他', brand: '', initial: 1, current: 1 },
  { name: 'ピンクスカット綿', category: 'その他', brand: '', initial: 1, in: 1, current: 2 },
  { name: 'アイビルエコホイル', category: 'その他', brand: '', initial: 1, current: 1 },

  // 髪トフ固材
  { name: '髪ドラ1', category: 'その他', brand: '髪トフ', initial: 26, current: 26 },
  { name: 'トドメ', category: 'その他', brand: '髪トフ', initial: 13, out: 3, current: 10 },
  { name: 'カツオ', category: 'その他', brand: '髪トフ', initial: 5, current: 5 },
  { name: 'ワカメ', category: 'その他', brand: '髪トフ', initial: 4, current: 4 },
  { name: 'マスオ', category: 'その他', brand: '髪トフ', initial: 14, out: 10, current: 4 },
  { name: 'アナゴ', category: 'その他', brand: '髪トフ', initial: 2, out: 1, current: 1 },
  { name: 'レシーブ', category: 'その他', brand: '髪トフ', initial: 1, current: 1 },
  { name: '新レシーブ', category: 'その他', brand: '髪トフ', initial: 4, current: 4 },
  { name: 'ヒカリン', category: 'その他', brand: '髪トフ', initial: 40, out: 1, current: 39 },
  { name: 'ヌメリン', category: 'その他', brand: '髪トフ', initial: 23, out: 3, current: 20 },
  { name: 'リセットシャンプー', category: 'シャンプー', brand: '髪トフ', initial: 11, out: 8, current: 3 },
  { name: 'つるりんちょ0', category: 'その他', brand: 'つるりんちょ', initial: 24, out: 1, current: 23 },
  { name: 'つるりんちょの素', category: 'その他', brand: 'つるりんちょ', initial: 12, out: 2, current: 10 },
  { name: 'KATSUO9.0', category: 'その他', brand: '髪トフ', initial: 30, out: 21, current: 9 },
  { name: 'SHAKE7.0', category: 'その他', brand: '髪トフ', initial: 14, out: 3, current: 11 },
  { name: 'WAKAME4.5', category: 'その他', brand: '髪トフ', initial: 19, out: 5, current: 14 },
  { name: 'KAPPA', category: 'その他', brand: '髪トフ', initial: 4, out: 1, current: 3 },
  { name: 'グッピー', category: 'その他', brand: '髪トフ', initial: 3, in: 2, out: 3, current: 2 },
  { name: 'BBQ', category: 'その他', brand: '髪トフ', initial: 3, in: 1, out: 2, current: 2 },
  { name: 'つるりんちょサシェ', category: 'その他', brand: 'つるりんちょ', initial: 329, current: 329 },

  // Ange シリーズ
  { name: 'Ange SP 1', category: 'スタイリング剤', brand: 'Ange', initial: 3, current: 3 },
  { name: 'Ange SP 2', category: 'スタイリング剤', brand: 'Ange', initial: 3, sold: 2, current: 1 },
  { name: 'Ange TR 4', category: 'トリートメント', brand: 'Ange', initial: 9, current: 9 },
  
  // アマトラ シリーズ
  { name: 'アマトラTR(ボリューム)', category: 'トリートメント', brand: 'アマトラ', initial: 6, current: 6 },
  { name: 'アマトラTR(レスキュー)', category: 'トリートメント', brand: 'アマトラ', initial: 1, current: 1 },
  
  // N. シリーズ
  { name: 'N.ポリッシュオイル', category: 'アウトバス', brand: 'N.', initial: 3, current: 3 },
  { name: 'N.ポリッシュオイルSC', category: 'アウトバス', brand: 'N.', initial: 0, current: 0 },
  { name: 'N.SHEAオイル', category: 'アウトバス', brand: 'N.', initial: 2, current: 2 },
  { name: 'N.スタイリングセラム', category: 'スタイリング剤', brand: 'N.', initial: 0, current: 0 },
  { name: 'N.スタイリングセラム小', category: 'スタイリング剤', brand: 'N.', initial: 8, current: 8 },
  { name: 'N.スプレー1', category: 'スタイリング剤', brand: 'N.', initial: 7, current: 7 },
  
  // ジオ シリーズ
  { name: 'ジオスタンダード', category: 'スタイリング剤', brand: 'ジオ', initial: 1, in: 1, out: 1, current: 1 },
  { name: 'シャンプー マイルド', category: 'シャンプー', brand: 'ジオ', initial: 0, current: 0 },
  { name: 'ジオスタンダード スキャルプ&ヘアカプセルモイスチャー', category: 'スタイリング剤', brand: 'ジオ', initial: 2, in: 1, out: 1, current: 0 },
  { name: 'ジオスタンダード スキャルプリファイン', category: 'スタイリング剤', brand: 'ジオ', initial: 2, current: 2 },
  { name: 'ジオスタンダード バブルクレンス', category: 'スタイリング剤', brand: 'ジオ', initial: 2, current: 2 },
  
  // トリエ シリーズ
  { name: 'トリエ スプレー10', category: 'スタイリング剤', brand: 'トリエ', initial: 4, in: 3, out: 1, sold: 4, current: 2 },
  { name: 'トリエ スプレー5', category: 'スタイリング剤', brand: 'トリエ', initial: 4, current: 4 },
  { name: 'トリエ ムース6', category: 'スタイリング剤', brand: 'トリエ', initial: 1, current: 1 },
  { name: 'トリエ エマルジョン10', category: 'スタイリング剤', brand: 'トリエ', initial: 3, current: 3 },
  { name: 'トリエ エマルジョン8', category: 'スタイリング剤', brand: 'トリエ', initial: 2, in: 1, out: 1, current: 2 },
  { name: 'トリエ フリュード10', category: 'スタイリング剤', brand: 'トリエ', initial: 3, out: 1, current: 2 },
  { name: 'moii コンク', category: 'アウトバス', brand: 'moii', initial: 1, out: 1, current: 0 },
  
  // コタ シリーズ
  { name: 'コタ SP大 5', category: 'シャンプー', brand: 'コタ', initial: 1, current: 1 },
  { name: 'コタ SP小 7', category: 'シャンプー', brand: 'コタ', initial: 1, current: 1 },
  
  // アルピュア シリーズ
  { name: 'アルピュア ミスト洗顔', category: 'その他', brand: 'アルピュア', initial: 5, current: 5 },
  { name: 'アルピュア クリーム', category: 'その他', brand: 'アルピュア', initial: 1, current: 1 },
  { name: 'ARエッセンス 新', category: 'その他', brand: 'AR', initial: 3, out: 1, current: 2 },
  
  // つるりんちょ シリーズ
  { name: 'つるりんちょSP レフィル', category: 'シャンプー', brand: 'つるりんちょ', initial: 23, out: 1, sold: 14, current: 8 },
  { name: 'つるりんちょTR レフィル', category: 'トリートメント', brand: 'つるりんちょ', initial: 31, out: 2, sold: 6, current: 23 },
  { name: 'つるりんちょ SARARITOレフィル', category: 'トリートメント', brand: 'つるりんちょ', initial: 15, sold: 3, current: 12 },
  { name: 'つるりんちょSP レフィル初恋', category: 'シャンプー', brand: 'つるりんちょ', initial: 13, in: 24, out: 2, sold: 13, current: 22 },
  { name: 'つるりんちょTR レフィル初恋', category: 'トリートメント', brand: 'つるりんちょ', initial: 16, in: 24, out: 2, sold: 6, current: 32 },
  { name: 'つるりんちょSP', category: 'シャンプー', brand: 'つるりんちょ', initial: 7, sold: 6, current: 1 },
  { name: 'つるりんちょTR', category: 'トリートメント', brand: 'つるりんちょ', initial: 14, sold: 2, current: 12 },
  { name: 'つるりんちょ SARARITO', category: 'トリートメント', brand: 'つるりんちょ', initial: 50, sold: 1, current: 49 },
  { name: 'つるりんちょ BOOSTER', category: 'トリートメント', brand: 'つるりんちょ', initial: 45, sold: 3, current: 42 },
  { name: 'つるりんちょ SP 80g', category: 'シャンプー', brand: 'つるりんちょ', initial: 27, sold: 4, current: 23 },
  { name: 'つるりんちょ TR 80g', category: 'トリートメント', brand: 'つるりんちょ', initial: 27, sold: 4, current: 23 },
  
  // いるかのせなか シリーズ
  { name: 'いるかのせなか オイル', category: 'アウトバス', brand: 'いるかのせなか', initial: 60, out: 3, sold: 17, current: 40 },
  { name: 'いるかのせなか クリーム', category: 'アウトバス', brand: 'いるかのせなか', initial: 73, out: 3, sold: 5, current: 65 },
  { name: 'いるかのせなか ミスト', category: 'アウトバス', brand: 'いるかのせなか', initial: 34, out: 2, sold: 1, current: 31 },
  { name: 'いるかのせなか フォーム', category: 'スタイリング剤', brand: 'いるかのせなか', initial: 26, out: 2, sold: 3, current: 21 },
  
  // エルジューダ シリーズ
  { name: 'エルジューダ ポイントケアスティック', category: 'アウトバス', brand: 'エルジューダ', initial: 4, out: 1, sold: 1, current: 2 },
  
  // マグネット シリーズ
  { name: 'マグネットプロドライヤー', category: '電化製品', brand: 'マグネット', initial: 2, current: 2 },
  { name: 'マグネットプロカールアイロン32mm', category: '電化製品', brand: 'マグネット', initial: 0, current: 0 },
  { name: 'マグネットプロストレートアイロン グレー', category: '電化製品', brand: 'マグネット', initial: 0, current: 0 }
]

export function importProductsToLocalStorage() {
  const products: any[] = []
  const inventory: any[] = []
  const inventoryHistory: any[] = []
  
  productData.forEach((item, index) => {
    const productId = `product_${Date.now()}_${index}`
    
    // 商品データ
    products.push({
      id: productId,
      name: item.name,
      brand: item.brand || '',
      category: item.category,
      volume: '',
      unit: '個',
      purchase_price: 0,
      selling_price: 0,
      supplier_name: '',
      notes: '',
      barcode: '',
      image_url: ''
    })
    
    // 在庫データ
    const currentQuantity = item.current || 0
    inventory.push({
      id: `inv_${Date.now()}_${index}`,
      product_id: productId,
      product_name: item.name,
      category: item.category,
      initial_stock: item.initial || 0,
      in_stock: item.in || 0,
      out_stock: item.out || 0,
      sold_stock: item.sold || 0,
      external_transfer: 0,
      current_quantity: currentQuantity,
      min_quantity: 5,
      max_quantity: 50,
      unit: '個',
      status: currentQuantity === 0 ? 'out' : currentQuantity < 10 ? 'low' : 'normal',
      last_updated: new Date().toISOString(),
      expiry_date: null,
      sortOrder: index
    })
    
    // 初期在庫履歴
    inventoryHistory.push({
      id: `hist_${Date.now()}_${index}`,
      product_id: productId,
      product_name: item.name,
      quantity_change: item.initial || 0,
      reason: 'データインポート',
      created_at: new Date().toISOString()
    })
  })
  
  // LocalStorageに保存
  localStorage.setItem('beauty-salon-products', JSON.stringify(products))
  localStorage.setItem('beauty-salon-inventory', JSON.stringify(inventory))
  localStorage.setItem('beauty-salon-inventory-history', JSON.stringify(inventoryHistory))
  
  return {
    productsCount: products.length,
    inventoryCount: inventory.length,
    historyCount: inventoryHistory.length
  }
}