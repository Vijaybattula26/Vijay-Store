import { useEffect, useState } from "react";
import { Heart, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { categories, formatPrice, products, type Product } from "@/lib/products";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ProductDialog({
  product,
  onClose,
  onOpen,
}: {
  product: Product | null;
  onClose: () => void;
  onOpen: (p: Product) => void;
}) {
  const { add, toggleWish, wishlist, viewed } = useStore();
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (product) {
      setImg(0);
      setQty(1);
      viewed(product.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  if (!product) return null;
  const wished = wishlist.includes(product.id);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto p-0">
        <div className="grid gap-0 md:grid-cols-2">
          <div className="p-4">
            <div
              className="relative aspect-square cursor-zoom-in overflow-hidden rounded-lg bg-muted"
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
              }}
              onMouseLeave={() => setZoom(null)}
            >
              <img
                src={product.images[img]}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-200"
                style={zoom ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
              />
            </div>
            <div className="mt-3 flex gap-2">
              {product.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setImg(i)}
                  aria-label={`Image ${i + 1}`}
                  className={cn("h-16 w-16 overflow-hidden rounded-md border-2", i === img ? "border-gold" : "border-transparent")}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col p-6">
            <p className="text-xs tracking-widest text-gold uppercase">
              {categories.find((c) => c.id === product.category)?.name} · Demo inventory
            </p>
            <DialogTitle className="mt-2 font-display text-3xl">{product.name}</DialogTitle>
            <p className="mt-2 text-2xl font-semibold">{formatPrice(product.price)}</p>
            <DialogDescription className="mt-4 text-sm text-muted-foreground">{product.description}</DialogDescription>
            <p className="mt-3 text-xs text-muted-foreground">
              [Material, size & care details placeholder] · Sample price for demonstration.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center rounded-lg border border-border">
                <button aria-label="Decrease" className="p-2.5" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm">{qty}</span>
                <button aria-label="Increase" className="p-2.5" onClick={() => setQty((q) => Math.min(10, q + 1))}>
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => {
                  add(product.id, qty);
                  toast.success(`Added ${qty} to cart`, { description: product.name });
                }}
                className="flex-1 rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-gold hover:text-gold-foreground"
              >
                Add to cart
              </button>
              <button
                aria-label="Toggle wishlist"
                onClick={() => toggleWish(product.id)}
                className="rounded-lg border border-border p-3"
              >
                <Heart className={cn("h-4 w-4", wished && "fill-gold text-gold")} />
              </button>
            </div>
            {related.length > 0 && (
              <div className="mt-8">
                <h4 className="mb-3 font-display text-lg">Related products</h4>
                <div className="grid grid-cols-4 gap-2">
                  {related.map((r) => (
                    <button key={r.id} onClick={() => onOpen(r)} className="text-left">
                      <img src={r.images[0]} alt={r.name} className="aspect-square w-full rounded-md object-cover" />
                      <p className="mt-1 line-clamp-1 text-[11px]">{r.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
