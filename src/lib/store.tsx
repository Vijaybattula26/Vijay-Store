import { useSyncExternalStore } from "react";
import { addToCart, lineKey, setLineQty, type CartLine } from "./commerce";
import { cartDb, findProduct, productsDb, recentDb, wishlistDb } from "./db";

/** Cart / wishlist / recently-viewed hook, persisted to localStorage via db.ts. */
export function useStore() {
  const cart = cartDb.use();
  const wishlist = wishlistDb.use();
  const recent = recentDb.use();
  const products = productsDb.use();

  const lines = cart
    .map((l) => ({ line: l, key: lineKey(l), product: findProduct(products, l.productId) }))
    .filter((x): x is { line: CartLine; key: string; product: NonNullable<typeof x.product> } => !!x.product);

  return {
    cart,
    lines,
    wishlist,
    recent,
    count: lines.reduce((s, l) => s + l.line.qty, 0),
    /** Returns an error message, or null on success. */
    add(line: CartLine): string | null {
      const p = findProduct(productsDb.get(), line.productId);
      if (!p) return "Product not found";
      const r = addToCart(cartDb.get(), line, p);
      if (!r.ok) return r.reason;
      cartDb.set(() => r.cart);
      return null;
    },
    setQty(key: string, qty: number) {
      const line = cartDb.get().find((l) => lineKey(l) === key);
      const p = line && findProduct(productsDb.get(), line.productId);
      cartDb.set((c) => setLineQty(c, key, qty, p?.stock ?? 0));
    },
    remove: (key: string) => cartDb.set((c) => c.filter((l) => lineKey(l) !== key)),
    clearCart: () => cartDb.set(() => []),
    toggleWish: (id: string) => wishlistDb.set((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id])),
    viewed: (id: string) => recentDb.set((r) => [id, ...r.filter((x) => x !== id)].slice(0, 8)),
  };
}

/** True after hydration — use to avoid SSR/localStorage mismatches in counts. */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
