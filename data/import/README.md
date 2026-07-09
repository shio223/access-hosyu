# CSVデータ取り込み手順

AccessからエクスポートしたCSVを、このWebアプリのデータベースに取り込む手順です。

## 1. AccessからCSVをエクスポート

Accessで対象テーブルを開き、**外部データ → テキストファイル** または **エクスポート** からCSV形式で保存してください。

推奨ファイル名（自動判別に使用）:

| ファイル名の例 | 取り込み先 |
|---------------|-----------|
| `保守実績.csv` | 保守実績データ |
| `設備マスタ.csv` | 設備マスタ |
| `得意先マスタ.csv` | 得意先マスタ |

**文字コード:** UTF-8（Excelで保存する場合は「CSV UTF-8」を選択）

## 2. 取り込み方法（2通り）

### 方法A: 画面からアップロード（推奨）

1. 開発サーバーを起動: `npm run dev`
2. http://localhost:3000/maintenance/upload を開く
3. **参照** ボタンでCSVファイルを選択
4. **アップロード実行** をクリック
5. コマンド欄に取込結果が表示されます

### 方法B: コマンドライン

```bash
# 保守実績CSVを取り込み
npm run import:csv -- data/import/保守実績.csv

# 設備マスタを取り込み
npm run import:csv -- data/import/設備マスタ.csv

# 既存データを削除してから全件取り込み（再インポート時）
npm run import:csv -- data/import/保守実績.csv --clear
```

## 3. 必要なCSV列（ヘッダー行）

### 保守実績データ（約70,000件）

必須: `得意先コード`, `設備番号`  
推奨: `作業日`, `作業コード`, `作業種別`, `作業内容`, `稼働時間`, `客先担当`, `担当者コード`, `担当者名`, `入力者コード`, `入力者名`

### 設備マスタ

必須: `得意先コード`, `設備番号`  
推奨: `得意先名`, `設備名`, `運転状況`, `機種名`, `メーカー名`, `型式`, `管理番号`, 住所・電話・点検関連など

## 4. 取り込み後の確認

- **設備別保守実績照会:** http://localhost:3000/equipment/maintenance-inquiry
- **件数確認:** http://localhost:3000/maintenance/upload（クラウドデータ件数に表示）

## 5. サンプルデータ

動作確認用のサンプルCSVが同梱されています:

```bash
npm run import:csv -- data/import/sample_設備マスタ.csv
npm run import:csv -- data/import/sample_保守実績.csv
```

## 注意事項

- 元のAccessデータは変更されません（CSVのコピーを取り込むだけです）
- データは `data/hosyu.db`（SQLite）に保存されます
- 将来Supabaseへ移行する際も、同じテーブル構造を流用できます
- 列名が異なる場合は `src/lib/import/column-maps.ts` にエイリアスを追加できます
