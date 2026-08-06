import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export const FREE_DREAMS = 3;
export const PRICE = 299;

export interface DreamRecord {
  id: string;
  date: string;
  question: string;
  answer: string;
  mood: string;
  symbols: string[];
}

interface WalletState {
  used: number;
  left: number;
  hasAccess: boolean;
  history: DreamRecord[];
  activatedAt: string | null;
  spend: () => boolean;
  addDream: (dream: DreamRecord) => void;
  buyAccess: () => void;
  reset: () => void;
}

const STORAGE_KEY = 'morpheus-wallet-v1';

const WalletContext = createContext<WalletState | null>(null);

interface Persisted {
  used: number;
  hasAccess: boolean;
  history: DreamRecord[];
  activatedAt: string | null;
}

const readStorage = (): Persisted => {
  if (typeof window === 'undefined') {
    return { used: 0, hasAccess: false, history: [], activatedAt: null };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { used: 0, hasAccess: false, history: [], activatedAt: null };
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      used: typeof parsed.used === 'number' ? parsed.used : 0,
      hasAccess: Boolean(parsed.hasAccess),
      history: Array.isArray(parsed.history) ? parsed.history : [],
      activatedAt: typeof parsed.activatedAt === 'string' ? parsed.activatedAt : null,
    };
  } catch {
    return { used: 0, hasAccess: false, history: [], activatedAt: null };
  }
};

export const DreamWalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<Persisted>(() => readStorage());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* приватный режим — просто живём в памяти */
    }
  }, [state]);

  const left = Math.max(0, FREE_DREAMS - state.used);

  const spend = useCallback(() => {
    let allowed = false;
    setState((prev) => {
      if (prev.hasAccess) {
        allowed = true;
        return prev;
      }
      if (prev.used < FREE_DREAMS) {
        allowed = true;
        return { ...prev, used: prev.used + 1 };
      }
      allowed = false;
      return prev;
    });
    return allowed;
  }, []);

  const addDream = useCallback((dream: DreamRecord) => {
    setState((prev) => ({ ...prev, history: [dream, ...prev.history].slice(0, 40) }));
  }, []);

  const buyAccess = useCallback(() => {
    setState((prev) => ({
      ...prev,
      hasAccess: true,
      activatedAt: prev.activatedAt ?? new Date().toISOString(),
    }));
  }, []);

  const reset = useCallback(() => {
    setState({ used: 0, hasAccess: false, history: [], activatedAt: null });
  }, []);

  const value = useMemo<WalletState>(
    () => ({
      used: state.used,
      left,
      hasAccess: state.hasAccess,
      history: state.history,
      activatedAt: state.activatedAt,
      spend,
      addDream,
      buyAccess,
      reset,
    }),
    [state, left, spend, addDream, buyAccess, reset],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useDreamWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useDreamWallet должен вызываться внутри DreamWalletProvider');
  return ctx;
};

export const spendGuard = (allowed: boolean) => allowed;
