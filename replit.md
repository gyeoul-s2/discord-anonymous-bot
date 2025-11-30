# Discord匿名メッセージボット

## 概要
DMで受信したメッセージを匿名でサーバーチャンネルに転送するDiscordボットです。

## 機能
- **匿名メッセージ転送**: ユーザーがボットにDMを送ると、指定されたチャンネルに匿名で転送
- **@メンション・絵文字・フォーマット保持**: メッセージ内容をそのまま転送
- **画像・ファイル添付サポート**: 添付ファイルも転送可能
- **レート制限**: 1分間に最大5件のメッセージ送信制限（荒らし対策）
- **ブロックリスト**: 管理者が特定ユーザーをブロック可能
- **ログ記録**: 送信者情報を別チャンネルに記録
- **ステータスダッシュボード**: ウェブ上でボットの状態と統計を確認

## 管理者コマンド（Discord内で使用）
- `!anonblock @user` - ユーザーをブロック
- `!anonunblock @user` - ブロック解除
- `!anonstats` - 統計を表示
- `!anonhelp` - ヘルプを表示

## 環境変数
- `DISCORD_BOT_TOKEN`: Discordボットトークン（シークレット）
- `DISCORD_TARGET_CHANNEL_ID`: 匿名メッセージを投稿するチャンネルID
- `DISCORD_LOG_CHANNEL_ID`: ログを記録するチャンネルID

## プロジェクト構造
```
server/
├── discord-bot.ts  # Discordボットのメインロジック
├── routes.ts       # APIエンドポイント
├── index.ts        # サーバーエントリーポイント
└── storage.ts      # ストレージインターフェース

client/src/
├── pages/
│   └── home.tsx    # ダッシュボードページ
├── App.tsx         # ルーティング
└── index.css       # スタイル

shared/
└── schema.ts       # データスキーマ
```

## 技術スタック
- **Backend**: Node.js, Express, discord.js v14
- **Frontend**: React, TanStack Query, Tailwind CSS, shadcn/ui
- **言語**: TypeScript

## 起動方法
`npm run dev` でサーバーとボットが同時に起動します。

## 最近の変更
- 2025-11-30: 初期実装完了
  - Discordボットのコア機能
  - 匿名メッセージ転送
  - レート制限とブロックリスト
  - 管理者コマンド
  - ウェブダッシュボード
