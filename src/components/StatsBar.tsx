import type { Post } from "../types";

export function StatsBar({ posts, likedIds }: { posts: Post[]; likedIds: Set<number> }) {
  const goldCount = posts.filter((p) => p.tier === "gold").length;
  return (
    <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #1a1a2a", background: "rgba(5,5,12,0.9)" }}>
      {([
        ["🍽️", "総皿数",   posts.length],
        ["✅", "取った皿", likedIds.size],
        ["✨", "金皿",     goldCount],
      ] as [string, string, number][]).map(([icon, label, val]) => (
        <div key={label} style={{ flex: 1, padding: "10px 0", textAlign: "center", borderRight: "1px solid #1a1a2a" }}>
          <div style={{ fontSize: 16 }}>{icon}</div>
          <div style={{ color: "#e0e0e0", fontSize: 15, fontWeight: 700, fontFamily: "'Noto Serif JP', serif" }}>{val}</div>
          <div style={{ color: "#444", fontSize: 10, fontFamily: "'Noto Sans JP', sans-serif" }}>{label}</div>
        </div>
      ))}
    </div>
  );
}
