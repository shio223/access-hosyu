/**
 * 画面表示用ダミーデータ
 *
 * 機能実装前のデザイン確認用。Supabase接続後は
 * これらのデータをAPI/DBから取得するデータに置き換える。
 */

/**
 * 設備別保守実績照会画面の履歴テーブル用データ
 * 元画面の作業履歴を再現。workType=作業種別名、workContent=作業内容詳細。
 */
export const maintenanceHistory = [
  {
    workDate: "2026/06/25",
    workCode: "31",
    workType: "突発作業",
    workContent: "ドライヤファンコンSW交換",
    operatingHours: "40,000",
    customerContact: "中村",
    staffCode: "05",
    staffName: "山田",
    inputterCode: "27",
    inputterName: "蔵元",
  },
  {
    workDate: "2025/11/26",
    workCode: "13",
    workType: "3年整備",
    workContent: "※次回ﾓｰﾀ交換",
    operatingHours: "36,780",
    customerContact: "中村",
    staffCode: "83",
    staffName: "松浦・パオ",
    inputterCode: "27",
    inputterName: "蔵元",
  },
  {
    workDate: "2025/05/13",
    workCode: "37",
    workType: "突発作業",
    workContent: "油圧修理:ｺﾞﾑﾎｰｽ(本体～ｽﾋﾟﾝﾄﾞﾙ間)交換",
    operatingHours: "32,687",
    customerContact: "中村",
    staffCode: "05",
    staffName: "山田",
    inputterCode: "27",
    inputterName: "蔵元",
  },
  {
    workDate: "2024/11/27",
    workCode: "12",
    workType: "2年整備",
    workContent: "油面計・ﾓｰﾀ",
    operatingHours: "29,054",
    customerContact: "中村",
    staffCode: "30",
    staffName: "山田・松浦",
    inputterCode: "27",
    inputterName: "蔵元",
  },
  {
    workDate: "2023/11/10",
    workCode: "11",
    workType: "1年整備",
    workContent: "",
    operatingHours: "20,626",
    customerContact: "中村",
    staffCode: "51",
    staffName: "松浦・佐藤",
    inputterCode: "27",
    inputterName: "蔵元",
  },
  {
    workDate: "2021/03/22",
    workCode: "01",
    workType: "試運転",
    workContent: "",
    operatingHours: "",
    customerContact: "中村",
    staffCode: "50",
    staffName: "社長・堀",
    inputterCode: "27",
    inputterName: "蔵元",
  },
];

/** 設備別保守実績照会画面の設備・得意先情報 */
export const equipmentDetail = {
  customerCode: "4522",
  customerName: "ＴＯＰＰＡＮ㈱",
  equipmentNo: "058",
  equipmentName: "製袋No.1(第2特印3F)",
  statusCode: "1",
  statusName: "稼動中",
  modelCode: "01",
  modelName: "コンプレッサー",
  makerCode: "01",
  makerName: "コベルコ 播磨機",
  modelType: "VS22ADV4-JAH-1",
  managementNo: "J4HA410706(製袋No.1)",
  remarks:
    "担当：施設 中村様(080-2404-0094)(社用:080-1182-0590)　※ｵｲﾙﾁｪﾝｼﾞ　★kobel ink=交換設置(未対応の為主先で(保管)　*AM-850-AH=-378\n・1226J-12C-F/1126-12C-F　※客先つなぎ服着用にて作業!　排出通常・リ-ｽ可　●HTN20A025対応要(次回整備時ﾌﾟﾛｸﾞﾗﾑVer.ｱｯﾌﾟ) ※CH更請時\"安全作業手続書作成費\"追加",
  postalCode: "679-2283",
  phone: "0790-22-6610",
  address1: "神崎郡福崎町高岡290-29",
  address2: "",
  deliveryDate: "2021/03/18",
  inspectionCycle: "12ヶ月",
  nextInspectionDate: "2026/11/26(木)",
  inspectionNotice: "得意先宛",
  dealer1: "9901　(有)シンコーエヤーサービス",
  dealer2: "",
  dealer3: "4522T　1500",
  oilUsed: "ｴｸｽﾄﾗｵｲﾙ(12L)(0H:13L)*M#:1VS22VA401-4*",
  revisionDate: "2026/06/25",
};
