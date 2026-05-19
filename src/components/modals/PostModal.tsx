import { useState } from "react";
import { API_BASE, authFetch } from "../../utils/api";

export function PostModal({ currentRoom, onClose, onPosted }: {
  currentRoom: string | undefined;
  onClose: () => void;
  onPosted: () => void;
}) {
  const [text, setText] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const MAX = 80;

  const submit = async () => {
    if (!text.trim()) return;
    await authFetch(`${API_BASE}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text.trim(), room: currentRoom || "", spoiler: isSpoiler }),
    });
    onPosted();
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#0f0f1a", border: "1px solid #444", borderRadius: 20, width: "100%", maxWidth: 480, overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #222", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#e0e0e0", fontFamily: "'Noto Sans JP', sans-serif", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
            🍽️ 皿に乗せる — <span style={{ color: "#c0392b" }}>#{currentRoom || "ルームを選択"}</span>
          </span>
          <button
            onClick={() => setIsSpoiler((v) => !v)}
            style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${isSpoiler ? "#e67e22" : "#333"}`, background: isSpoiler ? "rgba(230,126,34,0.2)" : "rgba(255,255,255,0.03)", color: isSpoiler ? "#e67e22" : "#555", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", transition: "all 0.2s", flexShrink: 0 }}
          >
            ⚠️ ネタバレ注意
          </button>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", fontSize: 20, cursor: "pointer", marginLeft: "auto" }}>✕</button>
        </div>
        <div style={{ padding: 20 }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX))}
            placeholder={`${currentRoom || "このルーム"}への投稿（${MAX}字まで）\n刺激的な考察・感想・発見を...`}
            style={{ width: "100%", height: 120, background: "rgba(255,255,255,0.04)", border: "1px solid #333", borderRadius: 12, padding: "12px 14px", color: "#e0e0e0", fontFamily: "'Noto Sans JP', sans-serif", fontSize: 14, outline: "none", resize: "none", lineHeight: 1.7, boxSizing: "border-box" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <div style={{ color: text.length > MAX * 0.85 ? "#e74c3c" : "#555", fontSize: 12, fontFamily: "'Noto Sans JP', sans-serif" }}>
              {text.length} / {MAX}
            </div>
            <button
              onClick={submit}
              disabled={!text.trim()}
              style={{ padding: "8px 20px", background: text.trim() ? "#c0392b" : "#333", border: "none", borderRadius: 8, color: text.trim() ? "#fff" : "#555", cursor: text.trim() ? "pointer" : "not-allowed", fontSize: 13, fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 700 }}
            >
              投稿する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
