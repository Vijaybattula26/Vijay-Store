import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminTitle, Card } from "@/components/admin/ui";
import { OrderDetails } from "@/components/store/OrderDetails";
import { ConfirmButton } from "@/components/store/ConfirmButton";
import { inputCls } from "@/components/store/SiteLayout";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/commerce";
import { updateOrderStatus, useOrders } from "@/lib/db";

export const Route = createFileRoute("/admin/orders/$id")({
  component: AdminOrder,
});

function AdminOrder() {
  const { id } = Route.useParams();
  const order = useOrders().find((o) => o.id === id);
  if (!order) return <p>Order not found. <Link to="/admin/orders" className="text-gold underline">Back</Link></p>;
  return (
    <>
      <Link to="/admin/orders" className="text-sm text-gold underline">← All orders</Link>
      <AdminTitle title="Order details" />
      <Card className="mb-6 flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium" htmlFor="status">Update status</label>
        <select
          id="status"
          value={order.status}
          onChange={(e) => {
            updateOrderStatus(order.id, e.target.value as OrderStatus);
            toast.success(`Status set to ${e.target.value}`);
          }}
          className={`${inputCls} w-56`}
        >
          {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        {order.status !== "Cancelled" && (
          <ConfirmButton
            title="Cancel this demo order?"
            description="Stock for these items will be returned to inventory."
            confirmLabel="Cancel order"
            onConfirm={() => {
              updateOrderStatus(order.id, "Cancelled");
              toast.success("Order cancelled");
            }}
            className="rounded-lg border border-destructive px-4 py-2 text-sm text-destructive"
          >
            Cancel order
          </ConfirmButton>
        )}
      </Card>
      <OrderDetails order={order} />
    </>
  );
}
