import { useState } from "react";
import type { Category, Selected, NavPage } from "../types";

export function Sidebar({ categories, selected, onSelect, activePage, onChangePage }: {
  categories: Category[];
  selected: Selected | null;
  onSelect: (s: Selected) => void;
  activePage: NavPage;
  onChangePage: (p: NavPage) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>("anime");

  return (
    <div style={{ width: 220, background: "rgba(8,8,18,0.98)", borderRight: "1px solid #1a1a2a", height: "100%", overflowY: "auto", flexShrink: 0, display: "flex", flexDirection: "column" }}>
      {/* Logo */}
      <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #1a1a2a", cursor: "pointer" }} onClick={() => onChangePage("home")}>
        <img src="/logo.svg" alt="あにすし" style={{ height: 40 }} />
      </div>

      {/* Nav */}
      <div style={{ borderBottom: "1px solid #1a1a2a", padding: "8px 0" }}>
        {([
          ["home",       "🏠", "ホーム"],
          ["collection", "🍱", "コレクション"],
        ] as [NavPage, string, string][]).map(([page, icon, label]) => (
          <div key={page} onClick={() => onChangePage(page)} style={{ padding: "9px 16px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: activePage === page ? "#c0392b" : "#555", fontSize: 13, fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 600, background: activePage === page ? "rgba(192,57,43,0.08)" : "transparent", transition: "all 0.2s" }}>
            <span>{icon}</span><span>{label}</span>
          </div>
        ))}
        {(["👤 プロフィール", "🔔 通知"] as string[]).map((item) => (
          <div key={item} style={{ padding: "9px 16px", display: "flex", alignItems: "center", gap: 8, cursor: "not-allowed", color: "#333", fontSize: 13, fontFamily: "'Noto Sans JP', sans-serif" }}>
            <span>{item}</span>
            <span style={{ marginLeft: "auto", fontSize: 9, color: "#444", background: "rgba(255,255,255,0.04)", padding: "1px 5px", borderRadius: 4 }}>準備中</span>
          </div>
        ))}
        <div onClick={() => onChangePage("settings")} style={{ padding: "9px 16px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: activePage === "settings" ? "#c0392b" : "#555", fontSize: 13, fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 600, background: activePage === "settings" ? "rgba(192,57,43,0.08)" : "transparent", transition: "all 0.2s" }}
          onMouseEnter={(e) => { if (activePage !== "settings") e.currentTarget.style.color = "#aaa"; }}
          onMouseLeave={(e) => { if (activePage !== "settings") e.currentTarget.style.color = "#555"; }}>
          <span>⚙️</span><span>設定</span>
        </div>
      </div>

      {/* Categories (ホームのみ) */}
      {activePage === "home" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {categories.map((cat) => (
            <div key={cat.id}>
              <div onClick={() => setExpanded(expanded === cat.id ? null : cat.id)} style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: expanded === cat.id ? "#e0e0e0" : "#666", fontSize: 13, fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 700, background: expanded === cat.id ? "rgba(255,255,255,0.04)" : "transparent", transition: "all 0.2s" }}>
                <span>{cat.icon}</span><span>{cat.label}</span>
                <span style={{ marginLeft: "auto", fontSize: 10, color: "#444" }}>{expanded === cat.id ? "▼" : "▶"}</span>
              </div>
              {expanded === cat.id && cat.subs.map((sub) => (
                <div key={sub.id}>
                  <div onClick={() => onSelect({ cat, sub, room: sub.rooms[0] })} style={{ padding: "8px 16px 8px 32px", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", color: selected?.sub?.id === sub.id ? "#c0392b" : "#555", fontSize: 12, fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 600, background: selected?.sub?.id === sub.id ? "rgba(192,57,43,0.08)" : "transparent", transition: "all 0.15s" }}>
                    <span style={{ fontSize: 14 }}>{sub.icon}</span><span>{sub.label}</span>
                  </div>
                  {selected?.sub?.id === sub.id && sub.rooms.map((room) => (
                    <div key={room} onClick={() => onSelect({ cat, sub, room })} style={{ padding: "6px 16px 6px 48px", cursor: "pointer", color: selected?.room === room ? "#e0e0e0" : "#444", fontSize: 11, fontFamily: "'Noto Sans JP', sans-serif", background: selected?.room === room ? "rgba(255,255,255,0.03)" : "transparent", borderLeft: selected?.room === room ? "2px solid #c0392b" : "2px solid transparent", transition: "all 0.15s" }}>
                      #{room}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
