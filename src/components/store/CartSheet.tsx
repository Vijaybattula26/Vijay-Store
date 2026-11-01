import { Heart, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { cartTotals, formatPrice, getProduct, FREE_SHIPPING_THRESHOLD, type Product } from "@/lib/products";
import { useStore } from "@/lib/store";

export function CartSheet({
  open,
  onOpenChange,
  onCheckout,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCheckout: () => void;
}) {
  const { cart, setQty, remove } = useStore();
  const lines = Object.entries(cart)
    .map(([id, qty]) => ({ p: getProduct(id), qty }))
    .filter((l): l is { p: Product; qty: number } => !!l.p);
  const t = cartTotals(lines.map((l) => ({ price: l.p.price, qty: l.qty })));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">Your cart</SheetTitle>
          <SheetDescription>Demo cart — items are saved on this device.</SheetDescription>
        </SheetHeader>
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
              <ShoppingBag className="h-10 w-10 text-gold" />
            </div>
            <p className="mt-4 font-display text-xl">Your cart is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">Discover something you'll love.</p>
            <button
              onClick={() => {
                onOpenChange(false);
                document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="mt-6 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
            >
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-4 overflow-y-auto px-4">
              {lines.map(({ p, qty }) => (
                <li key={p.id} className="flex gap-3">
                  <img src={p.images[0]} alt={p.name} className="h-20 w-20 rounded-md object-cover" />
                  <div className="flex flex-1 flex-col">
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{formatPrice(p.price)} each</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-md border border-border">
                        <button aria-label="Decrease quantity" className="p-1.5" onClick={() => setQty(p.id, qty - 1)}>
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-xs">{qty}</span>
                        <button aria-label="Increase quantity" className="p-1.5" onClick={() => setQty(p.id, qty + 1)}>
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold">{formatPrice(p.price * qty)}</span>
                      <button aria-label="Remove item" onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-2 border-t border-border p-4 text-sm">
              <Row label="Subtotal" value={formatPrice(t.subtotal)} />
              <Row label="Delivery" value={t.shipping === 0 ? "Free" : formatPrice(t.shipping)} />
              {t.shipping > 0 && (
                <p className="text-xs text-muted-foreground">Add {formatPrice(FREE_SHIPPING_THRESHOLD - t.subtotal)} more for free delivery.</p>
              )}
              <Row label="Total" value={formatPrice(t.total)} bold />
              <button onClick={onCheckout} className="mt-2 w-full rounded-lg bg-primary py-3 font-medium text-primary-foreground hover:bg-gold hover:text-gold-foreground">
                Proceed to checkout
              </button>
              <button onClick={() => onOpenChange(false)} className="w-full py-2 text-xs text-muted-foreground underline">
                Continue shopping
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function WishlistSheet({
  open,
  onOpenChange,
  onOpen,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onOpen: (p: Product) => void;
}) {
  const { wishlist, toggleWish, add } = useStore();
  const items = wishlist.map(getProduct).filter((p): p is Product => !!p);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">Wishlist</SheetTitle>
          <SheetDescription>Your saved favourites.</SheetDescription>
        </SheetHeader>
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Heart className="h-12 w-12 text-gold" />
            <p className="mt-4 font-display text-xl">No favourites yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Tap the heart on any product to save it.</p>
          </div>
        ) : (
          <ul className="flex-1 space-y-4 overflow-y-auto px-4">
            {items.map((p) => (
              <li key={p.id} className="flex gap-3">
                <button onClick={() => onOpen(p)}>
                  <img src={p.images[0]} alt={p.name} className="h-20 w-20 rounded-md object-cover" />
                </button>
                <div className="flex flex-1 flex-col">
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(p.price)}</p>
                  <div className="mt-auto flex gap-3 text-xs">
                    <button onClick={() => add(p.id)} className="font-medium text-gold">Add to cart</button>
                    <button onClick={() => toggleWish(p.id)} className="text-muted-foreground">Remove</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-semibold" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
