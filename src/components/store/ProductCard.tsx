import { Heart, Eye, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { formatPrice, type Product, categories } from "@/lib/products";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ProductCard({ product, onOpen }: { product: Product; onOpen: (p: Product) => void }) {
  const { add, toggleWish, wishlist } = useStore();
  const wished = wishlist.includes(product.id);
  const cat = categories.find((c) => c.id === product.category)?.name;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <span className="absolute top-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
          Demo item
        </span>
        <button
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => {
            toggleWish(product.id);
            toast(wished ? "Removed from wishlist" : "Saved to wishlist", { description: product.name });
          }}
          className="absolute top-3 right-3 rounded-full bg-background/90 p-2 transition-colors hover:bg-background"
        >
          <Heart className={cn("h-4 w-4", wished ? "fill-gold text-gold" : "text-foreground")} />
        </button>
        <button
          onClick={() => onOpen(product)}
          className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-center gap-2 rounded-lg bg-background/95 py-2 text-xs font-medium opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 focus:opacity-100"
        >
          <Eye className="h-4 w-4" /> Quick view
        </button>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] tracking-widest text-gold uppercase">{cat}</p>
        <button onClick={() => onOpen(product)} className="mt-1 text-left font-display text-lg leading-tight hover:text-gold">
          {product.name}
        </button>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="font-semibold">{formatPrice(product.price)}</span>
          <button
            onClick={() => {
              add(product.id);
              toast.success("Added to cart", { description: product.name });
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-gold hover:text-gold-foreground"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>
    </article>
  );
}
