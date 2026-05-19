import { useState, useEffect } from "react";
import type { Post, Comment, Reply, Bucket } from "../../types";
import { API_BASE } from "../../utils/api";
import { TIER_CONFIG } from "../../utils/categories";

export function CommentModal({ post, onClose, likedIds, userId, fromBucket, onBackToBucket }: {
  post: Post;
  onClose: () => void;
  likedIds: Set<number>;
  userId: string;
  fromBucket?: Bucket;
  onBackToBucket?: () => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [replies, setReplies] = useState<Record<number, Reply[]>>({});
  const [input, setInput] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});
  const canComment = likedIds.has(post.id);
  const tier = TIER_CONFIG[post.tier];

  const fetchComments = async () => {
    const data: Comment[] = await fetch(`${API_BASE}/posts/${post.id}/comments?user_id=${userId}`)
      .then((r) => r.json()).catch(() => []);
    setComments(data);
    // サーバが replies をネストして返すので、個別 fetch は不要（N+1 解消）
    const repliesMap: Record<number, Reply[]> = {};
    for (const c of data) {
      repliesMap[c.id] = c.replies ?? [];
    }
    setReplies(repliesMap);
  };

  useEffect(() => {
    fetchComments();
    fetch(`${API_BASE}/posts/${post.id}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    }).catch(() => {});
  }, [post.id]);

  const handleHeartClick = (commentId: number, isLiked: boolean) => {
    if (isLiked) {
      fetch(`${API_BASE}/comments/${commentId}/like?user_id=${userId}`, {
        method: "DELETE",
      }).then(() => {
        setComments((prev) => prev.map((c) => c.id === commentId ? { ...c, likes: Math.max(0, c.likes - 1), liked_by_user: false } : c));
      });
    } else {
      fetch(`${API_BASE}/comments/${commentId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      }).then(() => {
        setComments((prev) => prev.map((c) => c.id === commentId ? { ...c, likes: c.likes + 1, liked_by_user: true } : c));
      });
    }
  };

  const handleAddReply = async (commentId: number) => {
    const text = (replyTexts[commentId] ?? "").trim();
    if (!text) return;
    const reply: Reply = await fetch(`${API_BASE}/comments/${commentId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, user_id: userId }),
    }).then((r) => r.json());
    setReplies((prev) => ({ ...prev, [commentId]: [...(prev[commentId] ?? []), reply] }));
    setReplyTexts((prev) => ({ ...prev, [commentId]: "" }));
    setReplyingTo(null);
  };

  const handleDeleteReply = async (replyId: number, commentId: number) => {
    await fetch(`${API_BASE}/replies/${replyId}?user_id=${userId}`, {
      method: "DELETE",
    });
    setReplies((prev) => ({ ...prev, [commentId]: (prev[commentId] ?? []).filter((r) => r.id !== replyId) }));
  };

  const handleDeleteComment = async (commentId: number) => {
    await fetch(`${API_BASE}/comments/${commentId}?user_id=${userId}`, {
      method: "DELETE",
    });
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const submit = async () => {
    if (!input.trim()) return;
    const newComment: Comment = await fetch(`${API_BASE}/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input.trim(), user_id: userId }),
    }).then((r) => r.json());
    setComments((prev) => [...prev, { ...newComment, liked_by_user: false, replies: [] }]);
    setReplies((prev) => ({ ...prev, [newComment.id]: [] }));
    setInput("");
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#0f0f1a", border: "1px solid #333", borderRadius: 20, width: "100%", maxWidth: 540, maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
        {fromBucket && onBackToBucket && (
          <button onClick={onBackToBucket} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 20px", background: "rgba(255,255,255,0.03)", border: "none", borderBottom: "1px solid #1a1a2a", color: "#888", fontSize: 12, fontFamily: "'Noto Sans JP', sans-serif", cursor: "pointer", textAlign: "left", transition: "color 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ccc")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}>
            ← 🍱 {fromBucket.name}
          </button>
        )}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #222", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ color: "#e0e0e0", fontFamily: "'Noto Sans JP', sans-serif", fontSize: 14, fontWeight: 700 }}>
            💬 コメント欄 — <span style={{ color: "#888", fontWeight: 400 }}>{post.room || "フリー"}</span>
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ padding: "14px 20px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid #1a1a2a", flexShrink: 0 }}>
          <p style={{ color: "#c0c0c0", fontSize: 13, lineHeight: 1.7, margin: 0, fontFamily: "'Noto Sans JP', sans-serif" }}>{post.content}</p>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px" }}>
          {comments.length === 0 && (
            <div style={{ color: "#444", fontSize: 12, fontFamily: "'Noto Sans JP', sans-serif", textAlign: "center", paddingTop: 20 }}>まだコメントはありません</div>
          )}
          {comments.map((c) => (
            <div key={c.id} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ fontSize: 16, marginTop: 2 }}>💬</span>
                <div style={{ flex: 1 }}>
                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "8px 12px", border: "1px solid #1f1f2f", position: "relative" }}>
                    {c.user_id === userId && (
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        style={{ position: "absolute", top: 4, right: 6, background: "none", border: "none", color: "#c0392b", fontSize: 16, cursor: "pointer", padding: "1px 3px", transition: "color 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#e74c3c")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#c0392b")}>🗑</button>
                    )}
                    <div style={{ color: "#555", fontSize: 10, fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 4 }}>
                      {c.user_id === "system" ? "運営" : c.user_id === userId ? "あなた" : "ユーザー"} · {c.created_at.slice(0, 16).replace("T", " ")}
                    </div>
                    <p style={{ color: "#bbb", fontSize: 13, margin: 0, fontFamily: "'Noto Sans JP', sans-serif", lineHeight: 1.6 }}>{c.text}</p>
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 5, paddingLeft: 4, alignItems: "center" }}>
                    <button
                      onClick={() => handleHeartClick(c.id, c.liked_by_user)}
                      title={c.liked_by_user ? "タップで取り消し" : "いいね"}
                      style={{ background: "none", border: "none", cursor: "pointer", color: c.liked_by_user ? "#e74c3c" : "#555", fontSize: 12, fontFamily: "'Noto Sans JP', sans-serif", padding: 0, display: "flex", alignItems: "center", gap: 4, transition: "color 0.15s" }}>
                      {c.liked_by_user ? "❤️" : "🤍"} {c.likes}
                    </button>
                    <button
                      onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: 12, fontFamily: "'Noto Sans JP', sans-serif", padding: 0, transition: "color 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#aaa")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}>
                      💬 返信{(replies[c.id]?.length ?? 0) > 0 ? ` (${replies[c.id].length})` : ""}
                    </button>
                  </div>

                  {(replies[c.id] ?? []).map((r) => (
                    <div key={r.id} style={{ marginTop: 6, paddingLeft: 14, borderLeft: "2px solid #1a1a2a" }}>
                      <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "6px 10px", border: "1px solid #161626", position: "relative" }}>
                        {r.user_id === userId && (
                          <button
                            onClick={() => handleDeleteReply(r.id, c.id)}
                            style={{ position: "absolute", top: 4, right: 6, background: "none", border: "none", color: "#c0392b", fontSize: 16, cursor: "pointer", padding: "1px 3px", transition: "color 0.15s" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#e74c3c")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#c0392b")}>🗑</button>
                        )}
                        <div style={{ color: "#555", fontSize: 10, fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 3 }}>
                          {r.user_id === "system" ? "運営" : r.user_id === userId ? "あなた" : "ユーザー"} · {r.created_at.slice(0, 16).replace("T", " ")}
                        </div>
                        <p style={{ color: "#aaa", fontSize: 12, margin: 0, fontFamily: "'Noto Sans JP', sans-serif", lineHeight: 1.55 }}>{r.text}</p>
                      </div>
                    </div>
                  ))}

                  {replyingTo === c.id && (
                    <div style={{ marginTop: 8, paddingLeft: 14, display: "flex", gap: 6 }}>
                      <input
                        autoFocus
                        value={replyTexts[c.id] ?? ""}
                        onChange={(e) => setReplyTexts((prev) => ({ ...prev, [c.id]: e.target.value.slice(0, 80) }))}
                        onKeyDown={(e) => e.key === "Enter" && handleAddReply(c.id)}
                        placeholder="返信（80字まで）"
                        style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid #2a2a3a", borderRadius: 8, padding: "7px 10px", color: "#e0e0e0", fontFamily: "'Noto Sans JP', sans-serif", fontSize: 12, outline: "none" }}
                      />
                      <button onClick={() => handleAddReply(c.id)} style={{ padding: "7px 12px", background: tier.bg, border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: 12, fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 700 }}>送信</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {canComment ? (
          <div style={{ padding: "12px 20px", borderTop: "1px solid #222", display: "flex", gap: 8, flexShrink: 0 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 80))}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="コメント（80字まで）"
              style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid #333", borderRadius: 10, padding: "10px 14px", color: "#e0e0e0", fontFamily: "'Noto Sans JP', sans-serif", fontSize: 13, outline: "none" }}
            />
            <button onClick={submit} style={{ padding: "10px 16px", background: tier.bg, border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "'Noto Sans JP', sans-serif" }}>送信</button>
          </div>
        ) : (
          <div style={{ padding: "12px 20px", borderTop: "1px solid #222", textAlign: "center", color: "#444", fontSize: 12, fontFamily: "'Noto Sans JP', sans-serif", flexShrink: 0 }}>
            🔒 先に皿を取るとコメントできます
          </div>
        )}
      </div>
    </div>
  );
}
