/**
 * 保守管理システム - プロジェクト構成メモ
 *
 * ## 画面一覧（App Router）
 * | パス | 画面名 |
 * |------|--------|
 * | / | メインメニュー（参照処理） |
 * | /update | メインメニュー（更新処理） |
 * | /equipment/maintenance-inquiry | 設備別保守実績照会 |
 * | /maintenance/search | 保守実績データ検索 |
 * | /equipment/search | 設備マスタ検索 |
 * | /customer/search | 得意先マスタ検索 |
 * | /dealer/search | 販売店マスタ検索 |
 * | /urls | 画面URL一覧 |
 *
 * ## ディレクトリ構成
 * - src/app/          … 各画面のルート（page.tsx）
 * - src/components/access/ … Access風UIの共通コンポーネント
 * - src/lib/dummy-data.ts  … デザイン確認用ダミーデータ
 * - src/lib/access-colors.ts … 配色定数
 *
 * ## 今後の実装予定
 * - Supabase接続によるデータ取得・保存
 * - 検索フォームの入力・検索ロジック
 * - 更新処理メニュー各画面の追加
 */

export {};
