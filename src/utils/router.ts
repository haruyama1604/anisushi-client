import type { Category, Selected } from "../types";

// URLハッシュベースの軽量ルーター。
// react-router を導入せず、`#/...` を単一の Route 型と相互変換する。
// モーダル状態のうち「投稿モーダル」「設定モーダル」「箱セレクター」「箱作成中」は
// URL に乗せない（リロード時に勝手に編集中フォームが復活すると違和感があるため）。
//
// 対応する URL 形式:
//   #/                                           ホーム + 全体フィード
//   #/room/:catId/:subId/:room                   ホーム + ルームタブ（カテゴリ指定）
//   #/collection                                 コレクションページ
//   #/buckets/:id                                コレクション + 箱を開いている
//   #/posts/:id/comments                         コメントモーダル
//   #/buckets/:bid/posts/:pid/comments           箱→皿→コメント（パンくず復元）
export type Route =
  | { kind: "home"; tab: "feed" | "room"; selected?: Selected }
  | { kind: "collection" }
  | { kind: "bucket"; bucketId: number }
  | { kind: "post-comments"; postId: number; fromBucketId?: number };

export function parseHash(hash: string, categories: Category[]): Route {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const parts = raw.split("/").filter(Boolean).map(decodeURIComponent);

  if (parts.length === 0) return { kind: "home", tab: "feed" };

  if (parts[0] === "room" && parts.length === 4) {
    const cat = categories.find((c) => c.id === parts[1]);
    const sub = cat?.subs.find((s) => s.id === parts[2]);
    if (cat && sub && sub.rooms.includes(parts[3])) {
      return { kind: "home", tab: "room", selected: { cat, sub, room: parts[3] } };
    }
    return { kind: "home", tab: "feed" };
  }

  if (parts[0] === "collection" && parts.length === 1) {
    return { kind: "collection" };
  }

  if (parts[0] === "buckets" && parts.length === 2) {
    const id = Number(parts[1]);
    if (Number.isFinite(id)) return { kind: "bucket", bucketId: id };
  }

  if (parts[0] === "buckets" && parts.length === 5 && parts[2] === "posts" && parts[4] === "comments") {
    const bid = Number(parts[1]);
    const pid = Number(parts[3]);
    if (Number.isFinite(bid) && Number.isFinite(pid)) {
      return { kind: "post-comments", postId: pid, fromBucketId: bid };
    }
  }

  if (parts[0] === "posts" && parts.length === 3 && parts[2] === "comments") {
    const id = Number(parts[1]);
    if (Number.isFinite(id)) return { kind: "post-comments", postId: id };
  }

  return { kind: "home", tab: "feed" };
}

export function routeToHash(route: Route): string {
  switch (route.kind) {
    case "home":
      if (route.tab === "room" && route.selected) {
        const s = route.selected;
        return `#/room/${encodeURIComponent(s.cat.id)}/${encodeURIComponent(s.sub.id)}/${encodeURIComponent(s.room)}`;
      }
      return "#/";
    case "collection":
      return "#/collection";
    case "bucket":
      return `#/buckets/${route.bucketId}`;
    case "post-comments":
      if (route.fromBucketId !== undefined) {
        return `#/buckets/${route.fromBucketId}/posts/${route.postId}/comments`;
      }
      return `#/posts/${route.postId}/comments`;
  }
}
