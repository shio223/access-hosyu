# Supabase 移行セットアップ

会社向け保守管理データの本番は Supabase を使用します。  
ローカル SQLite（`data/hosyu.db`）は当面削除しません。

## あなたが手動で行うこと

### 1. プロジェクトとAPIキー

1. [Supabase Dashboard](https://supabase.com/dashboard) でプロジェクトを用意
2. **Project Settings → API** から以下を控える
   - Project URL
   - `anon` `public` key
   - `service_role` `secret` key（**ブラウザ・NEXT_PUBLIC に絶対に出さない**）

### 2. `.env.local` を作成

```bash
cp .env.local.example .env.local
```

値を埋めます。

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=（anon）
SUPABASE_SERVICE_ROLE_KEY=（service_role ※NEXT_PUBLIC_ を付けない）
AUTH_LOGIN_EMAIL=（社内共通ユーザーの Auth メール ※サーバー専用）
```

ログインは犬イラストを左→右へ3回撫でる方式です（ID/パスワード入力はありません）。  
サーバーが `AUTH_LOGIN_EMAIL` の共通 Auth ユーザーでセッションを発行します（メール・パスワードはフロントに書きません）。  
`service_role` は pet-login API（サーバー）のみで使用し、ブラウザには出しません。

### 3. SQL を実行

Dashboard の **SQL Editor** で次を実行します。

`supabase/migrations/001_customers_maintenance_records.sql`

- 新規テーブル `customers` / `maintenance_records` のみ作成
- 既存テーブルは削除・変更しません
- RLS は **authenticated の SELECT のみ**許可（anon 不可）

同名テーブルが既にある場合は実行前に確認してください。

### 4. Auth ユーザーを作成

**Authentication → Users → Add user** で社内ユーザーを作成（メール + パスワード）。  
アプリは `/login` から Supabase Auth でログインします。

### 5. ドライラン（本番投入なし）

```bash
npm run import:supabase -- --dry-run
```

Excel 読取・件数・`source_hash` 重複・先頭ゼロ・紐付け率を確認します。  
**このコマンドだけでは DB に書き込みません。**

### 6. 本番投入（別途指示があるまで実行しない）

確認後、明示的に:

```bash
npm run import:supabase -- --execute
```

`service_role` で 800件バッチ upsert（`ON CONFLICT source_hash`）。

## アプリ起動

```bash
npm run dev
```

未ログイン時は `/login` へリダイレクトされます。

## 重複防止

- `maintenance_records.source_hash` のみ UNIQUE
- Excel 元9列から SHA-256（自然キー5列の UNIQUE は付けない）

## 設備照会

設備マスタ未移行のため、`得意先コード + 設備番号` で `maintenance_records` を表示します。  
得意先名は `customers` を LEFT JOIN 相当で付与します。
