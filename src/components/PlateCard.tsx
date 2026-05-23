import { useState } from "react";
import type { Post } from "../types";
import { API_BASE, authFetch } from "../utils/api";
import { TIER_CONFIG } from "../utils/categories";
import { formatDateTime } from "../utils/format";

export function PlateCard({
  post,
  onLike,
  onUnlike,
  onOpenComments,
  isLiked,
  onAddToBucket,
  userId,
  onDelete,
  reducedMotion,
  showSpoilers,
  fullWidth,
  onConfirming,
}: {
  post: Post;
  onLike: (id: number) => void;
  onUnlike: (id: number) => void;
  onOpenComments: (post: Post) => void;
  isLiked: boolean;
  onAddToBucket?: (post: Post) => void;
  userId?: string;
  onDelete?: (id: number) => void;
  reducedMotion?: boolean;
  showSpoilers?: boolean;
  fullWidth?: boolean;
  onConfirming?: (v: boolean) => void;
}) {
  const tier = TIER_CONFIG[post.tier];
  const [animating, setAnimating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);
  const isOwn = !!userId && post.user_id === userId;
  const rm = !!reducedMotion;
  const isSpoiler = !!post.spoiler && !spoilerRevealed && !showSpoilers;

  const handleLike = () => {
    if (isLiked) {
      onUnlike(post.id);
    } else {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 600);
      onLike(post.id);
    }
  };

  const handleDeleteConfirm = () => {
    authFetch(`${API_BASE}/posts/${post.id}`, { method: "DELETE" })
      .then((res) => { if (res.ok) onDelete?.(post.id); });
  };

  return (
    <div
      style={{
        minWidth: fullWidth ? "100%" : 280,
        maxWidth: fullWidth ? "100%" : 280,
        background: tier.cardBg,
        border: `1.5px solid ${tier.border}44`,
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        cursor: "pointer",
        transition: rm ? "none" : "transform 0.2s, box-shadow 0.2s",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (rm) return;
        e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
        e.currentTarget.style.boxShadow = `0 8px 32px ${tier.glow}55`;
      }}
      onMouseLeave={(e) => {
        if (rm) return;
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      {/* Own-post badge + delete button */}
      {isOwn && (
        <div style={{ position: "absolute", top: 34, right: 10, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, zIndex: 2 }}>
          <div style={{ background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, fontFamily: "'Noto Sans JP', sans-serif", border: "1px solid rgba(255,255,255,0.3)", backdropFilter: "blur(4px)" }}>
            ✍️ あなた
          </div>
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); setConfirming(true); onConfirming?.(true); }}
              style={{ background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.4)", color: "#e74c3c", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(192,57,43,0.35)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(192,57,43,0.15)"; }}
            >
              取り消す
            </button>
          )}
        </div>
      )}

      {/* Delete confirmation overlay */}
      {confirming && (
        <div
          style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", borderRadius: 16, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, backdropFilter: "blur(4px)" }}
          onClick={() => { setConfirming(false); onConfirming?.(false); }}
        >
          <div style={{ color: "#e0e0e0", fontSize: 13, fontWeight: 700, fontFamily: "'Noto Sans JP', sans-serif" }}>本当に取り消しますか？</div>
          <div style={{ display: "flex", gap: 10 }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => { setConfirming(false); onConfirming?.(false); handleDeleteConfirm(); }}
              style={{ padding: "7px 20px", background: "rgba(192,57,43,0.3)", border: "1px solid #e74c3c", borderRadius: 10, color: "#e74c3c", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(192,57,43,0.55)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(192,57,43,0.3)"; }}
            >
              はい
            </button>
            <button
              onClick={() => { setConfirming(false); onConfirming?.(false); }}
              style={{ padding: "7px 20px", background: "rgba(255,255,255,0.06)", border: "1px solid #333", borderRadius: 10, color: "#aaa", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            >
              いいえ
            </button>
          </div>
        </div>
      )}

      {/* Room tag */}
      <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(255,255,255,0.08)", color: "#aaa", fontSize: 10, padding: "2px 8px", borderRadius: 20, fontFamily: "'Noto Sans JP', sans-serif", zIndex: 2 }}>
        #{post.room || "フリー"}
      </div>

      {/* Spoiler overlay button */}
      {!!post.spoiler && !spoilerRevealed && (
        <div style={{ position: "absolute", top: 36, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 3 }}>
          <button
            onClick={(e) => { e.stopPropagation(); setSpoilerRevealed(true); }}
            style={{ padding: "6px 18px", background: "rgba(230,126,34,0.18)", border: "1px solid #e67e22", borderRadius: 20, color: "#e67e22", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", backdropFilter: "blur(4px)" }}
          >
            ⚠ ネタバレ
          </button>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: "42px 16px 14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ fontSize: 22, width: 40, height: 40, background: "rgba(255,255,255,0.05)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${tier.border}33` }}>
            {post.user_id === "system" ? "👤" : "🍣"}
          </div>
          <div>
            <div style={{ color: "#e0e0e0", fontSize: 12, fontWeight: 600, fontFamily: "'Noto Sans JP', sans-serif" }}>
              {post.user_id === "system" ? "運営" : "名無しユーザー"}
            </div>
            <div style={{ color: "#555", fontSize: 10, fontFamily: "'Noto Sans JP', sans-serif" }}>
              {formatDateTime(post.created_at)}
            </div>
          </div>
        </div>

        <p style={{ color: "#d0d0d0", fontSize: 13, lineHeight: 1.7, fontFamily: "'Noto Sans JP', sans-serif", margin: 0, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden", filter: isSpoiler ? "blur(6px)" : "none", userSelect: isSpoiler ? "none" : "auto", transition: "filter 0.3s" }}>
          {post.content}
        </p>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleLike}
            style={{ flex: 1, padding: "8px 0", background: isLiked ? `${tier.bg}33` : "rgba(255,255,255,0.04)", border: `1px solid ${isLiked ? tier.glow : "#333"}`, borderRadius: 10, color: isLiked ? tier.glow : "#888", fontSize: 12, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 600, transition: rm ? "none" : "all 0.3s", transform: (!rm && animating) ? "scale(1.1)" : "scale(1)" }}
          >
            {isLiked ? "✅" : "🥢"} {post.likes}
          </button>
          <button
            onClick={() => { if (isLiked) onOpenComments(post); }}
            disabled={!isLiked}
            title={isLiked ? "コメントを書く・閲覧する" : "先に皿を取ってください"}
            style={{ flex: 1, padding: "8px 0", background: isLiked ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${isLiked ? "#444" : "#222"}`, borderRadius: 10, color: isLiked ? "#ccc" : "#444", fontSize: 12, cursor: isLiked ? "pointer" : "not-allowed", fontFamily: "'Noto Sans JP', sans-serif", transition: "all 0.3s" }}
          >
            {isLiked ? "💬 コメント" : "🔒 ロック"}
          </button>
        </div>
        {isLiked && onAddToBucket && (
          <button
            onClick={() => onAddToBucket(post)}
            style={{ width: "100%", marginTop: 6, padding: "7px 0", background: "rgba(255,255,255,0.03)", border: "1px solid #2a2a3a", borderRadius: 10, color: "#666", fontSize: 11, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#aaa"; e.currentTarget.style.borderColor = "#444"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#666"; e.currentTarget.style.borderColor = "#2a2a3a"; }}
          >
            🍱 箱に入れる
          </button>
        )}
      </div>
    </div>
  );
}
