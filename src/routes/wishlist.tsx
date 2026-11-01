import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SiteLayout, EmptyState, btnPrimary } from "@/components/store/SiteLayout";
import { findProduct, useProducts } from "@/lib/db";
import { formatPrice, type Product } from "@/lib/products";
import { useHydrated, useStore } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/wishlist")({
  head: () => seo("Wishlist", "Your saved favourites at THE VIJAY STORE.", { robots: "noindex" }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist, toggleWish, add } = useStore();
  const products = useProducts();
  const hydrated = useHydrated();
  const items = wishlist.map((id) => findProduct(products, id)).filter((p): p is Product => !!p && p.active);

  return (
    <SiteLayout>
      <PageHeader eyebrow="Saved" title={`Wishlist${hydrated && items.length ? ` (${items.length})` : ""}`} />
      <div className="mx-auto max-w-7xl px-4 py-8">
        {!hydrated ? null : items.length === 0 ? (
          <EmptyState icon={<Heart className="h-10 w-10" />} title="No favourites yet" text="Tap the heart on any product to save it here." action={<Link to="/shop" className={btnPrimary}>Discover products</Link>} />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => {
              const needsChoice = p.sizes.length > 0 || p.colors.length > 0;
              return (
                <li key={p.id} className="flex gap-4 rounded-xl border border-border bg-card p-4">
                  <Link to="/product/$id" params={{ id: p.id }}>
                    <img src={p.images[0]} alt={p.name} className="h-24 w-24 rounded-lg object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <Link to="/product/$id" params={{ id: p.id }} className="font-display text-lg leading-tight hover:text-gold">{p.name}</Link>
                    <p className="text-sm text-muted-foreground">{formatPrice(p.price)}</p>
                    {p.stock === 0 && <p className="text-xs text-destructive">Out of stock</p>}
                    <div className="mt-auto flex gap-4 pt-2 text-sm">
                      {needsChoice ? (
                        <Link to="/product/$id" params={{ id: p.id }} className="font-medium text-gold">Choose options</Link>
                      ) : (
                        <button
                          disabled={p.stock === 0}
                          className="font-medium text-gold disabled:opacity-40"
                          onClick={() => {
                            const err = add({ productId: p.id, qty: 1 });
                            if (err) { toast.error(err); return; }
                            toggleWish(p.id);
                            toast.success("Moved to cart", { description: p.name });
                          }}
                        >
                          Move to cart
                        </button>
                      )}
                      <button onClick={() => toggleWish(p.id)} className="text-muted-foreground hover:text-destructive">Remove</button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </SiteLayout>
  );
}
