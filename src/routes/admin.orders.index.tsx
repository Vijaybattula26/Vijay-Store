import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AdminTitle, Card } from "@/components/admin/ui";
import { StatusBadge, fmtDate } from "@/components/store/OrderDetails";
import { inputCls } from "@/components/store/SiteLayout";
import { ORDER_STATUSES } from "@/lib/commerce";
import { useOrders } from "@/lib/db";
import { formatPrice } from "@/lib/products";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/orders/")({
  component: Orders,
});

function Orders() {
  const orders = useOrders();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const term = q.toLowerCase().trim();
  const list = orders.filter(
    (o) =>
      (!status || o.status === status) &&
      (!term ||
        [o.id, o.customer.name, o.customer.email, o.customer.mobile].some((v) =>
          v.toLowerCase().includes(term),
        )),
  );
  return (
    <>
      <AdminTitle title="Orders" />
      <Card className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by order ID, name, email or mobile"
          aria-label="Search orders"
          className={inputCls}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
          className={cn(inputCls, "sm:w-52")}
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </Card>
      {list.length === 0 ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            {orders.length
              ? "No orders match."
              : "No demo orders yet. Place one from the store to see it here."}
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-secondary text-left text-xs text-muted-foreground uppercase">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Date</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((o) => (
                <tr key={o.id} className="hover:bg-secondary/50">
                  <td className="p-3">
                    <Link
                      to="/admin/orders/$id"
                      params={{ id: o.id }}
                      className="font-mono text-xs text-gold underline"
                    >
                      {o.id}
                    </Link>
                  </td>
                  <td className="p-3">
                    {o.customer.name}
                    <span className="block text-xs text-muted-foreground">{o.customer.mobile}</span>
                  </td>
                  <td className="p-3 text-xs">{fmtDate(o.createdAt)}</td>
                  <td className="p-3 font-medium">{formatPrice(o.total)}</td>
                  <td className="p-3">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
