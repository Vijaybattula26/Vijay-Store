import { Link } from "@tanstack/react-router";
import type { Order } from "@/lib/commerce";
import { formatPrice } from "@/lib/products";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: Order["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium",
        status === "Cancelled" ? "bg-destructive/10 text-destructive" : status === "Delivered" ? "bg-primary text-primary-foreground" : "bg-gold/15 text-gold",
      )}
    >
      {status}
    </span>
  );
}

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

export function OrderDetails({ order }: { order: Order }) {
  const a = order.address;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Info title="Order reference"><p className="font-mono text-sm">{order.id}</p><p className="text-xs text-muted-foreground">{fmtDate(order.createdAt)}</p></Info>
        <Info title="Status"><StatusBadge status={order.status} /></Info>
        <Info title="Payment"><p className="text-sm">Cash on Delivery (demo)</p><p className="text-xs text-muted-foreground">{order.delivery === "express" ? "Express" : "Standard"} delivery</p></Info>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Info title="Customer">
          <p className="text-sm">{order.customer.name}</p>
          <p className="text-xs text-muted-foreground">{order.customer.mobile} · {order.customer.email}</p>
        </Info>
        <Info title="Delivery address">
          <p className="text-sm">{a.house}, {a.street}{a.landmark ? `, near ${a.landmark}` : ""}</p>
          <p className="text-xs text-muted-foreground">{a.city}, {a.state} – {a.pin}</p>
        </Info>
      </div>
      <div className="rounded-xl border border-border bg-card">
        <ul className="divide-y divide-border">
          {order.items.map((i, idx) => (
            <li key={idx} className="flex items-center gap-4 p-4">
              <img src={i.image} alt={i.name} className="h-16 w-16 rounded-lg object-cover" />
              <div className="flex-1">
                <Link to="/product/$id" params={{ id: i.productId }} className="font-medium hover:text-gold">{i.name}</Link>
                <p className="text-xs text-muted-foreground">
                  {[i.size && `Size ${i.size}`, i.color].filter(Boolean).join(" · ")} {formatPrice(i.price)} × {i.qty}
                </p>
              </div>
              <span className="font-semibold">{formatPrice(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-1 border-t border-border p-4 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>{order.deliveryFee ? formatPrice(order.deliveryFee) : "Free"}</span></div>
          <div className="flex justify-between text-base font-semibold"><span>Total</span><span>{formatPrice(order.total)}</span></div>
        </div>
      </div>
    </div>
  );
}

function Info({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-1 text-[11px] tracking-widest text-gold uppercase">{title}</p>
      {children}
    </div>
  );
}

export function DemoNotice() {
  return (
    <div role="note" className="rounded-xl border border-gold/50 bg-gold/10 p-4 text-sm">
      <strong>Demo order.</strong> This order is a demonstration only. It has not been sent to a real merchant or payment provider, and no money has been charged.
    </div>
  );
}
