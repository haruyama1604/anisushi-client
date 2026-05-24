import { useEffect, useState } from "react";

// useState とほぼ同じインターフェースで、値を localStorage に自動で永続化する hook。
// - 初回マウント時：localStorage に値があればそれを使い、無ければ defaultValue
// - setState 時：localStorage に JSON シリアライズして書き込む
// - JSON パース失敗・書き込み失敗時はサイレントに defaultValue / ignore（quota 超過などで落ちないため）
export function usePersistentState<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // quota 超過や private mode などで失敗するケースは無視
    }
  }, [key, value]);

  return [value, setValue];
}
