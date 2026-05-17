export const API_BASE = "https://sushi-sns-api-v2-production.up.railway.app";

export function getOrCreateUserId(): string {
  const stored = localStorage.getItem("anisushi_user_id");
  if (stored) return stored;
  const id = crypto.randomUUID();
  localStorage.setItem("anisushi_user_id", id);
  return id;
}
