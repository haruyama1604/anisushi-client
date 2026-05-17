import type { Category, Tier, TierConfig } from "../types";

export const CATEGORIES: Category[] = [
  {
    id: "anime",
    label: "アニメ",
    icon: "📺",
    subs: [
      { id: "chainsaw", label: "チェンソーマン", icon: "🪚", rooms: ["キャラ考察", "デンジ×パワー", "藤本タツキ論", "名シーン保管庫", "アニメvs原作"] },
      { id: "gundam",   label: "ガンダム",       icon: "🤖", rooms: ["シャア考察", "MS設定談義", "一年戦争", "Gレコ再評価", "富野監督語り場"] },
      { id: "oshi",     label: "推しの子",       icon: "⭐", rooms: ["アイ伝説", "ルビー応援", "メタ構造考察", "芸能界リアル談", "最終回予測"] },
    ],
  },
];

export const TIER_CONFIG: Record<Tier, TierConfig> = {
  gold:   { bg: "#f39c12", border: "#f1c40f", glow: "#f1c40f", label: "✨ 金皿", cardBg: "rgba(243,156,18,0.08)" },
  silver: { bg: "#95a5a6", border: "#bdc3c7", glow: "#bdc3c7", label: "🥢 銀皿", cardBg: "rgba(149,165,166,0.06)" },
  normal: { bg: "#c0392b", border: "#e74c3c", glow: "#e74c3c", label: "🥢 赤皿", cardBg: "rgba(192,57,43,0.05)" },
};
