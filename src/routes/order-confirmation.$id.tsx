import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { SiteLayout, btnOutline, btnPrimary } from "@/components/store/SiteLayout";
import { DemoNotice, OrderDetails } from "@/components/store/OrderDetails";
import { useOrders } from "@/lib/db";
import { useHydrated } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/order-confirmation/$id")({
  head: () => seo("Order confirmed", "Your demo order confirmation.", { robots: "noindex" }),
  component: Confirmation,
});

function Confirmation() {
  const { id } = Route.useParams();
  const order = useOrders().find((o) => o.id === id);
  const hydrated = useHydrated();
  if (!hydrated)
    return (
      <SiteLayout>
        <div className="py-24" />
      </SiteLayout>
    );
  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-12">
        {!order ? (
          <div className="py-16 text-center">
            <h1 className="font-display text-4xl">Order not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Orders are stored on the device they were placed on.
            </p>
            <Link to="/orders" className={`${btnPrimary} mt-6`}>
              View my orders
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <CheckCircle2 className="mx-auto h-16 w-16 text-gold" />
              <h1 className="mt-4 font-display text-4xl md:text-5xl">
                Thank you, {order.customer.name.split(" ")[0]}!
              </h1>
              <p className="mt-2 text-muted-foreground">Your demo order has been placed.</p>
            </div>
            <div className="space-y-6">
              <DemoNotice />
              <OrderDetails order={order} />
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/shop" className={btnPrimary}>
                  Continue shopping
                </Link>
                <Link to="/orders" className={btnOutline}>
                  View order history
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </SiteLayout>
  );
}
