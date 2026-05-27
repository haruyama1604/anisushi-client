export type Room = string;
export type Sub = { id: string; label: string; icon: string; rooms: Room[] };
export type Category = { id: string; label: string; icon: string; subs: Sub[] };
export type Tier = "normal" | "silver" | "gold";

export type Post = {
  id: number;
  content: string;
  likes: number;
  user_id: string;
  room: string;
  created_at: string;
  tier: Tier;
  spoiler: number;
};

export type Comment = {
  id: number;
  text: string;
  user_id: string;
  likes: number;
  created_at: string;
  liked_by_user: boolean;
  replies: Reply[];
};

export type Reply = {
  id: number;
  comment_id: number;
  text: string;
  user_id: string;
  created_at: string;
};

export type Bucket = {
  id: number;
  name: string;
  user_id: string;
  created_at: string;
};

export type Selected = { cat: Category; sub: Sub; room: string };
export type NavPage = "home" | "collection" | "settings";
export type TierConfig = { bg: string; border: string; glow: string; label: string; cardBg: string };
