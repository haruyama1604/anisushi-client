import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// TYPES
// ============================================================
type Room = string;

type Sub = {
  id: string;
  label: string;
  icon: string;
  rooms: Room[];
};

type Category = {
  id: string;
  label: string;
  icon: string;
  subs: Sub[];
};

type PlateType = "normal" | "popular" | "legend";

type PlateColor = {
  bg: string;
  label: string;
  glow: string;
};

type Comment = {
  id: number;
  user: string;
  avatar: string;
  text: string;
  time: string;
};

type Post = {
  id: number;
  user: string;
  avatar: string;
  text: string;
  stocks: number;
  comments: Comment[];
  timestamp: string;
  room: string;
  locked: boolean;
};

type Selected = {
  cat: Category;
  sub: Sub;
  room: string;
};

// ============================================================
// MOCK DATA
// ============================================================
const CATEGORIES: Category[] = [
  {
    id: "anime",
    label: "アニメ",
    icon: "📺",
    subs: [
      {
        id: "chainsaw",
        label: "チェンソーマン",
        icon: "🪚",
        rooms: [
          "キャラ考察",
          "デンジ×パワー",
          "藤本タツキ論",
          "名シーン保管庫",
          "アニメvs原作",
        ],
      },
      {
        id: "gundam",
        label: "ガンダム",
        icon: "🤖",
        rooms: [
          "シャア考察",
          "MS設定談義",
          "一年戦争",
          "Gレコ再評価",
          "富野監督語り場",
        ],
      },
      {
        id: "oshi",
        label: "推しの子",
        icon: "⭐",
        rooms: [
          "アイ伝説",
          "ルビー応援",
          "メタ構造考察",
          "芸能界リアル談",
          "最終回予測",
        ],
      },
    ],
  },
  {
    id: "manga",
    label: "漫画",
    icon: "📚",
    subs: [
      {
        id: "onepiece",
        label: "ワンピース",
        icon: "🏴‍☠️",
        rooms: [
          "最新話速報",
          "伏線回収記録",
          "悪魔の実図鑑",
          "歴代名シーン",
          "尾田栄一郎神話",
        ],
      },
      {
        id: "jjk",
        label: "呪術廻戦",
        icon: "🌀",
        rooms: [
          "術式考察",
          "五条悟信仰",
          "虎杖の正体",
          "廻戦用語辞典",
          "芥見構成論",
        ],
      },
    ],
  },
  {
    id: "game",
    label: "ゲーム",
    icon: "🎮",
    subs: [
      {
        id: "elden",
        label: "エルデンリング",
        icon: "🗡️",
        rooms: [
          "マリカ神話考察",
          "ボス攻略",
          "建築美術鑑賞",
          "縛りプレイ記録",
          "次回作予測",
        ],
      },
    ],
  },
];

const PLATE_COLORS: Record<PlateType, PlateColor> = {
  normal:  { bg: "#c0392b", label: "赤皿", glow: "#e74c3c" },
  popular: { bg: "#f39c12", label: "金皿", glow: "#f1c40f" },
  legend:  { bg: "#8e44ad", label: "虹皿", glow: "#9b59b6" },
};

function getPlateType(stocks: number): PlateType {
  if (stocks >= 50) return "legend";
  if (stocks >= 15) return "popular";
  return "normal";
}

const MOCK_POSTS: Post[] = [
  {
    id: 1,
    user: "名無しの考察師",
    avatar: "🧠",
    text: "チェンソーマンの「恐怖の悪魔」が最終ボスである根拠を整理した。マキマの目的は人間社会の「恐怖」を制御することで、全悪魔の頂点に君臨することだった。つまり物語全体が恐怖の生態系の話だ",
    stocks: 72,
    comments: [],
    timestamp: "3時間前",
    room: "チェンソーマン",
    locked: true,
  },
  {
    id: 2,
    user: "デンジ派",
    avatar: "🪚",
    text: "デンジの「普通の幸せ」への渇望が物語の核心。幼少期の貧困と孤独が、彼の全ての行動原理になってる",
    stocks: 31,
    comments: [],
    timestamp: "5時間前",
    room: "チェンソーマン",
    locked: true,
  },
  {
    id: 3,
    user: "ガンダム老兵",
    avatar: "🤖",
    text: "シャアは結局マザコンだったという結論に20年かけて辿り着いた。ララァへの感情もアムロへの執着も全部そこに収束する",
    stocks: 88,
    comments: [],
    timestamp: "1日前",
    room: "ガンダム",
    locked: true,
  },
  {
    id: 4,
    user: "one_piece_fan",
    avatar: "🏴‍☠️",
    text: "ルフィの「Dの意志」の真相、ついに見えてきた気がする。ジョイボーイとの関係性が鍵になる",
    stocks: 12,
    comments: [],
    timestamp: "2時間前",
    room: "ワンピース",
    locked: true,
  },
  {
    id: 5,
    user: "呪術師見習い",
    avatar: "🌀",
    text: "五条悟の封印シーン、あの瞬間の演出の密度が異常。芥見先生の「読者に情報を与えすぎない」哲学がここで最高到達点に達してる",
    stocks: 44,
    comments: [],
    timestamp: "6時間前",
    room: "呪術廻戦",
    locked: true,
  },
  {
    id: 6,
    user: "エルデン廃人",
    avatar: "🗡️",
    text: "マリカとラダーンの関係性、考えれば考えるほど深い。星砕きの儀式の真の意味はエルデの法理への反逆だった",
    stocks: 19,
    comments: [],
    timestamp: "4時間前",
    room: "エルデンリング",
    locked: true,
  },
  {
    id: 7,
    user: "アイ崇拝者",
    avatar: "⭐",
    text: "アイの「うそつき」発言の真意、読み返すたびに新しい解釈が生まれる。赤坂先生の言語設計は天才的",
    stocks: 67,
    comments: [],
    timestamp: "8時間前",
    room: "推しの子",
    locked: true,
  },
  {
    id: 8,
    user: "藤本論者",
    avatar: "🔥",
    text: "藤本タツキの絵柄の変遷を初期読み切りから追うと、「感情の解像度」が上がり続けてるのが分かる",
    stocks: 23,
    comments: [],
    timestamp: "12時間前",
    room: "チェンソーマン",
    locked: true,
  },
];

// ============================================================
// COMPONENTS
// ============================================================

function PlateCard({
  post,
  onStock,
  onOpenComments,
  isStocked,
}: {
  post: Post;
  onStock: (id: number) => void;
  onOpenComments: (post: Post) => void;
  isStocked: boolean;
}) {
  const type = getPlateType(post.stocks);
  const plate = PLATE_COLORS[type];
  const [animating, setAnimating] = useState(false);

  const handleStock = () => {
    if (isStocked) return;
    setAnimating(true);
    setTimeout(() => setAnimating(false), 600);
    onStock(post.id);
  };

  return (
    <div
      style={{
        minWidth: 280,
        maxWidth: 280,
        background: "rgba(15,15,25,0.95)",
        border: `1.5px solid ${plate.glow}44`,
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
        e.currentTarget.style.boxShadow = `0 8px 32px ${plate.glow}55`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      {/* Plate badge */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: plate.bg,
          color: "#fff",
          fontSize: 11,
          fontWeight: 700,
          padding: "2px 8px",
          borderRadius: 20,
          fontFamily: "'Noto Sans JP', sans-serif",
          boxShadow: `0 0 12px ${plate.glow}88`,
          zIndex: 2,
        }}
      >
        {type === "legend" ? "🌈 " : type === "popular" ? "✨ " : "🍽 "}
        {plate.label}
      </div>

      {/* Room tag */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          background: "rgba(255,255,255,0.08)",
          color: "#aaa",
          fontSize: 10,
          padding: "2px 8px",
          borderRadius: 20,
          fontFamily: "'Noto Sans JP', sans-serif",
          zIndex: 2,
        }}
      >
        #{post.room}
      </div>

      {/* Content */}
      <div style={{ padding: "42px 16px 14px 16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontSize: 28,
              width: 40,
              height: 40,
              background: "rgba(255,255,255,0.05)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${plate.glow}33`,
            }}
          >
            {post.avatar}
          </div>
          <div>
            <div
              style={{
                color: "#e0e0e0",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "'Noto Sans JP', sans-serif",
              }}
            >
              {post.user}
            </div>
            <div
              style={{
                color: "#555",
                fontSize: 10,
                fontFamily: "'Noto Sans JP', sans-serif",
              }}
            >
              {post.timestamp}
            </div>
          </div>
        </div>
        <p
          style={{
            color: "#d0d0d0",
            fontSize: 13,
            lineHeight: 1.7,
            fontFamily: "'Noto Sans JP', sans-serif",
            margin: 0,
            marginBottom: 14,
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {post.text}
        </p>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleStock}
            style={{
              flex: 1,
              padding: "8px 0",
              background: isStocked
                ? `${plate.bg}33`
                : "rgba(255,255,255,0.04)",
              border: `1px solid ${isStocked ? plate.glow : "#333"}`,
              borderRadius: 10,
              color: isStocked ? plate.glow : "#888",
              fontSize: 12,
              cursor: isStocked ? "default" : "pointer",
              fontFamily: "'Noto Sans JP', sans-serif",
              fontWeight: 600,
              transition: "all 0.3s",
              transform: animating ? "scale(1.1)" : "scale(1)",
            }}
          >
            {isStocked ? "✅" : "🍽"} {post.stocks + (isStocked ? 1 : 0)}
          </button>
          <button
            onClick={() => onOpenComments(post)}
            style={{
              flex: 1,
              padding: "8px 0",
              background: isStocked
                ? "rgba(255,255,255,0.06)"
                : "rgba(255,255,255,0.02)",
              border: `1px solid ${isStocked ? "#444" : "#222"}`,
              borderRadius: 10,
              color: isStocked ? "#ccc" : "#444",
              fontSize: 12,
              cursor: isStocked ? "pointer" : "not-allowed",
              fontFamily: "'Noto Sans JP', sans-serif",
              transition: "all 0.3s",
            }}
          >
            {isStocked ? "💬 コメント" : "🔒 ロック"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConveyorBelt({
  posts,
  stockedIds,
  onStock,
  onOpenComments,
}: {
  posts: Post[];
  stockedIds: Set<number>;
  onStock: (id: number) => void;
  onOpenComments: (post: Post) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const posRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const totalWidth = track.scrollWidth / 2;
    let last: number | null = null;

    const step = (ts: number) => {
      if (!last) last = ts;
      if (!paused) {
        posRef.current += (ts - last) * 0.04;
        if (posRef.current >= totalWidth) posRef.current -= totalWidth;
        track.style.transform = `translateX(-${posRef.current}px)`;
      }
      last = ts;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paused]);

  const doubled = [...posts, ...posts];

  return (
    <div
      style={{ position: "relative", overflow: "hidden", padding: "20px 0" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Track rail */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          height: 2,
          background:
            "linear-gradient(90deg, transparent, #333 10%, #333 90%, transparent)",
          zIndex: 0,
        }}
      />
      <div
        ref={trackRef}
        style={{
          display: "flex",
          gap: 16,
          width: "max-content",
          padding: "0 16px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {doubled.map((post, i) => (
          <PlateCard
            key={`${post.id}-${i}`}
            post={post}
            isStocked={stockedIds.has(post.id)}
            onStock={onStock}
            onOpenComments={onOpenComments}
          />
        ))}
      </div>
      {/* Edge fades */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 80,
          background: "linear-gradient(90deg, #0a0a12, transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 80,
          background: "linear-gradient(-90deg, #0a0a12, transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

function CommentModal({
  post,
  onClose,
}: {
  post: Post;
  onClose: () => void;
  canComment: boolean;
}) {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      user: "考察班A",
      avatar: "🔬",
      text: "これは目から鱗だった",
      time: "1時間前",
    },
    {
      id: 2,
      user: "元祖名無し",
      avatar: "👤",
      text: "俺もそう思ってた！やっと言語化されたわ",
      time: "2時間前",
    },
  ]);
  const [input, setInput] = useState("");

  const submit = () => {
    if (!input.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: Date.now(),
        user: "あなた",
        avatar: "✨",
        text: input.trim(),
        time: "今",
      },
    ]);
    setInput("");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#0f0f1a",
          border: "1px solid #333",
          borderRadius: 20,
          width: "100%",
          maxWidth: 520,
          maxHeight: "80vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #222",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              color: "#e0e0e0",
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            💬 コメント欄 —{" "}
            <span style={{ color: "#888", fontWeight: 400 }}>{post.room}</span>
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#666",
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Original post */}
        <div
          style={{
            padding: "14px 20px",
            background: "rgba(255,255,255,0.02)",
            borderBottom: "1px solid #1a1a2a",
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 22 }}>{post.avatar}</span>
            <div>
              <div
                style={{
                  color: "#888",
                  fontSize: 11,
                  fontFamily: "'Noto Sans JP', sans-serif",
                  marginBottom: 4,
                }}
              >
                {post.user} · {post.timestamp}
              </div>
              <p
                style={{
                  color: "#c0c0c0",
                  fontSize: 13,
                  lineHeight: 1.7,
                  margin: 0,
                  fontFamily: "'Noto Sans JP', sans-serif",
                }}
              >
                {post.text}
              </p>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px" }}>
          {comments.map((c) => (
            <div
              key={c.id}
              style={{ display: "flex", gap: 10, marginBottom: 14 }}
            >
              <span style={{ fontSize: 18 }}>{c.avatar}</span>
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 12,
                  padding: "8px 12px",
                  flex: 1,
                  border: "1px solid #1f1f2f",
                }}
              >
                <div
                  style={{
                    color: "#777",
                    fontSize: 10,
                    fontFamily: "'Noto Sans JP', sans-serif",
                    marginBottom: 4,
                  }}
                >
                  {c.user} · {c.time}
                </div>
                <p
                  style={{
                    color: "#bbb",
                    fontSize: 13,
                    margin: 0,
                    fontFamily: "'Noto Sans JP', sans-serif",
                    lineHeight: 1.6,
                  }}
                >
                  {c.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid #222",
            display: "flex",
            gap: 8,
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 80))}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="コメント（80字まで）"
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid #333",
              borderRadius: 10,
              padding: "10px 14px",
              color: "#e0e0e0",
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 13,
              outline: "none",
            }}
          />
          <button
            onClick={submit}
            style={{
              padding: "10px 16px",
              background: "#c0392b",
              border: "none",
              borderRadius: 10,
              color: "#fff",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 13,
              fontFamily: "'Noto Sans JP', sans-serif",
            }}
          >
            送信
          </button>
        </div>
      </div>
    </div>
  );
}

function PostModal({
  currentRoom,
  onClose,
  onPost,
}: {
  currentRoom: string | undefined;
  onClose: () => void;
  onPost: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const MAX = 80;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#0f0f1a",
          border: "1px solid #444",
          borderRadius: 20,
          width: "100%",
          maxWidth: 480,
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #222",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              color: "#e0e0e0",
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            🍽 皿に乗せる —{" "}
            <span style={{ color: "#c0392b" }}>
              #{currentRoom || "ルームを選択"}
            </span>
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#666",
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: 20 }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX))}
            placeholder={`${
              currentRoom || "このルーム"
            }への投稿（${MAX}字まで）\n刺激的な考察・感想・発見を...`}
            style={{
              width: "100%",
              height: 120,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid #333",
              borderRadius: 12,
              padding: "12px 14px",
              color: "#e0e0e0",
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 14,
              outline: "none",
              resize: "none",
              lineHeight: 1.7,
              boxSizing: "border-box",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 12,
            }}
          >
            <div
              style={{
                color: text.length > MAX * 0.85 ? "#e74c3c" : "#555",
                fontSize: 12,
                fontFamily: "'Noto Sans JP', sans-serif",
              }}
            >
              {text.length} / {MAX}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                style={{
                  padding: "8px 14px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid #333",
                  borderRadius: 8,
                  color: "#888",
                  cursor: "pointer",
                  fontSize: 12,
                  fontFamily: "'Noto Sans JP', sans-serif",
                }}
              >
                𝕏 同時投稿
              </button>
              <button
                onClick={() => {
                  onPost(text);
                  onClose();
                }}
                disabled={!text.trim()}
                style={{
                  padding: "8px 20px",
                  background: text.trim() ? "#c0392b" : "#333",
                  border: "none",
                  borderRadius: 8,
                  color: text.trim() ? "#fff" : "#555",
                  cursor: text.trim() ? "pointer" : "not-allowed",
                  fontSize: 13,
                  fontFamily: "'Noto Sans JP', sans-serif",
                  fontWeight: 700,
                }}
              >
                投稿する
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sidebar({
  categories,
  selected,
  onSelect,
}: {
  categories: Category[];
  selected: Selected | null;
  onSelect: (s: Selected) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>("anime");

  return (
    <div
      style={{
        width: 220,
        background: "rgba(8,8,18,0.98)",
        borderRight: "1px solid #1a1a2a",
        height: "100%",
        overflowY: "auto",
        flexShrink: 0,
      }}
    >
      <div
        style={{ padding: "20px 16px 12px", borderBottom: "1px solid #1a1a2a" }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            fontFamily: "'Noto Serif JP', serif",
            letterSpacing: "-0.5px",
          }}
        >
          <span style={{ color: "#c0392b" }}>回転</span>
          <span style={{ color: "#e0e0e0" }}>SNS</span>
        </div>
        <div
          style={{
            color: "#444",
            fontSize: 10,
            fontFamily: "'Noto Sans JP', sans-serif",
            marginTop: 2,
          }}
        >
          β版 · オタク専用深層
        </div>
      </div>

      <div style={{ padding: "8px 0" }}>
        {categories.map((cat) => (
          <div key={cat.id}>
            <div
              onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
              style={{
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                color: expanded === cat.id ? "#e0e0e0" : "#666",
                fontSize: 13,
                fontFamily: "'Noto Sans JP', sans-serif",
                fontWeight: 700,
                background:
                  expanded === cat.id
                    ? "rgba(255,255,255,0.04)"
                    : "transparent",
                transition: "all 0.2s",
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span style={{ marginLeft: "auto", fontSize: 10, color: "#444" }}>
                {expanded === cat.id ? "▼" : "▶"}
              </span>
            </div>
            {expanded === cat.id &&
              cat.subs.map((sub) => (
                <div key={sub.id}>
                  <div
                    onClick={() => onSelect({ cat, sub, room: sub.rooms[0] })}
                    style={{
                      padding: "8px 16px 8px 32px",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      cursor: "pointer",
                      color: selected?.sub?.id === sub.id ? "#c0392b" : "#555",
                      fontSize: 12,
                      fontFamily: "'Noto Sans JP', sans-serif",
                      fontWeight: 600,
                      background:
                        selected?.sub?.id === sub.id
                          ? "rgba(192,57,43,0.08)"
                          : "transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{sub.icon}</span>
                    <span>{sub.label}</span>
                  </div>
                  {selected?.sub?.id === sub.id &&
                    sub.rooms.map((room) => (
                      <div
                        key={room}
                        onClick={() => onSelect({ cat, sub, room })}
                        style={{
                          padding: "6px 16px 6px 48px",
                          cursor: "pointer",
                          color: selected?.room === room ? "#e0e0e0" : "#444",
                          fontSize: 11,
                          fontFamily: "'Noto Sans JP', sans-serif",
                          background:
                            selected?.room === room
                              ? "rgba(255,255,255,0.03)"
                              : "transparent",
                          borderLeft:
                            selected?.room === room
                              ? "2px solid #c0392b"
                              : "2px solid transparent",
                          transition: "all 0.15s",
                        }}
                      >
                        #{room}
                      </div>
                    ))}
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div style={{ borderTop: "1px solid #1a1a2a", padding: "12px 0" }}>
        {(
          [
            ["🏠", "ホーム"],
            ["📦", "コレクション"],
            ["👤", "プロフィール"],
            ["🔔", "通知"],
            ["⚙️", "設定"],
          ] as [string, string][]
        ).map(([icon, label]) => (
          <div
            key={label}
            style={{
              padding: "9px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              color: "#555",
              fontSize: 12,
              fontFamily: "'Noto Sans JP', sans-serif",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#aaa")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsBar({
  posts,
  stockedIds,
}: {
  posts: Post[];
  stockedIds: Set<number>;
}) {
  const stockedPosts = posts.filter((p) => stockedIds.has(p.id));
  const legendCount = posts.filter(
    (p) => getPlateType(p.stocks) === "legend"
  ).length;
  return (
    <div
      style={{
        display: "flex",
        gap: 0,
        borderBottom: "1px solid #1a1a2a",
        background: "rgba(5,5,12,0.9)",
      }}
    >
      {(
        [
          ["🍽", "総皿数", posts.length],
          ["✅", "取った皿", stockedIds.size],
          ["🌈", "殿堂入り", legendCount],
          ["🔒", "解錠済み", stockedPosts.length],
        ] as [string, string, number][]
      ).map(([icon, label, val]) => (
        <div
          key={label}
          style={{
            flex: 1,
            padding: "10px 0",
            textAlign: "center",
            borderRight: "1px solid #1a1a2a",
          }}
        >
          <div style={{ fontSize: 16 }}>{icon}</div>
          <div
            style={{
              color: "#e0e0e0",
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "'Noto Serif JP', serif",
            }}
          >
            {val}
          </div>
          <div
            style={{
              color: "#444",
              fontSize: 10,
              fontFamily: "'Noto Sans JP', sans-serif",
            }}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [selected, setSelected] = useState<Selected>({
    cat: CATEGORIES[0],
    sub: CATEGORIES[0].subs[0],
    room: CATEGORIES[0].subs[0].rooms[0],
  });
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [stockedIds, setStockedIds] = useState<Set<number>>(new Set());
  const [commentPost, setCommentPost] = useState<Post | null>(null);
  const [showPost, setShowPost] = useState(false);
  const [activeTab, setActiveTab] = useState("feed"); // feed | collection | room

  // Railway API から stocks（いいね数）を取得して MOCK_POSTS に反映する
  useEffect(() => {
    fetch("https://sushi-sns-api-production.up.railway.app/posts")
      .then((res) => res.json())
      .then((apiPosts: { id: number; likes: number }[]) => {
        setPosts((prev) =>
          prev.map((post) => {
            const found = apiPosts.find((a) => a.id === post.id);
            return found ? { ...post, stocks: found.likes } : post;
          })
        );
      })
      .catch(() => {
        // API が取れなくても MOCK_POSTS のまま表示を続ける
      });
  }, []);

  const filteredPosts = posts.filter((p) =>
    activeTab === "collection"
      ? stockedIds.has(p.id)
      : activeTab === "room"
      ? p.room === selected?.room
      : true
  );

  const handleStock = useCallback((id: number) => {
    setStockedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const handleOpenComments = useCallback(
    (post: Post) => {
      if (!stockedIds.has(post.id)) return;
      setCommentPost(post);
    },
    [stockedIds]
  );

  const handlePost = (text: string) => {
    if (!text.trim()) return;
    const newPost: Post = {
      id: Date.now(),
      user: "あなた",
      avatar: "✨",
      text,
      stocks: 0,
      comments: [],
      timestamp: "今",
      room: selected?.room || "フリー",
      locked: true,
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#0a0a12",
        fontFamily: "'Noto Sans JP', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <Sidebar
        categories={CATEGORIES}
        selected={selected}
        onSelect={setSelected}
      />

      {/* Main */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 24px",
            background: "rgba(8,8,18,0.95)",
            borderBottom: "1px solid #1a1a2a",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backdropFilter: "blur(10px)",
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                color: "#e0e0e0",
                fontSize: 16,
                fontWeight: 700,
                fontFamily: "'Noto Serif JP', serif",
              }}
            >
              {selected?.sub?.icon} {selected?.sub?.label || "全体"}{" "}
              <span style={{ color: "#444", fontSize: 12, fontWeight: 400 }}>
                ›
              </span>{" "}
              <span style={{ color: "#c0392b", fontSize: 13 }}>
                #{selected?.room || "ホーム"}
              </span>
            </div>
            <div style={{ color: "#444", fontSize: 10, marginTop: 2 }}>
              回転中・ホバーで停止
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setShowPost(true)}
              style={{
                padding: "8px 18px",
                background: "#c0392b",
                border: "none",
                borderRadius: 10,
                color: "#fff",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "'Noto Sans JP', sans-serif",
                boxShadow: "0 0 20px #c0392b55",
              }}
            >
              + 皿を出す
            </button>
          </div>
        </div>

        {/* Stats */}
        <StatsBar posts={posts} stockedIds={stockedIds} />

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #1a1a2a",
            background: "rgba(5,5,12,0.9)",
            flexShrink: 0,
          }}
        >
          {(
            [
              ["feed", "🌊 全体フィード"],
              ["room", "🏠 このルーム"],
              ["collection", "📦 コレクション"],
            ] as [string, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                padding: "10px 20px",
                background: "none",
                border: "none",
                color: activeTab === key ? "#c0392b" : "#555",
                borderBottom:
                  activeTab === key
                    ? "2px solid #c0392b"
                    : "2px solid transparent",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "'Noto Sans JP', sans-serif",
                transition: "all 0.2s",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Feed label */}
        <div style={{ padding: "12px 24px 4px", flexShrink: 0 }}>
          <div
            style={{
              color: "#333",
              fontSize: 11,
              letterSpacing: 2,
              fontFamily: "'Noto Sans JP', sans-serif",
            }}
          >
            ━━ 皿が流れています。気に入ったら取ってください ━━
          </div>
        </div>

        {/* Conveyor Belt */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filteredPosts.length === 0 ? (
            <div
              style={{
                padding: 60,
                textAlign: "center",
                color: "#333",
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: 13,
              }}
            >
              {activeTab === "collection"
                ? "まだ皿を取っていません。気に入った投稿を取ってみてください！"
                : "このルームにはまだ投稿がありません。最初の皿を出しましょう！"}
            </div>
          ) : (
            <>
              <ConveyorBelt
                posts={filteredPosts}
                stockedIds={stockedIds}
                onStock={handleStock}
                onOpenComments={handleOpenComments}
              />
              {/* Plate grid below */}
              <div style={{ padding: "24px", borderTop: "1px solid #1a1a2a" }}>
                <div
                  style={{
                    color: "#333",
                    fontSize: 11,
                    letterSpacing: 2,
                    fontFamily: "'Noto Sans JP', sans-serif",
                    marginBottom: 16,
                  }}
                >
                  ━━ 全ての皿 ━━
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: 12,
                  }}
                >
                  {filteredPosts.map((post) => (
                    <PlateCard
                      key={post.id}
                      post={post}
                      isStocked={stockedIds.has(post.id)}
                      onStock={handleStock}
                      onOpenComments={handleOpenComments}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {commentPost && (
        <CommentModal
          post={commentPost}
          canComment={stockedIds.has(commentPost.id)}
          onClose={() => setCommentPost(null)}
        />
      )}
      {showPost && (
        <PostModal
          currentRoom={selected?.room}
          onClose={() => setShowPost(false)}
          onPost={handlePost}
        />
      )}
    </div>
  );
}
