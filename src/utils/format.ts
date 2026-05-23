// サーバ（Turso/SQLite）の created_at は datetime('now') 由来で UTC だが、
// "YYYY-MM-DD HH:MM:SS" のようにタイムゾーン情報が付かない文字列で返ってくることがある。
// その文字列を素直に表示するとブラウザがローカル時刻と誤解し、JST では 9 時間遅れて見える。
// ここでは「Z/T/+ がついていない場合のみ UTC として補正」してパースし、JST で表示する。
export function formatDateTime(s: string | undefined | null): string {
  if (!s) return "";
  const iso = /[TZ+]/.test(s) ? s : s.replace(" ", "T") + "Z";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return s;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}`;
}
