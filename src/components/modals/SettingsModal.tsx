export function SettingsModal({ onClose, reducedMotion, onToggleReducedMotion, showSpoilers, onToggleShowSpoilers, laneCount, onSetLaneCount, lane1Dir, onSetLane1Dir, lane2Dir, onSetLane2Dir, isMobile, speed, onSetSpeed }: {
  onClose: () => void;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  showSpoilers: boolean;
  onToggleShowSpoilers: () => void;
  laneCount: 1 | 2;
  onSetLaneCount: (n: 1 | 2) => void;
  lane1Dir: "rtl" | "ltr";
  onSetLane1Dir: (d: "rtl" | "ltr") => void;
  lane2Dir: "rtl" | "ltr";
  onSetLane2Dir: (d: "rtl" | "ltr") => void;
  isMobile: boolean;
  speed: "slow" | "normal" | "fast";
  onSetSpeed: (s: "slow" | "normal" | "fast") => void;
}) {
  const pending = ["ダークモード切り替え", "SEのオン・オフ", "BGMのオン・オフ", "文字サイズの調節", "言語切り替え"];
  const speedOptions: { key: "slow" | "normal" | "fast"; label: string }[] = [
    { key: "slow", label: "ゆっくり" },
    { key: "normal", label: "ふつう" },
    { key: "fast", label: "はやい" },
  ];

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <div onClick={onToggle} style={{ width: 44, height: 24, borderRadius: 12, background: on ? "#c0392b" : "#2a2a3a", position: "relative", cursor: "pointer", transition: "background 0.2s", border: `1px solid ${on ? "#e74c3c" : "#444"}`, flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3, left: on ? 22 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
    </div>
  );

  const DirSelect = ({ value, onChange }: { value: "rtl" | "ltr"; onChange: (d: "rtl" | "ltr") => void }) => (
    <div style={{ display: "flex", gap: 4 }}>
      {(["rtl", "ltr"] as const).map((d) => (
        <button key={d} onClick={() => onChange(d)} style={{ padding: "3px 10px", borderRadius: 8, border: `1px solid ${value === d ? "#e74c3c" : "#333"}`, background: value === d ? "rgba(192,57,43,0.2)" : "rgba(255,255,255,0.03)", color: value === d ? "#e74c3c" : "#666", fontSize: 11, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 600 }}>
          {d === "rtl" ? "右→左" : "左→右"}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#0f0f1a", border: "1px solid #333", borderRadius: 20, width: "100%", maxWidth: 420, overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #222", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#e0e0e0", fontFamily: "'Noto Sans JP', sans-serif", fontSize: 14, fontWeight: 700 }}>⚙️ 設定</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ padding: 20 }}>

          {/* レーン数・向き（PCのみ） */}
          {!isMobile && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #1a1a2a" }}>
                <span style={{ color: "#e0e0e0", fontSize: 13, fontFamily: "'Noto Sans JP', sans-serif" }}>流れるレーン数</span>
                <div style={{ display: "flex", gap: 4 }}>
                  {([1, 2] as const).map((n) => (
                    <button key={n} onClick={() => onSetLaneCount(n)} style={{ padding: "3px 14px", borderRadius: 8, border: `1px solid ${laneCount === n ? "#e74c3c" : "#333"}`, background: laneCount === n ? "rgba(192,57,43,0.2)" : "rgba(255,255,255,0.03)", color: laneCount === n ? "#e74c3c" : "#666", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>
                      {n}本
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #1a1a2a" }}>
                <span style={{ color: "#e0e0e0", fontSize: 13, fontFamily: "'Noto Sans JP', sans-serif" }}>1本目の向き</span>
                <DirSelect value={lane1Dir} onChange={onSetLane1Dir} />
              </div>
              {laneCount === 2 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #1a1a2a" }}>
                  <span style={{ color: "#e0e0e0", fontSize: 13, fontFamily: "'Noto Sans JP', sans-serif" }}>2本目の向き</span>
                  <DirSelect value={lane2Dir} onChange={onSetLane2Dir} />
                </div>
              )}
            </>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #1a1a2a" }}>
            <span style={{ color: "#e0e0e0", fontSize: 13, fontFamily: "'Noto Sans JP', sans-serif" }}>流れる速さ</span>
            <div style={{ display: "flex", gap: 4 }}>
              {speedOptions.map((o) => (
                <button key={o.key} onClick={() => onSetSpeed(o.key)} style={{ padding: "3px 10px", borderRadius: 8, border: `1px solid ${speed === o.key ? "#e74c3c" : "#333"}`, background: speed === o.key ? "rgba(192,57,43,0.2)" : "rgba(255,255,255,0.03)", color: speed === o.key ? "#e74c3c" : "#666", fontSize: 11, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 600 }}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #1a1a2a" }}>
            <span style={{ color: "#e0e0e0", fontSize: 13, fontFamily: "'Noto Sans JP', sans-serif" }}>ネタバレを表示</span>
            <Toggle on={showSpoilers} onToggle={onToggleShowSpoilers} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #1a1a2a" }}>
            <span style={{ color: "#e0e0e0", fontSize: 13, fontFamily: "'Noto Sans JP', sans-serif" }}>アニメーション簡略化</span>
            <Toggle on={reducedMotion} onToggle={onToggleReducedMotion} />
          </div>

          {pending.map((label) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #1a1a2a" }}>
              <span style={{ color: "#888", fontSize: 13, fontFamily: "'Noto Sans JP', sans-serif" }}>{label}</span>
              <span style={{ color: "#555", fontSize: 11, fontFamily: "'Noto Sans JP', sans-serif" }}>🚧 準備中</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
