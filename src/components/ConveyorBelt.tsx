import { useState, useEffect, useRef } from "react";
import type { Post } from "../types";
import { PlateCard } from "./PlateCard";

export function ConveyorBelt({ posts, likedIds, onLike, onUnlike, onOpenComments, userId, onDelete, forcePaused, reducedMotion, showSpoilers, laneCount, lane1Dir, lane2Dir, isMobile }: {
  posts: Post[];
  likedIds: Set<number>;
  onLike: (id: number) => void;
  onUnlike: (id: number) => void;
  onOpenComments: (post: Post) => void;
  userId: string;
  onDelete: (id: number) => void;
  forcePaused?: boolean;
  reducedMotion?: boolean;
  showSpoilers?: boolean;
  laneCount?: 1 | 2;
  lane1Dir?: "rtl" | "ltr";
  lane2Dir?: "rtl" | "ltr";
  isMobile?: boolean;
}) {
  const track1Ref = useRef<HTMLDivElement>(null);
  const track2Ref = useRef<HTMLDivElement>(null);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [touchPaused, setTouchPaused] = useState(false);
  const [confirmPaused, setConfirmPaused] = useState(false);
  const paused = hoverPaused || touchPaused || confirmPaused || !!forcePaused;
  const pos1Ref = useRef(0);
  const pos2Ref = useRef(0);
  const rafRef = useRef<number>(0);

  const isVertical = !!isMobile;

  useEffect(() => {
    const t1 = track1Ref.current;
    const t2 = track2Ref.current;
    if (!t1) return;
    const dir1 = lane1Dir ?? "rtl";
    const dir2 = lane2Dir ?? "ltr";
    const lanes = laneCount ?? 2;
    let last: number | null = null;
    const step = (ts: number) => {
      if (!last) last = ts;
      if (!paused) {
        const delta = (ts - last) * 0.04;
        if (isVertical) {
          const total1 = t1.scrollHeight / 2;
          pos1Ref.current += delta;
          if (pos1Ref.current >= total1) pos1Ref.current -= total1;
          t1.style.transform = `translateY(${pos1Ref.current - total1}px)`;
        } else {
          const total1 = t1.scrollWidth / 2;
          pos1Ref.current += delta;
          if (pos1Ref.current >= total1) pos1Ref.current -= total1;
          t1.style.transform = dir1 === "rtl" ? `translateX(-${pos1Ref.current}px)` : `translateX(${pos1Ref.current - total1}px)`;
          if (lanes === 2 && t2) {
            const total2 = t2.scrollWidth / 2;
            pos2Ref.current += delta;
            if (pos2Ref.current >= total2) pos2Ref.current -= total2;
            t2.style.transform = dir2 === "rtl" ? `translateX(-${pos2Ref.current}px)` : `translateX(${pos2Ref.current - total2}px)`;
          }
        }
      }
      last = ts;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paused, laneCount, lane1Dir, lane2Dir, isVertical]);

  const doubled = [...posts, ...posts];

  if (isVertical) {
    return (
      <div style={{ position: "relative", overflow: "hidden", height: "65vh" }}
        onClick={() => setTouchPaused((v) => !v)}>
        <div ref={track1Ref} style={{ display: "flex", flexDirection: "column", gap: 16, height: "max-content", padding: "16px 16px", width: "100%", boxSizing: "border-box" }}>
          {doubled.map((post, i) => (
            <PlateCard key={`v-${post.id}-${i}`} post={post} isLiked={likedIds.has(post.id)} onLike={onLike} onUnlike={onUnlike} onOpenComments={onOpenComments} userId={userId} onDelete={onDelete} reducedMotion={reducedMotion} showSpoilers={showSpoilers} fullWidth onConfirming={setConfirmPaused} />
          ))}
        </div>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 80, background: "linear-gradient(180deg, #0a0a12, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: "linear-gradient(0deg, #0a0a12, transparent)", zIndex: 2, pointerEvents: "none" }} />
      </div>
    );
  }

  return (
    <div style={{ position: "relative", padding: isMobile ? "4px 0 8px" : "20px 0" }}
      onMouseEnter={() => setHoverPaused(true)} onMouseLeave={() => setHoverPaused(false)}
      onClick={() => setTouchPaused((v) => !v)}>
      {/* レーン1 */}
      <div style={{ position: "relative", overflow: "hidden", marginBottom: isMobile ? 8 : 16 }}>
        <div ref={track1Ref} style={{ display: "flex", gap: 16, width: "max-content", padding: "0 16px" }}>
          {doubled.map((post, i) => (
            <PlateCard key={`l1-${post.id}-${i}`} post={post} isLiked={likedIds.has(post.id)} onLike={onLike} onUnlike={onUnlike} onOpenComments={onOpenComments} userId={userId} onDelete={onDelete} reducedMotion={reducedMotion} showSpoilers={showSpoilers} onConfirming={setConfirmPaused} />
          ))}
        </div>
      </div>
      {/* レーン2（スマホ横モードでは非表示） */}
      {(laneCount ?? 2) === 2 && !isMobile && (
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div ref={track2Ref} style={{ display: "flex", gap: 16, width: "max-content", padding: "0 16px" }}>
            {doubled.map((post, i) => (
              <PlateCard key={`l2-${post.id}-${i}`} post={post} isLiked={likedIds.has(post.id)} onLike={onLike} onUnlike={onUnlike} onOpenComments={onOpenComments} userId={userId} onDelete={onDelete} reducedMotion={reducedMotion} showSpoilers={showSpoilers} onConfirming={setConfirmPaused} />
            ))}
          </div>
        </div>
      )}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 80, background: "linear-gradient(90deg, #0a0a12, transparent)", zIndex: 2, pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 80, background: "linear-gradient(-90deg, #0a0a12, transparent)", zIndex: 2, pointerEvents: "none" }} />
    </div>
  );
}
