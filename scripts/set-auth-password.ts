#!/usr/bin/env npx tsx
/**
 * 一時的ローカルCLI: 既存 Supabase Auth ユーザーのパスワードを管理者として変更する。
 *
 * 使い方（パスワードは引数・.env に書かない）:
 *   npm run auth:set-password
 *
 * macOS ではシステムダイアログでパスワード入力（Cursor ターミナルの非表示入力不具合回避）。
 * customers / maintenance_records には触れない。
 */
import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";
import { spawnSync } from "node:child_process";
import { stdin as input, stdout as output } from "node:process";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local が見つかりません");
  }
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] == null) process.env[key] = val;
  }
}

function askLine(question: string): Promise<string> {
  const rl = readline.createInterface({ input, output });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/** AppleScript 文字列リテラル用にエスケープ */
function escapeAppleScript(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * macOS 標準の非表示パスワードダイアログ。
 * Cursor 統合ターミナルでは read -s / setRawMode が使えないためこちらを使う。
 */
function readPasswordViaMacDialog(prompt: string): string {
  const script = `
try
  set r to display dialog "${escapeAppleScript(prompt)}" default answer "" with hidden answer buttons {"キャンセル", "OK"} default button "OK" cancel button "キャンセル" with title "Auth パスワード変更"
  return text returned of r
on error number -128
  return ""
end try
`;
  const result = spawnSync("osascript", ["-e", script], {
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error("cancelled_or_failed");
  }

  // 末尾改行のみ除去。値はログしない
  const value = String(result.stdout ?? "").replace(/\r?\n$/g, "");
  if (!value) {
    throw new Error("cancelled_or_empty");
  }
  return value;
}

async function main() {
  loadEnvLocal();

  if (process.platform !== "darwin") {
    console.error(
      "このスクリプトは macOS のパスワードダイアログを使用します。macOS で実行してください。"
    );
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY が必要です");
    process.exit(1);
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
    console.error("service_role を NEXT_PUBLIC_ で公開しないでください");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: listData, error: listError } =
    await supabase.auth.admin.listUsers({ page: 1, perPage: 10 });

  if (listError) {
    console.error("ユーザー一覧の取得に失敗しました");
    process.exit(1);
  }

  const users = listData.users ?? [];
  if (users.length === 0) {
    console.error("Auth ユーザーがありません");
    process.exit(1);
  }
  if (users.length > 1) {
    console.error(
      `Auth ユーザーが ${users.length} 件あります。想定は1件のみです。変更を中止します。`
    );
    process.exit(1);
  }

  const user = users[0];
  const email = user.email;
  if (!email) {
    console.error("対象ユーザーにメールがありません");
    process.exit(1);
  }

  console.log("=== Auth パスワード変更（ローカルCLI） ===");
  console.log(`対象メール: ${email}`);
  console.log("customers / maintenance_records には一切触れません。");
  console.log("パスワードは macOS のダイアログで入力します（ターミナルには表示されません）。");

  const confirm = await askLine(
    "このユーザーのパスワードを変更しますか？ yes と入力: "
  );
  if (confirm.toLowerCase() !== "yes") {
    console.log("中止しました");
    process.exit(0);
  }

  let password1: string;
  let password2: string;
  try {
    console.log("ダイアログが開きます。4桁数字を入力して OK を押してください…");
    password1 = readPasswordViaMacDialog("新しいパスワード（4桁数字）");
    password2 = readPasswordViaMacDialog("確認のため再入力（4桁数字）");
  } catch {
    console.error("失敗");
    process.exit(1);
  }

  if (password1 !== password2) {
    console.error("失敗");
    process.exit(1);
  }

  if (!/^\d{4}$/.test(password1)) {
    console.error("失敗");
    process.exit(1);
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: password1 }
  );

  password1 = "";
  password2 = "";

  if (updateError) {
    console.error("失敗");
    process.exit(1);
  }

  console.log("成功");
}

main().catch(() => {
  console.error("失敗");
  process.exit(1);
});
