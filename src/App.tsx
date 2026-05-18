import { useState, useEffect, useRef, useCallback } from "react";
import type { Post, Bucket, Selected, NavPage } from "./types";
import { API_BASE, getOrCreateUserId } from "./utils/api";
import { CATEGORIES } from "./utils/categories";
import { PlateCard } from "./components/PlateCard";
import { ConveyorBelt } from "./components/ConveyorBelt";
import { Sidebar } from "./components/Sidebar";
import { BottomNav } from "./components/BottomNav";
import { StatsBar } from "./components/StatsBar";
import { CommentModal } from "./components/modals/CommentModal";
import { PostModal } from "./components/modals/PostModal";
import { SettingsModal } from "./components/modals/SettingsModal";
import { BucketSelectorModal } from "./components/modals/BucketSelectorModal";
import { BucketDetailModal } from "./components/modals/BucketDetailModal";

export default function App() {
  const [userId] = useState(() => getOrCreateUserId());
  const [selected, setSelected] = useState<Selected>({ cat: CATEGORIES[0], sub: CATEGORIES[0].subs[0], room: CATEGORIES[0].subs[0].rooms[0] });
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [commentPost, setCommentPost] = useState<Post | null>(null);
  const [commentFromBucket, setCommentFromBucket] = useState<Bucket | null>(null);
  const [showPost, setShowPost] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [showSpoilers, setShowSpoilers] = useState(false);
  const [laneCount, setLaneCount] = useState<1 | 2>(2);
  const [lane1Dir, setLane1Dir] = useState<"rtl" | "ltr">("rtl");
  const [lane2Dir, setLane2Dir] = useState<"rtl" | "ltr">("ltr");
  const [activeTab, setActiveTab] = useState<"feed" | "room">("feed");
  const [activePage, setActivePage] = useState<NavPage>("home");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [bucketTarget, setBucketTarget] = useState<Post | null>(null);
  const [viewingBucket, setViewingBucket] = useState<Bucket | null>(null);
  const [creatingBucket, setCreatingBucket] = useState(false);
  const [newBucketName, setNewBucketName] = useState("");
  const newBucketInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const fetchPosts = useCallback(() => {
    fetch(`${API_BASE}/posts`)
      .then((r) => r.json())
      .then((data: Post[]) => setPosts(data))
      .catch(() => {});
  }, []);

  const fetchLikedIds = useCallback(() => {
    fetch(`${API_BASE}/posts/liked?user_id=${userId}`)
      .then((r) => r.json())
      .then((ids: number[]) => setLikedIds(new Set(ids)))
      .catch(() => {});
  }, [userId]);

  const fetchBuckets = useCallback(() => {
    fetch(`${API_BASE}/buckets?user_id=${userId}`)
      .then((r) => r.json())
      .then((data: Bucket[]) => setBuckets(data))
      .catch(() => {});
  }, [userId]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  useEffect(() => { fetchLikedIds(); }, [fetchLikedIds]);
  useEffect(() => { fetchBuckets(); }, [fetchBuckets]);

  const handleLike = useCallback(async (id: number) => {
    await fetch(`${API_BASE}/posts/${id}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    setLikedIds((prev) => { const n = new Set(prev); n.add(id); return n; });
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  }, [userId]);

  const handleUnlike = useCallback(async (id: number) => {
    await fetch(`${API_BASE}/posts/${id}/like?user_id=${userId}`, {
      method: "DELETE",
    });
    setLikedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, likes: Math.max(0, p.likes - 1) } : p));
  }, [userId]);

  const handleOpenComments = useCallback((post: Post) => {
    setCommentPost(post);
  }, []);

  const handleDeletePost = useCallback((id: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setLikedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
  }, []);

  const handleChangePage = (page: NavPage) => {
    if (page === "settings") { setShowSettings(true); return; }
    setActivePage(page);
  };

  const getNextBucketName = () => {
    const base = "新しい箱";
    const names = new Set(buckets.map((b) => b.name));
    if (!names.has(base)) return base;
    for (let i = 2; ; i++) {
      const candidate = `${base} (${i})`;
      if (!names.has(candidate)) return candidate;
    }
  };

  const handleCreateBucket = async () => {
    if (!newBucketName.trim()) { setCreatingBucket(false); return; }
    setCreatingBucket(false);
    const res = await fetch(`${API_BASE}/buckets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newBucketName.trim(), user_id: userId }),
    });
    const bucket: Bucket = await res.json();
    setBuckets((prev) => [...prev, bucket]);
    setNewBucketName("");
  };

  const handleDeleteBucket = async (bucketId: number) => {
    await fetch(`${API_BASE}/buckets/${bucketId}?user_id=${userId}`, {
      method: "DELETE",
    });
    setBuckets((prev) => prev.filter((b) => b.id !== bucketId));
  };

  const likedPosts = posts.filter((p) => likedIds.has(p.id));
  const filteredPosts = activeTab === "room"
    ? posts.filter((p) => p.room === selected?.room)
    : posts;

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0a0a12", fontFamily: "'Noto Sans JP', sans-serif", overflow: "hidden" }}>

      {!isMobile && (
        <Sidebar
          categories={CATEGORIES}
          selected={selected}
          onSelect={(s) => { setSelected(s); setActivePage("home"); }}
          activePage={activePage}
          onChangePage={handleChangePage}
        />
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", paddingBottom: isMobile ? 60 : 0 }}>

        {/* Header */}
        <div style={{ padding: "14px 24px", background: "rgba(8,8,18,0.95)", borderBottom: "1px solid #1a1a2a", display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(10px)", flexShrink: 0 }}>
          {isMobile ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src="/logo.svg" alt="あにすし" style={{ height: 24 }} />
              <div style={{ display: "flex", gap: 10 }}>
                {([
                  ["🥢", posts.length],
                  ["✅", likedIds.size],
                  ["✨", posts.filter((p) => p.tier === "gold").length],
                ] as [string, number][]).map(([icon, val]) => (
                  <div key={icon} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11 }}>{icon}</div>
                    <div style={{ color: "#e0e0e0", fontSize: 11, fontWeight: 700, fontFamily: "'Noto Serif JP', serif", lineHeight: 1 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ color: "#e0e0e0", fontSize: 16, fontWeight: 700, fontFamily: "'Noto Serif JP', serif" }}>
                {activePage === "collection"
                  ? "🍱 コレクション"
                  : `${selected?.sub?.icon ?? ""} ${selected?.sub?.label ?? ""} › #${selected?.room ?? "ホーム"}`}
              </div>
              <div style={{ color: "#444", fontSize: 10, marginTop: 2 }}>
                {activePage === "collection" ? "取った皿・箱を管理" : "回転中・ホバーで停止"}
              </div>
            </div>
          )}
          <button onClick={() => setShowPost(true)} style={{ padding: "8px 18px", background: "#c0392b", border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Noto Sans JP', sans-serif", boxShadow: "0 0 20px #c0392b55" }}>
            + 皿を出す
          </button>
        </div>

        {!isMobile && <StatsBar posts={posts} likedIds={likedIds} />}

        {activePage === "home" && (
          <div style={{ display: "flex", borderBottom: "1px solid #1a1a2a", background: "rgba(5,5,12,0.9)", flexShrink: 0 }}>
            {([["feed", "🌊 全体フィード"], ["room", "🏠 このルーム"]] as ["feed" | "room", string][]).map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)} style={{ padding: "10px 20px", background: "none", border: "none", color: activeTab === key ? "#c0392b" : "#555", borderBottom: activeTab === key ? "2px solid #c0392b" : "2px solid transparent", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'Noto Sans JP', sans-serif", transition: "all 0.2s" }}>
                {label}
              </button>
            ))}
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto" }}>

          {/* ===== Collection page ===== */}
          {activePage === "collection" ? (
            <div style={{ padding: 24 }}>

              <div style={{ marginBottom: 36 }}>
                <div style={{ color: "#e0e0e0", fontSize: 11, letterSpacing: 2, fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 16 }}>━━ 取った皿 ━━</div>
                {likedPosts.length === 0 ? (
                  <div style={{ color: "#333", fontSize: 13, fontFamily: "'Noto Sans JP', sans-serif" }}>まだ皿を取っていません。気に入った投稿を取ってみてください！</div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                    {likedPosts.map((post) => (
                      <PlateCard key={post.id} post={post} isLiked={true} onLike={handleLike} onUnlike={handleUnlike} onOpenComments={handleOpenComments} onAddToBucket={(p) => setBucketTarget(p)} userId={userId} onDelete={handleDeletePost} reducedMotion={reducedMotion} showSpoilers={showSpoilers} />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ color: "#e0e0e0", fontSize: 11, letterSpacing: 2, fontFamily: "'Noto Sans JP', sans-serif" }}>━━ 箱一覧 ━━</div>
                  <button
                    onClick={() => { setNewBucketName(getNextBucketName()); setCreatingBucket(true); }}
                    style={{ padding: "6px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid #2a2a3a", borderRadius: 8, color: "#777", fontSize: 12, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#555"; e.currentTarget.style.color = "#bbb"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a3a"; e.currentTarget.style.color = "#777"; }}>
                    ＋ 箱を作る
                  </button>
                </div>

                {creatingBucket && (
                  <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
                    <input
                      ref={newBucketInputRef}
                      autoFocus
                      value={newBucketName}
                      onChange={(e) => setNewBucketName(e.target.value.slice(0, 20))}
                      onFocus={(e) => e.target.select()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateBucket();
                        if (e.key === "Escape") { setCreatingBucket(false); setNewBucketName(""); }
                      }}
                      onBlur={() => { setCreatingBucket(false); setNewBucketName(""); }}
                      style={{ flex: 1, boxSizing: "border-box", background: "rgba(255,255,255,0.06)", border: "1px solid #555", borderRadius: 8, padding: "8px 12px", color: "#e0e0e0", fontSize: 13, fontFamily: "'Noto Sans JP', sans-serif", outline: "none" }}
                    />
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleCreateBucket}
                      style={{ padding: "8px 16px", background: "rgba(192,57,43,0.2)", border: "1px solid #e74c3c", borderRadius: 8, color: "#e74c3c", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", whiteSpace: "nowrap" }}
                    >
                      決定
                    </button>
                  </div>
                )}

                {buckets.length === 0 && !creatingBucket ? (
                  <div style={{ color: "#333", fontSize: 13, fontFamily: "'Noto Sans JP', sans-serif" }}>まだ箱がありません。箱を作って皿を整理しましょう！</div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
                    {buckets.map((b) => (
                      <div key={b.id}
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #1f1f2f", borderRadius: 14, padding: "18px 16px", textAlign: "center", transition: "all 0.2s", position: "relative" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.borderColor = "#333"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "#1f1f2f"; }}>
                        <div onClick={() => setViewingBucket(b)} style={{ cursor: "pointer" }}>
                          <div style={{ fontSize: 28, marginBottom: 8 }}>🍱</div>
                          <div style={{ color: "#ccc", fontSize: 13, fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 600 }}>{b.name}</div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteBucket(b.id); }}
                          style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", color: "#c0392b", fontSize: 21, cursor: "pointer", padding: "2px 4px", borderRadius: 4, transition: "color 0.15s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#e74c3c")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#c0392b")}
                        >🗑</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {(() => {
                const myPosts = posts.filter((p) => p.user_id === userId);
                if (myPosts.length === 0) return null;
                return (
                  <div style={{ marginTop: 36 }}>
                    <div style={{ color: "#e0e0e0", fontSize: 11, letterSpacing: 2, fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 16 }}>━━ 出した皿 ━━</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                      {myPosts.map((post) => (
                        <PlateCard key={post.id} post={post} isLiked={likedIds.has(post.id)} onLike={handleLike} onUnlike={handleUnlike} onOpenComments={handleOpenComments} userId={userId} onDelete={handleDeletePost} reducedMotion={reducedMotion} showSpoilers={showSpoilers} />
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

          ) : (
            /* ===== Home page ===== */
            filteredPosts.length === 0 ? (
              <div style={{ padding: 60, textAlign: "center", color: "#333", fontFamily: "'Noto Sans JP', sans-serif", fontSize: 13 }}>
                このルームにはまだ投稿がありません。最初の皿を出しましょう！
              </div>
            ) : (
              <>
                <div style={{ padding: "12px 24px 4px", flexShrink: 0 }}>
                  <div style={{ color: "#e0e0e0", fontSize: 11, letterSpacing: 2, fontFamily: "'Noto Sans JP', sans-serif" }}>━━ 皿が流れています。気に入ったら取ってください ━━</div>
                </div>
                <ConveyorBelt posts={filteredPosts} likedIds={likedIds} onLike={handleLike} onUnlike={handleUnlike} onOpenComments={handleOpenComments} userId={userId} onDelete={handleDeletePost} forcePaused={showSettings} reducedMotion={reducedMotion} showSpoilers={showSpoilers} laneCount={laneCount} lane1Dir={lane1Dir} lane2Dir={lane2Dir} isMobile={isMobile} />
                <div style={{ padding: "24px", borderTop: "1px solid #1a1a2a" }}>
                  <div style={{ color: "#e0e0e0", fontSize: 11, letterSpacing: 2, fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 16 }}>━━ 全ての皿 ━━</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                    {filteredPosts.map((post) => (
                      <PlateCard key={post.id} post={post} isLiked={likedIds.has(post.id)} onLike={handleLike} onUnlike={handleUnlike} onOpenComments={handleOpenComments} userId={userId} onDelete={handleDeletePost} reducedMotion={reducedMotion} showSpoilers={showSpoilers} />
                    ))}
                  </div>
                </div>
              </>
            )
          )}
        </div>
      </div>

      {isMobile && <BottomNav activePage={activePage} onChangePage={handleChangePage} />}

      {/* Modals */}
      {commentPost && <CommentModal post={commentPost} onClose={() => { setCommentPost(null); setCommentFromBucket(null); }} likedIds={likedIds} userId={userId} fromBucket={commentFromBucket ?? undefined} onBackToBucket={commentFromBucket ? () => { setCommentPost(null); setViewingBucket(commentFromBucket); setCommentFromBucket(null); } : undefined} />}
      {showPost && <PostModal currentRoom={selected?.room} onClose={() => setShowPost(false)} onPosted={fetchPosts} userId={userId} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} reducedMotion={reducedMotion} onToggleReducedMotion={() => setReducedMotion((v) => !v)} showSpoilers={showSpoilers} onToggleShowSpoilers={() => setShowSpoilers((v) => !v)} laneCount={laneCount} onSetLaneCount={setLaneCount} lane1Dir={lane1Dir} onSetLane1Dir={setLane1Dir} lane2Dir={lane2Dir} onSetLane2Dir={setLane2Dir} isMobile={isMobile} />}
      {bucketTarget && (
        <BucketSelectorModal
          post={bucketTarget}
          buckets={buckets}
          userId={userId}
          onClose={() => setBucketTarget(null)}
          onBucketCreated={(b) => setBuckets((prev) => [...prev, b])}
          onAdded={() => {}}
        />
      )}
      {viewingBucket && (
        <BucketDetailModal
          bucket={viewingBucket}
          userId={userId}
          onClose={() => setViewingBucket(null)}
          likedIds={likedIds}
          onOpenComments={(post) => {
            setCommentFromBucket(viewingBucket);
            setCommentPost(post);
            setViewingBucket(null);
          }}
        />
      )}
    </div>
  );
}
