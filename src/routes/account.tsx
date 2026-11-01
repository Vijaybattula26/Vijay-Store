import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Package, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SiteLayout, btnPrimary, inputCls } from "@/components/store/SiteLayout";
import { customerDb } from "@/lib/db";
import { isEmail, isIndianMobile } from "@/lib/commerce";
import { useHydrated, useMyOrders, useStore } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/account")({
  head: () => seo("My account", "Your profile, orders, wishlist and saved cart.", { robots: "noindex" }),
  component: Account,
});

function Account() {
  const hydrated = useHydrated();
  const { count, wishlist } = useStore();
  const orders = useMyOrders();
  const [f, setF] = useState({ name: "", mobile: "", email: "" });
  const c = customerDb.use();
  useEffect(() => {
    if (c) setF(c);
  }, [c]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (f.name.trim().length < 2 || !isIndianMobile(f.mobile) || !isEmail(f.email)) {
      toast.error("Please enter a valid name, 10-digit mobile number and email");
      return;
    }
    customerDb.set(() => ({ name: f.name.trim(), mobile: f.mobile.trim(), email: f.email.trim() }));
    toast.success("Profile saved on this device");
  };

  const last = orders[0];

  return (
    <SiteLayout>
      <PageHeader eyebrow="Account" title={hydrated && c ? `Hello, ${c.name.split(" ")[0]}` : "My account"}>
        <p className="mt-2 text-sm text-muted-foreground">Demo account — your details are stored only in this browser.</p>
      </PageHeader>
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 md:grid-cols-3">
        <Tile to="/orders" icon={<Package />} label="Orders" value={hydrated ? orders.length : 0} />
        <Tile to="/wishlist" icon={<Heart />} label="Wishlist" value={hydrated ? wishlist.length : 0} />
        <Tile to="/cart" icon={<ShoppingBag />} label="Saved cart" value={hydrated ? count : 0} />

        <form onSubmit={save} noValidate className="space-y-3 rounded-xl border border-border bg-card p-6 md:col-span-2">
          <h2 className="font-display text-2xl">Profile</h2>
          <input aria-label="Full name" placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={inputCls} />
          <input aria-label="Mobile number" type="tel" placeholder="Mobile number" value={f.mobile} onChange={(e) => setF({ ...f, mobile: e.target.value })} className={inputCls} />
          <input aria-label="Email" type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={inputCls} />
          <button className={btnPrimary}>Save profile</button>
        </form>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl">Last delivery address</h2>
          {hydrated && last ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {last.address.house}, {last.address.street}
              <br />
              {last.address.city}, {last.address.state} – {last.address.pin}
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No address yet — it's saved when you place an order.</p>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}

function Tile({ to, icon, label, value }: { to: "/orders" | "/wishlist" | "/cart"; icon: React.ReactNode; label: string; value: number }) {
  return (
    <Link to={to} className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 hover:border-gold">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-gold [&_svg]:h-5 [&_svg]:w-5">{icon}</span>
      <span>
        <span className="block text-2xl font-semibold">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </span>
    </Link>
  );
}
