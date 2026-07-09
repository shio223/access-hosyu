/** マスタ更新画面用の表示データ（Access画面写真より） */

export type MasterRow = { code: string; name: string };

export const industryMaster: MasterRow[] = [
  { code: "01", name: "製造業" },
  { code: "02", name: "サービス業" },
  { code: "03", name: "運輸業" },
  { code: "04", name: "食品業" },
  { code: "05", name: "販売業" },
  { code: "06", name: "農林水産業" },
];

export const workMaster: MasterRow[] = [
  { code: "01", name: "試運転" },
  { code: "02", name: "3000時間整備" },
  { code: "03", name: "6000時間整備" },
  { code: "04", name: "12000時間整備" },
  { code: "05", name: "OH" },
  { code: "06", name: "中間整備" },
  { code: "07", name: "中間整備S" },
  { code: "08", name: "年次整備" },
  { code: "09", name: "年次整備S" },
  { code: "10", name: "６ヶ月整備" },
  { code: "11", name: "1年整備" },
  { code: "12", name: "2年整備" },
  { code: "13", name: "3年整備" },
  { code: "14", name: "4年整備" },
  { code: "15", name: "5年整備" },
  { code: "16", name: "６年整備" },
  { code: "17", name: "7年整備" },
];

/** メーカーマスタ（実データ） */
export const makerMaster: MasterRow[] = [
  { code: "01", name: "コベルコ　播磨機" },
  { code: "02", name: "コベルコ　高砂機" },
  { code: "03", name: "北越" },
  { code: "04", name: "明治" },
  { code: "05", name: "日立" },
  { code: "06", name: "IHI" },
  { code: "07", name: "東芝" },
  { code: "08", name: "三井" },
  { code: "09", name: "アルバック" },
  { code: "10", name: "島津" },
  { code: "11", name: "徳田" },
  { code: "12", name: "大阪真空" },
  { code: "13", name: "神港精機" },
  { code: "14", name: "樫山" },
  { code: "15", name: "アルカテル" },
  { code: "16", name: "ライボルト" },
  { code: "17", name: "オリオン機械" },
];

/** 機種マスタ（実データ） */
export const modelMaster: MasterRow[] = [
  { code: "01", name: "コンプレッサー" },
  { code: "02", name: "真空ポンプ" },
  { code: "03", name: "エアードライヤー" },
  { code: "04", name: "台数制御盤" },
  { code: "05", name: "ベビコン" },
  { code: "06", name: "その他" },
  { code: "07", name: "デストロイヤー" },
];

/** 担当者マスタ（実データ） */
export const staffMaster: MasterRow[] = [
  { code: "00", name: "空白" },
  { code: "01", name: "会長" },
  { code: "02", name: "隆仁" },
  { code: "03", name: "健吾" },
  { code: "04", name: "金井" },
  { code: "05", name: "山田" },
  { code: "06", name: "鳴瀬" },
  { code: "07", name: "会長.他" },
  { code: "08", name: "隆仁.他" },
  { code: "09", name: "健吾.他" },
  { code: "10", name: "金井.他" },
  { code: "100", name: "隆仁：バオ" },
  { code: "101", name: "健吾：後藤" },
  { code: "102", name: "松浦：西海" },
  { code: "103", name: "社長；西海" },
  { code: "104", name: "内海：西海" },
  { code: "105", name: "社長：イ" },
];

/** 入力者マスタ（実データ） */
export const inputterMaster: MasterRow[] = [
  { code: "00", name: "空白" },
  { code: "01", name: "会長" },
  { code: "02", name: "隆仁" },
  { code: "03", name: "健吾" },
  { code: "04", name: "金井" },
  { code: "05", name: "山田" },
  { code: "06", name: "鳴瀬" },
  { code: "07", name: "会長.他" },
  { code: "08", name: "隆仁.他" },
  { code: "09", name: "健吾.他" },
  { code: "10", name: "金井.他" },
  { code: "11", name: "山田.他" },
  { code: "12", name: "鳴瀬.他" },
  { code: "13", name: "湯浅" },
  { code: "14", name: "納多" },
  { code: "15", name: "三実機械" },
  { code: "110", name: "深澤" },
];

/** 地区マスタ（実データ） */
export const areaMaster: MasterRow[] = [
  { code: "01", name: "姫路市" },
  { code: "02", name: "赤穂市" },
  { code: "03", name: "相生市" },
  { code: "04", name: "たつの市" },
  { code: "05", name: "加古川市" },
  { code: "06", name: "加西市" },
  { code: "07", name: "明石市" },
  { code: "09", name: "小野市" },
  { code: "10", name: "高砂市" },
  { code: "11", name: "豊岡市" },
  { code: "12", name: "西脇市" },
  { code: "13", name: "三木市" },
  { code: "14", name: "神戸市" },
  { code: "15", name: "篠山市" },
  { code: "16", name: "西宮市" },
  { code: "17", name: "尼崎市" },
  { code: "20", name: "赤穂郡" },
];

/** 運転状況マスタ（実データ） */
export const statusMaster: MasterRow[] = [
  { code: "0", name: "未設定" },
  { code: "1", name: "稼働中" },
  { code: "2", name: "休止中" },
  { code: "3", name: "抹消" },
];

/** 汎用マスタ（実データ） */
export const generalMaster: MasterRow[] = [
  { code: "00", name: "KST" },
  { code: "01", name: "KST(ハンサム）" },
  { code: "02", name: "AS" },
  { code: "03", name: "AM" },
  { code: "04", name: "CM" },
  { code: "05", name: "HM" },
  { code: "06", name: "AS Ⅱ" },
  { code: "07", name: "CM Ⅱ" },
  { code: "08", name: "HM Ⅱ" },
  { code: "09", name: "CM(インバーター）" },
  { code: "10", name: "HM(インバーター）" },
  { code: "11", name: "KVH" },
  { code: "12", name: "AL" },
  { code: "13", name: "ALE" },
  { code: "14", name: "KST(高砂）" },
  { code: "15", name: "AL(高砂）" },
  { code: "16", name: "ALE(高砂）" },
];

export const dealerMaster: MasterRow[] = [
  { code: "9901", name: "(有)シンコーエヤーサービス" },
  { code: "4522T", name: "1500" },
];

export const controlFileData = {
  companyName: "有限会社シンコーエヤーサービス",
  postalCode: "671-0214",
  address1: "姫路市飾東町唐端新字松新田 73-56",
  address2: "",
  phone: "0792-52-2055",
  fax: "0792-53-1173",
  taxRateOld: "3.0",
  taxRateNew: "5.0",
  taxRevisionDate: "1997/04/01",
  fiscalMonth: "2月",
};

export const customerSearchResults = [
  {
    code: "4522",
    name: "ＴＯＰＰＡＮ㈱",
    address: "神崎郡福崎町高岡290-29",
    postalCode: "679-2283",
    phone: "0790-22-6610",
    representative: "設備ご担当者",
    title: "工場長",
    repName: "高岡 信夫",
    area: "02 赤穂市",
    industry: "01 製造業",
    general1: "年賀状",
    general2: "",
  },
];
