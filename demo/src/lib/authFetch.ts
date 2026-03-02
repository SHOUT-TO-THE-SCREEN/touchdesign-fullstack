import { useAuthStore } from "../store/authStore";

/** Authorization 헤더를 자동으로 붙여주는 fetch 래퍼 */
export function authFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = useAuthStore.getState().token;
  return fetch(url, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
