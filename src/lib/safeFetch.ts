import { isOnline } from './network';

export type SafeFetchResult<T = unknown> = {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
  offline?: boolean;
  timeout?: boolean;
};

const DEFAULT_TIMEOUT = 8000;

export const safeFetch = async <T = unknown>(
  url: string,
  init: RequestInit = {},
  options: { timeoutMs?: number; skipOnlineCheck?: boolean; parse?: 'json' | 'text' | 'none' } = {}
): Promise<SafeFetchResult<T>> => {
  const { timeoutMs = DEFAULT_TIMEOUT, skipOnlineCheck = false, parse = 'json' } = options;

  if (!skipOnlineCheck && !(await isOnline())) {
    return { ok: false, status: 0, data: null, offline: true, error: 'offline' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    clearTimeout(timer);

    let data: any = null;
    if (parse === 'json') {
      try {
        data = await res.json();
      } catch {
        data = null;
      }
    } else if (parse === 'text') {
      try {
        data = await res.text();
      } catch {
        data = null;
      }
    }

    return { ok: res.ok, status: res.status, data: data as T };
  } catch (err: any) {
    clearTimeout(timer);
    const aborted = err?.name === 'AbortError';
    return {
      ok: false,
      status: 0,
      data: null,
      timeout: aborted,
      error: aborted ? 'timeout' : err?.message || 'network_error',
    };
  }
};
