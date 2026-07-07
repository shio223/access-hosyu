/**
 * 画面URL一覧
 * URL: /urls
 * 開発・デザイン確認時に各画面へ直接アクセスするためのインデックスページ
 */
import Link from "next/link";
import { screenList, routes } from "@/lib/routes";

export default function UrlIndexPage() {
  return (
    <div className="min-h-screen bg-[#D4D0C8] p-4 md:p-8">
      <div className="max-w-xl mx-auto border-2 border-[#404040] bg-white">
        <div className="bg-[#000080] text-white px-4 py-2 font-bold">
          保守管理システム - 画面URL一覧
        </div>
        <div className="p-4">
          <p className="text-sm text-[#333] mb-4">
            各画面のURLです。ブックマークや共有にご利用ください。
          </p>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#008080] text-white">
                <th className="border border-[#004040] px-2 py-1 text-left">画面名</th>
                <th className="border border-[#004040] px-2 py-1 text-left">URL</th>
              </tr>
            </thead>
            <tbody>
              {screenList.map((screen) => (
                <tr key={screen.path} className="bg-white hover:bg-[#F0F0F0]">
                  <td className="border border-[#808080] px-2 py-1">{screen.name}</td>
                  <td className="border border-[#808080] px-2 py-1">
                    <Link
                      href={screen.path}
                      className="text-[#0000FF] underline break-all"
                    >
                      {screen.path}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 text-xs text-[#666]">
            <p>ローカル開発: http://localhost:3000</p>
            <p>例: 設備別保守実績照会 → http://localhost:3000{routes.equipmentInquiry}</p>
          </div>
          <div className="mt-4">
            <Link
              href={routes.menuReference}
              className="inline-block bg-[#C0C0C0] border border-[#808080] px-4 py-1 text-sm text-black no-underline"
            >
              メインメニューへ戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
