import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, btnPrimary } from "@/components/store/SiteLayout";
import { DemoNotice, OrderDetails } from "@/components/store/OrderDetails";
import { customerDb, useOrders } from "@/lib/db";
import { useHydrated } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/orders/$id")({
  head: () => seo("Order details", "Details of your order.", { robots: "noindex" }),
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  const hydrated = useHydrated();
  const orders = useOrders();
  const me = hydrated ? customerDb.get() : null;
  const order = orders.find((o) => o.id === id && me && (o.customer.email === me.email || o.customer.mobile === me.mobile));
  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Link to="/orders" className="text-sm text-gold underline underline-offset-4">← All orders</Link>
        {!hydrated ? null : !order ? (
          <div className="py-16 text-center">
            <h1 className="font-display text-3xl">Order not found</h1>
            <Link to="/orders" className={`${btnPrimary} mt-6`}>Back to orders</Link>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <h1 className="font-display text-4xl">Order details</h1>
            <DemoNotice />
            <OrderDetails order={order} />
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
