import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { PageHeader, SiteLayout, EmptyState, btnPrimary } from "@/components/store/SiteLayout";
import { StatusBadge, fmtDate } from "@/components/store/OrderDetails";
import { customerDb, useOrders } from "@/lib/db";
import { formatPrice } from "@/lib/products";
import { useHydrated } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/orders")({
  head: () => seo("My orders", "Your order history at THE VIJAY STORE.", { robots: "noindex" }),
  component: OrdersLayout,
});

function OrdersLayout() {
  const matchRoute = useMatchRoute();
  if (matchRoute({ to: "/orders/$id" })) return <Outlet />;
  return <OrdersList />;
}

/** Orders placed on this device by the current customer (matched by email/mobile). */
export function useMyOrders() {
  const orders = useOrders();
  const hydrated = useHydrated();
  const me = hydrated ? customerDb.get() : null;
  if (!me) return [];
  return orders.filter((o) => o.customer.email === me.email || o.customer.mobile === me.mobile);
}

function OrdersList() {
  const hydrated = useHydrated();
  const orders = useMyOrders();
  return (
    <SiteLayout>
      <PageHeader eyebrow="Account" title="Order history" />
      <div className="mx-auto max-w-4xl px-4 py-8">
        {!hydrated ? null : orders.length === 0 ? (
          <EmptyState icon={<Package className="h-10 w-10" />} title="No orders yet" text="Orders you place on this device will appear here." action={<Link to="/shop" className={btnPrimary}>Start shopping</Link>} />
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => (
              <li key={o.id}>
                <Link to="/orders/$id" params={{ id: o.id }} className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-gold">
                  <div className="flex -space-x-3">
                    {o.items.slice(0, 3).map((i, k) => (
                      <img key={k} src={i.image} alt="" className="h-12 w-12 rounded-full border-2 border-card object-cover" />
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm">{o.id}</p>
                    <p className="text-xs text-muted-foreground">{fmtDate(o.createdAt)} · {o.items.reduce((s, i) => s + i.qty, 0)} items</p>
                  </div>
                  <StatusBadge status={o.status} />
                  <span className="font-semibold">{formatPrice(o.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SiteLayout>
  );
}
