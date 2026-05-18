export const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

export function getOrCreateUserId(): string {
  const stored = localStorage.getItem("anisushi_user_id");
  if (stored) return stored;
  const id = crypto.randomUUID();
  localStorage.setItem("anisushi_user_id", id);
  return id;
}
