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
  { code: "06", name: "中間整備" },
  { code: "08", name: "年次整備" },
  { code: "11", name: "1年整備" },
  { code: "12", name: "2年整備" },
  { code: "13", name: "3年整備" },
  { code: "31", name: "突発作業" },
  { code: "37", name: "油圧修理" },
];

export const makerMaster: MasterRow[] = [
  { code: "01", name: "コベルコ 播磨機" },
  { code: "02", name: "日立" },
  { code: "03", name: "IHI" },
  { code: "04", name: "東芝" },
  { code: "05", name: "神戸製鋼" },
  { code: "06", name: "アネスト岩田" },
  { code: "07", name: "三井精機" },
  { code: "08", name: "富士電機" },
];

export const modelMaster: MasterRow[] = [
  { code: "01", name: "コンプレッサー" },
  { code: "02", name: "冷凍機" },
  { code: "03", name: "ドライヤ" },
  { code: "04", name: "ボイラー" },
];

export const staffMaster: MasterRow[] = [
  { code: "01", name: "会長" },
  { code: "02", name: "隆仁" },
  { code: "05", name: "山田" },
  { code: "27", name: "蔵元" },
  { code: "30", name: "山田・松浦" },
  { code: "50", name: "社長・堀" },
  { code: "51", name: "松浦・佐藤" },
  { code: "83", name: "松浦・パオ" },
  { code: "100", name: "健吾" },
  { code: "101", name: "隆仁・バオ" },
];

export const inputterMaster: MasterRow[] = [
  { code: "01", name: "管理者" },
  { code: "27", name: "蔵元" },
];

export const areaMaster: MasterRow[] = [
  { code: "01", name: "姫路市" },
  { code: "02", name: "赤穂市" },
  { code: "03", name: "たつの市" },
  { code: "04", name: "高砂市" },
];

export const statusMaster: MasterRow[] = [
  { code: "1", name: "稼動中" },
  { code: "2", name: "休止中" },
  { code: "3", name: "撤去済" },
];

export const generalMaster: MasterRow[] = [
  { code: "01", name: "年賀状" },
  { code: "02", name: "DM" },
  { code: "03", name: "DM2" },
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
