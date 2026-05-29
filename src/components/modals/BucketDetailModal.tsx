import { useState, useEffect } from "react";
import type { Bucket, Post } from "../../types";
import { API_BASE, authFetch } from "../../utils/api";
import { TIER_CONFIG } from "../../utils/categories";

export function BucketDetailModal({ bucket, onClose, likedIds, onOpenComments, allPosts, onRenamed }: {
  bucket: Bucket;
  onClose: () => void;
  likedIds: Set<number>;
  onOpenComments: (post: Post) => void;
  allPosts: Post[];
  onRenamed: (updated: Bucket) => void;
}) {
  // 箱に紐づく post_id の集合のみ保持。実体は allPosts（App.tsx の posts）から
  // フィルタで導出することで、皿削除時に自動で表示からも消える（同期ズレを防ぐ）。
  const [bucketPostIds, setBucketPostIds] = useState<Set<number>>(new Set());

  // 名前変更 UI の state。
  // - isEditingName: true で input、false で表示モード
  // - nameInput: 編集中のテキスト
  // - saving: PATCH 中の二重送信ガード
  // - error: バリデーション失敗時のメッセージ
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(bucket.name);
  const [saving, setSaving] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);

  useEffect(() => {
    authFetch(`${API_BASE}/buckets/${bucket.id}/posts`)
      .then((r) => r.json())
      .then((data: Post[]) => setBucketPostIds(new Set(data.map((p) => p.id))))
      .catch(() => {});
  }, [bucket.id]);

  // 親から渡された bucket.name が変わったら（別の箱に切り替わった場合）入力欄も追従させる
  useEffect(() => {
    setNameInput(bucket.name);
    setIsEditingName(false);
    setRenameError(null);
  }, [bucket.id, bucket.name]);

  // allPosts と bucketPostIds の交差で表示する皿一覧を導出。
  // さらに likedIds でフィルタすることで、「皿を返す（いいね取り消し）」操作の瞬間に
  // 箱の表示からも自動で消える（サーバー側でも bucket_posts から削除される）。
  const bucketPosts = allPosts.filter((p) => bucketPostIds.has(p.id) && likedIds.has(p.id));

  const removePost = async (postId: number) => {
    await authFetch(`${API_BASE}/buckets/${bucket.id}/posts/${postId}`, {
      method: "DELETE",
    });
    setBucketPostIds((prev) => { const n = new Set(prev); n.delete(postId); return n; });
  };

  const startEditName = () => {
    setNameInput(bucket.name);
    setRenameError(null);
    setIsEditingName(true);
  };

  const cancelEditName = () => {
    setNameInput(bucket.name);
    setRenameError(null);
    setIsEditingName(false);
  };

  // PATCH /buckets/:id を呼び、成功したら親に通知して表示モードに戻す。
  // クライアント側でも最大20字を事前チェックして、無駄な往復を防ぐ。
  const saveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) { setRenameError("名前を入力してください"); return; }
    if (trimmed.length > 20) { setRenameError("20文字以内にしてください"); return; }
    if (trimmed === bucket.name) { setIsEditingName(false); return; }

    setSaving(true);
    setRenameError(null);
    try {
      const res = await authFetch(`${API_BASE}/buckets/${bucket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) {
        setRenameError("名前を変更できませんでした");
        return;
      }
      const updated: Bucket = await res.json();
      onRenamed(updated);
      setIsEditingName(false);
    } catch {
      setRenameError("通信エラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 110, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#0f0f1a", border: "1px solid #2a2a3a", borderRadius: 20, width: "100%", maxWidth: 560, maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #1a1a2a", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, gap: 12 }}>
          {isEditingName ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#e0e0e0", fontSize: 14 }}>🍱</span>
              <input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); saveName(); }
                  if (e.key === "Escape") { e.preventDefault(); cancelEditName(); }
                }}
                maxLength={20}
                disabled={saving}
                style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid #2a2a3a", borderRadius: 6, color: "#e0e0e0", fontSize: 13, padding: "5px 10px", fontFamily: "'Noto Sans JP', sans-serif" }}
              />
              <button
                onClick={saveName}
                disabled={saving}
                style={{ background: "rgba(76,175,80,0.15)", border: "1px solid rgba(76,175,80,0.5)", color: "#81c784", fontSize: 12, fontWeight: 700, padding: "5px 10px", borderRadius: 6, cursor: saving ? "wait" : "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}
              >
                {saving ? "..." : "保存"}
              </button>
              <button
                onClick={cancelEditName}
                disabled={saving}
                style={{ background: "none", border: "1px solid #2a2a3a", color: "#888", fontSize: 12, padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}
              >
                取消
              </button>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#e0e0e0", fontFamily: "'Noto Sans JP', sans-serif", fontSize: 14, fontWeight: 700 }}>🍱 {bucket.name}</span>
              <button
                onClick={startEditName}
                title="箱の名前を変更"
                aria-label="箱の名前を変更"
                style={{ background: "none", border: "1px solid #2a2a3a", color: "#888", fontSize: 11, padding: "3px 8px", borderRadius: 6, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", transition: "all 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#e0e0e0"; e.currentTarget.style.borderColor = "#555"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "#2a2a3a"; }}
              >
                ✏️ 改名
              </button>
            </div>
          )}
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", fontSize: 20, cursor: "pointer", flexShrink: 0 }}>✕</button>
        </div>
        {renameError && (
          <div style={{ padding: "6px 20px", color: "#e57373", fontSize: 11, fontFamily: "'Noto Sans JP', sans-serif", background: "rgba(229,115,115,0.06)", borderBottom: "1px solid rgba(229,115,115,0.2)" }}>{renameError}</div>
        )}
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          {bucketPosts.length === 0 && (
            <div style={{ color: "#444", fontSize: 13, fontFamily: "'Noto Sans JP', sans-serif", textAlign: "center", paddingTop: 24 }}>箱の中は空です</div>
          )}
          {bucketPosts.map((post) => {
            const tier = TIER_CONFIG[post.tier ?? "normal"];
            return (
              <div key={post.id} style={{ background: tier.cardBg, border: `1px solid ${tier.border}33`, borderRadius: 12, padding: "12px 14px", marginBottom: 10, display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div
                  style={{ flex: 1, cursor: "pointer" }}
                  onClick={() => onOpenComments(post)}
                >
                  <div style={{ color: "#666", fontSize: 10, fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                    <span>#{post.room || "フリー"}</span>
                    <span style={{ color: likedIds.has(post.id) ? tier.glow : "#555" }}>🥢 {post.likes}</span>
                  </div>
                  <p style={{ color: "#ccc", fontSize: 13, margin: 0, fontFamily: "'Noto Sans JP', sans-serif", lineHeight: 1.65 }}>{post.content}</p>
                </div>
                <button onClick={() => removePost(post.id)}
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #2a2a3a", borderRadius: 8, color: "#555", fontSize: 11, cursor: "pointer", padding: "5px 10px", fontFamily: "'Noto Sans JP', sans-serif", flexShrink: 0, transition: "all 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#e74c3c"; e.currentTarget.style.borderColor = "#e74c3c44"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#555"; e.currentTarget.style.borderColor = "#2a2a3a"; }}>
                  出す
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
