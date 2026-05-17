# anisushi-client

アニメ特化の回転寿司SNS「あにすし」のフロントエンド。

## 本番URL

https://anisushi-client.vercel.app

## 技術スタック

| 技術 | 用途 |
|---|---|
| React / TypeScript | UIフレームワーク・言語 |
| Vite | ビルドツール |
| Vercel | デプロイ・ホスティング |

## 主な機能

- **コンベアベルト表示** — 投稿が回転寿司のように流れる
- **tierシステム** — いいね率に応じて皿の色が変わる（金・銀・赤）
- **いいね** — 投稿・コメントにいいねできる
- **コメント・返信** — 投稿にコメントと返信を追加できる
- **箱（コレクション）** — 気に入った投稿をまとめて保存できる
- **ネタバレ機能** — ネタバレ投稿はブラーをかけて隠す
- **設定** — アニメ部屋の切り替え
- **モバイル対応** — スマートフォンでも快適に使える

## tier計算ロジック

```
likes / views >= 0.7 → gold（金皿）
likes / views >= 0.4 → silver（銀皿）
それ以外           → normal（赤皿）
views = 0          → normal
```

## ローカル起動

```bash
npm install
npm run dev
```

## プロジェクト構成

```
src/
├── types/
│   └── index.ts               # 型定義
├── utils/
│   ├── api.ts                 # APIベースURL・ユーザーID管理
│   └── categories.ts          # アニメカテゴリ・tier設定
├── components/
│   ├── PlateCard.tsx          # 寿司皿カード
│   ├── ConveyorBelt.tsx       # コンベアベルト
│   ├── Sidebar.tsx            # サイドバー（PC）
│   ├── BottomNav.tsx          # ボトムナビ（モバイル）
│   ├── StatsBar.tsx           # ステータスバー
│   └── modals/
│       ├── CommentModal.tsx       # コメント・返信モーダル
│       ├── PostModal.tsx          # 投稿作成モーダル
│       ├── SettingsModal.tsx      # 設定モーダル
│       ├── BucketSelectorModal.tsx  # 箱選択モーダル
│       └── BucketDetailModal.tsx    # 箱詳細モーダル
└── App.tsx                    # 状態管理・レイアウト
```

## 環境変数

バックエンドURLは `src/utils/api.ts` の `API_BASE` で設定。
