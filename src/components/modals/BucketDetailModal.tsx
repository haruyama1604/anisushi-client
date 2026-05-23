import { useState, useEffect } from "react";
import type { Bucket, Post } from "../../types";
import { API_BASE, authFetch } from "../../utils/api";
import { TIER_CONFIG } from "../../utils/categories";

export function BucketDetailModal({ bucket, onClose, likedIds, onOpenComments, allPosts }: {
  bucket: Bucket;
  onClose: () => void;
  likedIds: Set<number>;
  onOpenComments: (post: Post) => void;
  allPosts: Post[];
}) {
  // 箱に紐づく post_id の集合のみ保持。実体は allPosts（App.tsx の posts）から
  // フィルタで導出することで、皿削除時に自動で表示からも消える（同期ズレを防ぐ）。
  const [bucketPostIds, setBucketPostIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    authFetch(`${API_BASE}/buckets/${bucket.id}/posts`)
      .then((r) => r.json())
      .then((data: Post[]) => setBucketPostIds(new Set(data.map((p) => p.id))))
      .catch(() => {});
  }, [bucket.id]);

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

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 110, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#0f0f1a", border: "1px solid #2a2a3a", borderRadius: 20, width: "100%", maxWidth: 560, maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #1a1a2a", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ color: "#e0e0e0", fontFamily: "'Noto Sans JP', sans-serif", fontSize: 14, fontWeight: 700 }}>🍱 {bucket.name}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
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
