import type { NavPage } from "../types";

export function BottomNav({ activePage, onChangePage }: { activePage: NavPage; onChangePage: (p: NavPage) => void }) {
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(8,8,18,0.98)", borderTop: "1px solid #1a1a2a", display: "flex", zIndex: 50 }}>
      {([
        ["home",       "🏠", "ホーム"],
        ["collection", "🍱", "コレクション"],
        ["settings",   "⚙️", "設定"],
      ] as [NavPage, string, string][]).map(([page, icon, label]) => (
        <div key={page} onClick={() => onChangePage(page)} style={{ flex: 1, padding: "10px 0 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", color: activePage === page ? "#c0392b" : "#444" }}>
          <span style={{ fontSize: 20 }}>{icon}</span>
          <span style={{ fontSize: 9, fontFamily: "'Noto Sans JP', sans-serif" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}
