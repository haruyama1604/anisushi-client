# anisushi-client

アニメ特化の回転寿司SNS「あにすし」のフロントエンド。

## 本番URL

https://anisushi-client.vercel.app

## 技術スタック

| 技術 | 用途 |
|---|---|
| React 19 / TypeScript | UIフレームワーク・言語 |
| Vite | ビルドツール |
| Vercel | デプロイ・ホスティング |

バックエンドAPIは別リポジトリ（[anisushi-server](https://github.com/haruyama1604/anisushi-server)）。

## 主な機能

- **コンベアベルト表示** — 投稿が回転寿司のように流れる（`requestAnimationFrame` で60fps）
- **tierシステム** — いいね数に応じて皿の色が変わる（金・銀・赤）
- **いいね** — 投稿・コメントにいいねできる
- **コメント・返信** — 投稿にコメントと返信を追加できる
- **箱（コレクション）** — 気に入った投稿をまとめて保存できる
- **ネタバレ機能** — ネタバレ投稿はブラーをかけて隠す
- **モバイル対応** — レイアウト・ジェスチャ操作含めスマートフォン対応

## 主な技術的工夫

### 1. 匿名 JWT のブートストラップ

サインアップ不要のUXを守りつつ、本人判定はサーバ側 JWT 署名検証に任せる。

- 初回起動時に `POST /auth/anonymous` を呼び、`token` と `user_id` を `localStorage` に永続化
- 以降の全ての fetch は `authFetch` ラッパーで `Authorization: Bearer <token>` ヘッダを自動付与
- 401 を受け取った場合（期限切れ・SECRET ローテーション）はトークンを破棄して1回だけ自動リトライ
- 認証が完了するまで UI レンダリングをブロック（読み込み画面 / エラー時は再試行ボタン）

### 2. 単一エンドポイントでコメント＋返信を取得

旧実装は各コメントごとに `/replies` を個別 fetch していたが、サーバ側で replies がネストされたため、コメントモーダルを開く際のリクエストが N+1 → 1 に削減された。

### 3. tierシステム

```
likes >= 200 → gold（金皿）
likes >= 80  → silver（銀皿）
それ以外     → normal（赤皿、likes=0 含む）
```

サーバ側で都度計算した値をそのまま使用。views は旧実装で比率方式を取っていたが、過剰設計だったため撤去（server README §2 参照）。

## ローカル起動

```bash
npm install
npm run dev
```

バックエンド URL は `src/utils/api.ts` の `API_BASE` で設定（`VITE_API_BASE` 環境変数で上書き可能）。

## プロジェクト構成

```
src/
├── types/
│   └── index.ts               # Post, Comment, Reply, Bucket, Selected, NavPage 型
├── utils/
│   ├── api.ts                 # API_BASE, ensureAuth, authFetch, getStoredUserId
│   └── categories.ts          # アニメカテゴリ・tier設定
├── components/
│   ├── PlateCard.tsx          # 寿司皿カード（投稿1件分のUI）
│   ├── ConveyorBelt.tsx       # 回転コンベアアニメーション
│   ├── Sidebar.tsx            # サイドバー（PC）
│   ├── BottomNav.tsx          # ボトムナビ（モバイル）
│   ├── StatsBar.tsx           # ステータスバー
│   └── modals/
│       ├── CommentModal.tsx       # コメント・返信モーダル
│       ├── PostModal.tsx          # 投稿作成モーダル
│       ├── SettingsModal.tsx      # 設定モーダル
│       ├── BucketSelectorModal.tsx  # 箱選択モーダル
│       └── BucketDetailModal.tsx    # 箱詳細モーダル
└── App.tsx                    # 状態管理・レイアウト・認証ブートストラップ
```

## 改善案・既知の課題

- **スタイリングを Tailwind に統一**：現状は inline style 中心。Tailwind と shadcn は導入済みだが活用しきれていない
- **アクセシビリティ**：div + onClick の箇所を button 要素に置換、aria 属性追加
- **エラー UI**：fetch 失敗を握りつぶしている箇所がある。Toast 通知などでユーザーに伝える
- **状態管理**：App.tsx に状態が集中している。複雑化したら Zustand などへの分離を検討
