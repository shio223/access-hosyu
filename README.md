# 保守管理システム（Access 互換 Web）

本番データは **Supabase** を使用します。セットアップは [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) を参照してください。

## ローカル起動

```bash
cp .env.local.example .env.local
# .env.local に Supabase URL / anon / service_role を設定
# SQL Editor で supabase/migrations/001_customers_maintenance_records.sql を実行
# Authentication でユーザーを作成

npm run dev
```

未ログイン時は `/login` へリダイレクトされます。

## データインポート（CLI）

```bash
# 書き込みなし（件数・紐付け率の確認）
npm run import:supabase -- --dry-run

# 本番投入（確認後に明示実行）
npm run import:supabase -- --execute
```

`import-data/` 内の Excel は Git 管理対象外です。`data/hosyu.db`（SQLite）は当面削除しません。
