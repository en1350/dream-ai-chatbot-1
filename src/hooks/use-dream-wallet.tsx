import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import func2url from '../../backend/func2url.json';

export const FREE_DREAMS = 3;
export const PRICE = 299;
export const ACCESS_YEARS = 3;

const API_URL = func2url.api;

export interface DreamRecord {
  id: string;
  date: string;
  question: string;
  answer: string;
  mood: string;
  symbols: string[];
}

export interface DreamUser {
  user_id: number;
  email: string;
  token: string;
}

interface WalletState {
  user: DreamUser | null;
  used: number;
  left: number;
  hasAccess: boolean;
  accessUntil: string | null;
  history: DreamRecord[];
  authLoading: boolean;
  payLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
  spend: () => Promise<boolean>;
  syncAccess: (data: Record<string, unknown>) => void;
  addDream: (dream: DreamRecord) => void;
  buyAccess: () => Promise<{ error?: string }>;
  refresh: () => Promise<void>;
  reset: () => void;
}

const USER_KEY = 'sonnikai-user-v2';
const HISTORY_KEY = 'sonnikai-history-v2';
const GUEST_KEY = 'sonnikai-guest-used';

const WalletContext = createContext<WalletState | null>(null);

const readJSON = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const call = async (payload: Record<string, unknown>) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return { ok: res.ok, data } as { ok: boolean; data: Record<string, unknown> };
};

export const DreamWalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<DreamUser | null>(() => readJSON<DreamUser | null>(USER_KEY, null));
  const [used, setUsed] = useState(0);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessUntil, setAccessUntil] = useState<string | null>(null);
  const [history, setHistory] = useState<DreamRecord[]>(() => readJSON<DreamRecord[]>(HISTORY_KEY, []));
  const [authLoading, setAuthLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      /* приватный режим */
    }
  }, [history]);

  const applyAccess = useCallback((data: Record<string, unknown>) => {
    if (typeof data.free_used === 'number') setUsed(data.free_used);
    if (typeof data.has_access === 'boolean') setHasAccess(data.has_access);
    setAccessUntil(typeof data.access_until === 'string' ? data.access_until : null);
  }, []);

  const saveUser = useCallback((next: DreamUser | null) => {
    setUser(next);
    try {
      if (next) window.localStorage.setItem(USER_KEY, JSON.stringify(next));
      else window.localStorage.removeItem(USER_KEY);
    } catch {
      /* приватный режим */
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!user) return;
    const { ok, data } = await call({ action: 'check_payment', user_id: user.user_id });
    if (ok) applyAccess(data);
  }, [user, applyAccess]);

  useEffect(() => {
    if (!user) {
      setUsed(readJSON<number>(GUEST_KEY, 0));
      setHasAccess(false);
      setAccessUntil(null);
      return;
    }
    call({ action: 'status', user_id: user.user_id }).then(({ ok, data }) => {
      if (ok) applyAccess(data);
    });
  }, [user, applyAccess]);

  useEffect(() => {
    if (!user) return;
    if (new URLSearchParams(window.location.search).get('paid') !== '1') return;

    let cancelled = false;
    const check = async (attempt = 0) => {
      if (cancelled) return;
      const { ok, data } = await call({ action: 'check_payment', user_id: user.user_id });
      if (cancelled) return;
      if (ok) applyAccess(data);
      if (ok && data.has_access) {
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }
      if (attempt < 5) window.setTimeout(() => check(attempt + 1), 3000);
      else window.history.replaceState({}, '', window.location.pathname);
    };
    check();

    return () => {
      cancelled = true;
    };
  }, [user, applyAccess]);

  const auth = useCallback(
    async (action: 'login' | 'register', email: string, password: string) => {
      setAuthLoading(true);
      try {
        const { ok, data } = await call({ action, email, password });
        if (!ok) return { error: (data.error as string) || 'Не получилось, попробуйте ещё раз' };
        saveUser({
          user_id: data.user_id as number,
          email: data.email as string,
          token: data.token as string,
        });
        applyAccess(data);
        return {};
      } catch {
        return { error: 'Сервер не отвечает, попробуйте позже' };
      } finally {
        setAuthLoading(false);
      }
    },
    [saveUser, applyAccess],
  );

  const login = useCallback((e: string, p: string) => auth('login', e, p), [auth]);
  const register = useCallback((e: string, p: string) => auth('register', e, p), [auth]);

  const logout = useCallback(() => saveUser(null), [saveUser]);

  const spend = useCallback(async () => {
    if (!user) {
      const guestUsed = readJSON<number>(GUEST_KEY, 0);
      if (guestUsed >= FREE_DREAMS) return false;
      const next = guestUsed + 1;
      setUsed(next);
      try {
        window.localStorage.setItem(GUEST_KEY, JSON.stringify(next));
      } catch {
        /* приватный режим */
      }
      return true;
    }
    const { ok, data } = await call({ action: 'spend', user_id: user.user_id });
    if (!ok) return false;
    applyAccess(data);
    return Boolean(data.allowed);
  }, [user, applyAccess]);

  const addDream = useCallback((dream: DreamRecord) => {
    setHistory((prev) => [dream, ...prev].slice(0, 40));
  }, []);

  const buyAccess = useCallback(async () => {
    if (!user) return { error: 'Сначала войдите в кабинет' };
    setPayLoading(true);
    try {
      const { ok, data } = await call({
        action: 'create_payment',
        user_id: user.user_id,
        email: user.email,
        return_url: window.location.origin,
      });
      if (!ok || !data.confirmation_url) {
        return { error: (data.error as string) || 'Не удалось создать платёж' };
      }
      window.location.href = data.confirmation_url as string;
      return {};
    } catch {
      return { error: 'Платёжная система недоступна' };
    } finally {
      setPayLoading(false);
    }
  }, [user]);

  const reset = useCallback(() => setHistory([]), []);

  const left = Math.max(0, FREE_DREAMS - used);

  const value = useMemo<WalletState>(
    () => ({
      user,
      used,
      left,
      hasAccess,
      accessUntil,
      history,
      authLoading,
      payLoading,
      login,
      register,
      logout,
      spend,
      syncAccess: applyAccess,
      addDream,
      buyAccess,
      refresh,
      reset,
    }),
    [
      user,
      used,
      left,
      hasAccess,
      accessUntil,
      history,
      authLoading,
      payLoading,
      login,
      register,
      logout,
      spend,
      applyAccess,
      addDream,
      buyAccess,
      refresh,
      reset,
    ],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useDreamWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useDreamWallet должен вызываться внутри DreamWalletProvider');
  return ctx;
};