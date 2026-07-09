/**
 * 画面URL定義
 *
 * 各画面のパスをここで一元管理する。
 * メニューボタン・終了ボタン・画面一覧ページから参照する。
 */
export const routes = {
  /** メインメニュー（参照処理） */
  menuReference: "/",
  /** メインメニュー（更新処理） */
  menuUpdate: "/update",
  /** 設備別保守実績照会 */
  equipmentInquiry: "/equipment/maintenance-inquiry",
  /** 保守実績データ入力・修正 */
  maintenanceEntry: "/maintenance/entry",
  /** 設備マスタ修正 */
  equipmentEdit: "/equipment/edit",
  /** 保守実績データ検索 */
  maintenanceSearch: "/maintenance/search",
  /** 保守実績データ アップロード */
  maintenanceUpload: "/maintenance/upload",
  /** 設備マスタ検索 */
  equipmentSearch: "/equipment/search",
  /** 得意先マスタ検索 */
  customerSearch: "/customer/search",
  /** 販売店マスタ検索 */
  dealerSearch: "/dealer/search",
  /** 画面URL一覧（開発用） */
  urlIndex: "/urls",
} as const;

/** 画面一覧表示用 */
export const screenList = [
  { path: routes.menuReference, name: "メインメニュー（参照処理）" },
  { path: routes.menuUpdate, name: "メインメニュー（更新処理）" },
  { path: routes.equipmentInquiry, name: "設備別保守実績照会" },
  { path: routes.maintenanceEntry, name: "保守実績データ入力・修正" },
  { path: routes.equipmentEdit, name: "設備マスタ修正" },
  { path: routes.maintenanceSearch, name: "保守実績データ検索" },
  { path: routes.maintenanceUpload, name: "保守実績データ アップロード" },
  { path: routes.equipmentSearch, name: "設備マスタ検索" },
  { path: routes.customerSearch, name: "得意先マスタ検索" },
  { path: routes.dealerSearch, name: "販売店マスタ検索" },
] as const;
