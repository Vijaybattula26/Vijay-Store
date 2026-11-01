import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type CartMap = Record<string, number>;

interface StoreCtx {
  cart: CartMap;
  wishlist: string[];
  recent: string[];
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clearCart: () => void;
  toggleWish: (id: string) => void;
  viewed: (id: string) => void;
  count: number;
}

const Ctx = createContext<StoreCtx | null>(null);
const KEY = "vijay-store-v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartMap>({});
  const [wishlist, setWish] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || "{}");
      setCart(s.cart || {});
      setWish(s.wishlist || []);
      setRecent(s.recent || []);
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify({ cart, wishlist, recent }));
  }, [cart, wishlist, recent, loaded]);

  const value: StoreCtx = {
    cart,
    wishlist,
    recent,
    add: (id, qty = 1) => setCart((c) => ({ ...c, [id]: Math.min(10, (c[id] || 0) + qty) })),
    setQty: (id, qty) =>
      setCart((c) => {
        const n = { ...c };
        if (qty <= 0) delete n[id];
        else n[id] = Math.min(10, qty);
        return n;
      }),
    remove: (id) =>
      setCart((c) => {
        const n = { ...c };
        delete n[id];
        return n;
      }),
    clearCart: () => setCart({}),
    toggleWish: (id) => setWish((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id])),
    viewed: (id) => setRecent((r) => [id, ...r.filter((x) => x !== id)].slice(0, 8)),
    count: Object.values(cart).reduce((a, b) => a + b, 0),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be inside StoreProvider");
  return c;
}
