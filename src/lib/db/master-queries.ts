import { getDb } from "./index";
import { MASTER_DEFAULTS, type MasterType } from "@/lib/master-registry";
import type { MasterRow } from "@/lib/master-data";

type MasterDbRow = { code: string; name: string };

/** マスタ一覧を取得（未登録なら初期データをDBへ投入） */
export function getMasterRows(masterType: MasterType): MasterRow[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT code, name FROM masters
       WHERE master_type = ?
       ORDER BY sort_order ASC, code ASC`
    )
    .all(masterType) as MasterDbRow[];

  if (rows.length === 0) {
    const defaults = MASTER_DEFAULTS[masterType];
    saveMasterRows(masterType, defaults);
    return defaults.map((row) => ({ ...row }));
  }

  return rows.map((row) => ({ code: row.code, name: row.name }));
}

/** マスタ一覧を登録（既存データは残し、送信分のみ追加・更新） */
export function saveMasterRows(masterType: MasterType, rows: MasterRow[]): MasterRow[] {
  const db = getDb();
  const valid = rows
    .map((row) => ({ code: row.code.trim(), name: row.name.trim() }))
    .filter((row) => row.code && row.name);

  if (valid.length === 0) return [];

  const maxRow = db
    .prepare(`SELECT COALESCE(MAX(sort_order), -1) AS max_order FROM masters WHERE master_type = ?`)
    .get(masterType) as { max_order: number };

  let nextOrder = maxRow.max_order + 1;

  const upsert = db.prepare(
    `INSERT INTO masters (master_type, code, name, sort_order, updated_at)
     VALUES (?, ?, ?, ?, datetime('now'))
     ON CONFLICT(master_type, code) DO UPDATE SET
       name = excluded.name,
       updated_at = datetime('now')`
  );

  const save = db.transaction(() => {
    valid.forEach((row) => {
      upsert.run(masterType, row.code, row.name, nextOrder++);
    });
  });

  save();
  return valid.map((row) => ({ ...row }));
}
