/**
 * メインメニュー（参照処理）
 * URL: /
 * 元のAccessスイッチボードの「参照処理」タブに相当
 */
import { MainMenu } from "@/components/access/main-menu";

export default function HomePage() {
  return <MainMenu mode="reference" />;
}
