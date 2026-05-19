export const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

const TOKEN_KEY = "anisushi_token";
const USER_ID_KEY = "anisushi_user_id";

// 初回起動時に /auth/anonymous を1度だけ叩くためのレースガード
let tokenPromise: Promise<{ token: string; user_id: string }> | null = null;

/**
 * 認証トークンを取得する。
 * - localStorage にあれば即返す
 * - 無ければ /auth/anonymous を呼んで発行し、永続化する
 * - 並行呼び出しは Promise を共有して二重発行を防ぐ
 */
export async function ensureAuth(): Promise<{ token: string; user_id: string }> {
  const storedToken = localStorage.getItem(TOKEN_KEY);
  const storedUserId = localStorage.getItem(USER_ID_KEY);
  if (storedToken && storedUserId) {
    return { token: storedToken, user_id: storedUserId };
  }

  if (!tokenPromise) {
    tokenPromise = fetch(`${API_BASE}/auth/anonymous`, { method: "POST" })
      .then((r) => {
        if (!r.ok) throw new Error(`auth failed: ${r.status}`);
        return r.json();
      })
      .then((data: { token: string; user_id: string }) => {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_ID_KEY, data.user_id);
        return data;
      })
      .catch((e) => {
        tokenPromise = null; // 失敗時はリトライ可能にする
        throw e;
      });
  }
  return tokenPromise;
}

/**
 * fetch のラッパー。Authorization ヘッダを自動で付与する。
 * 401 が返った場合はトークンを破棄して1回だけリトライ（古い JWT が無効化されたケースをカバー）。
 */
export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const { token } = await ensureAuth();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(input, { ...init, headers });
  if (res.status !== 401) return res;

  // 401: トークン期限切れや署名変更の可能性 → 再発行して1回だけリトライ
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
  tokenPromise = null;
  const { token: newToken } = await ensureAuth();
  const retryHeaders = new Headers(init.headers);
  retryHeaders.set("Authorization", `Bearer ${newToken}`);
  return fetch(input, { ...init, headers: retryHeaders });
}

/**
 * 現在ログイン中の user_id を同期的に取得する。
 * UI 側で「自分の投稿か？」を判定するために使う。
 * ensureAuth() 完了前に呼ばれると null を返す可能性があるため、呼び出し元は null チェックすること。
 */
export function getStoredUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY);
}
