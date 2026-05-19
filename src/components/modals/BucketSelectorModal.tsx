import { useState } from "react";
import type { Post, Bucket } from "../../types";
import { API_BASE, authFetch } from "../../utils/api";

export function BucketSelectorModal({ post, buckets, onClose, onBucketCreated, onAdded }: {
  post: Post;
  buckets: Bucket[];
  onClose: () => void;
  onBucketCreated: (b: Bucket) => void;
  onAdded: () => void;
}) {
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const addToExisting = async (bucketId: number) => {
    if (adding) return;
    setAdding(true);
    await authFetch(`${API_BASE}/buckets/${bucketId}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: post.id }),
    });
    onAdded();
    onClose();
  };

  const createAndAdd = async () => {
    if (!newName.trim() || adding) return;
    setAdding(true);
    const res = await authFetch(`${API_BASE}/buckets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const bucket: Bucket = await res.json();
    onBucketCreated(bucket);
    await authFetch(`${API_BASE}/buckets/${bucket.id}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: post.id }),
    });
    onAdded();
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 110, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#0f0f1a", border: "1px solid #2a2a3a", borderRadius: 20, width: "100%", maxWidth: 380, overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #1a1a2a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#e0e0e0", fontFamily: "'Noto Sans JP', sans-serif", fontSize: 14, fontWeight: 700 }}>🍱 どの箱に入れますか？</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ padding: 16, maxHeight: 360, overflowY: "auto" }}>
          {buckets.length === 0 && (
            <div style={{ color: "#444", fontSize: 12, fontFamily: "'Noto Sans JP', sans-serif", textAlign: "center", paddingBottom: 12 }}>まだ箱がありません</div>
          )}
          {buckets.map((b) => (
            <div key={b.id} onClick={() => addToExisting(b.id)}
              style={{ padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid #1f1f2f", borderRadius: 10, marginBottom: 8, cursor: "pointer", color: "#ccc", fontSize: 13, fontFamily: "'Noto Sans JP', sans-serif", display: "flex", alignItems: "center", gap: 10, transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}>
              <span style={{ fontSize: 18 }}>🍱</span>
              <span>{b.name}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, borderTop: "1px solid #1a1a2a", paddingTop: 12 }}>
            <div style={{ color: "#555", fontSize: 11, fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 8 }}>新しい箱を作って追加</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value.slice(0, 20))}
                onKeyDown={(e) => e.key === "Enter" && createAndAdd()}
                placeholder="箱の名前（20字まで）"
                style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid #333", borderRadius: 8, padding: "8px 12px", color: "#e0e0e0", fontSize: 13, fontFamily: "'Noto Sans JP', sans-serif", outline: "none" }}
              />
              <button onClick={createAndAdd} disabled={!newName.trim()}
                style={{ padding: "8px 14px", background: newName.trim() ? "#c0392b" : "#222", border: "none", borderRadius: 8, color: newName.trim() ? "#fff" : "#444", cursor: newName.trim() ? "pointer" : "not-allowed", fontSize: 12, fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 700 }}>
                作る
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
