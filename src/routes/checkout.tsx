import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SiteLayout, EmptyState, btnPrimary, inputCls } from "@/components/store/SiteLayout";
import {
  INDIAN_STATES,
  makeOrderId,
  totals,
  validateCheckout,
  type CheckoutForm,
  type DeliveryOption,
  type Order,
} from "@/lib/commerce";
import { customerDb, placeOrder, productsDb, findProduct, useSettings } from "@/lib/db";
import { demoProvider } from "@/lib/payments";
import { formatPrice } from "@/lib/products";
import { useHydrated, useStore } from "@/lib/store";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => seo("Checkout", "Complete your demo order.", { robots: "noindex" }),
  component: Checkout,
});

const EMPTY: CheckoutForm = { name: "", mobile: "", email: "", house: "", street: "", landmark: "", city: "", state: "", pin: "" };

function Checkout() {
  const { lines, clearCart } = useStore();
  const settings = useSettings();
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const [f, setF] = useState<CheckoutForm>(EMPTY);
  const [delivery, setDelivery] = useState<DeliveryOption>("standard");
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);

  useEffect(() => {
    const c = customerDb.get();
    if (c) setF((x) => ({ ...x, ...c }));
  }, []);

  const t = totals(lines.map((l) => ({ price: l.product.price, qty: l.line.qty })), delivery, settings);
  const set = (k: keyof CheckoutForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setF({ ...f, [k]: e.target.value });
    if (errors[k]) setErrors({ ...errors, [k]: undefined });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current) return; // prevent duplicate submissions
    const errs = validateCheckout(f);
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error("Please correct the highlighted fields");
      document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
      return;
    }
    // Re-validate stock against latest data
    for (const l of lines) {
      const p = findProduct(productsDb.get(), l.product.id);
      const need = lines.filter((x) => x.product.id === l.product.id).reduce((s, x) => s + x.line.qty, 0);
      if (!p || p.stock < need) {
        toast.error(`${l.product.name}: only ${p?.stock ?? 0} in stock`, { description: "Please update your cart." });
        return;
      }
    }
    submitting.current = true;
    setBusy(true);
    const order: Order = {
      id: makeOrderId(),
      createdAt: new Date().toISOString(),
      customer: { name: f.name.trim(), mobile: f.mobile.trim(), email: f.email.trim() },
      address: { house: f.house.trim(), street: f.street.trim(), landmark: f.landmark.trim(), city: f.city.trim(), state: f.state, pin: f.pin.trim() },
      delivery,
      payment: "cod-demo",
      items: lines.map((l) => ({ productId: l.product.id, name: l.product.name, image: l.product.images[0] ?? "", price: l.product.price, qty: l.line.qty, size: l.line.size, color: l.line.color })),
      subtotal: t.subtotal,
      deliveryFee: t.delivery,
      discount: 0,
      total: t.total,
      status: "Confirmed (demo)",
      demo: true,
    };
    await demoProvider.pay({ customer: { ...order.customer, address: "" }, items: [], total: order.total });
    placeOrder(order);
    clearCart();
    void navigate({ to: "/order-confirmation/$id", params: { id: order.id } });
  };

  if (hydrated && lines.length === 0 && !busy) {
    return (
      <SiteLayout>
        <PageHeader title="Checkout" />
        <EmptyState icon={<ShoppingBag className="h-10 w-10" />} title="Your cart is empty" text="Add something to your cart before checking out." action={<Link to="/shop" className={btnPrimary}>Continue shopping</Link>} />
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHeader eyebrow="Secure demo checkout" title="Checkout" />
      <form noValidate onSubmit={submit} className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div role="note" className="rounded-xl border border-gold/50 bg-gold/10 p-4 text-sm">
            <strong>DEMO PAYMENT MODE.</strong> Orders are saved on this device only. No real payment is taken and nothing is sent to a merchant.
          </div>

          <Fieldset title="1. Customer information">
            <Field label="Full name" error={errors.name} className="sm:col-span-2"><input autoComplete="name" value={f.name} onChange={set("name")} aria-invalid={!!errors.name} className={inputCls} /></Field>
            <Field label="Mobile number" error={errors.mobile} hint="10 digits, e.g. 9876543210"><input type="tel" inputMode="numeric" autoComplete="tel" maxLength={14} value={f.mobile} onChange={set("mobile")} aria-invalid={!!errors.mobile} className={inputCls} /></Field>
            <Field label="Email address" error={errors.email}><input type="email" autoComplete="email" value={f.email} onChange={set("email")} aria-invalid={!!errors.email} className={inputCls} /></Field>
          </Fieldset>

          <Fieldset title="2. Delivery address">
            <Field label="House / Flat number" error={errors.house}><input autoComplete="address-line1" value={f.house} onChange={set("house")} aria-invalid={!!errors.house} className={inputCls} /></Field>
            <Field label="Street address" error={errors.street}><input autoComplete="address-line2" value={f.street} onChange={set("street")} aria-invalid={!!errors.street} className={inputCls} /></Field>
            <Field label="Landmark (optional)"><input value={f.landmark} onChange={set("landmark")} className={inputCls} /></Field>
            <Field label="City" error={errors.city}><input autoComplete="address-level2" value={f.city} onChange={set("city")} aria-invalid={!!errors.city} className={inputCls} /></Field>
            <Field label="State" error={errors.state}>
              <select value={f.state} onChange={set("state")} aria-invalid={!!errors.state} className={inputCls}>
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="PIN code" error={errors.pin}><input inputMode="numeric" autoComplete="postal-code" maxLength={6} value={f.pin} onChange={set("pin")} aria-invalid={!!errors.pin} className={inputCls} /></Field>
          </Fieldset>

          <Fieldset title="3. Delivery option">
            {([
              ["standard", "Standard delivery", t.subtotal >= settings.freeDeliveryThreshold ? "Free" : formatPrice(settings.standardFee), "Free over " + formatPrice(settings.freeDeliveryThreshold)],
              ["express", "Express delivery (demo)", formatPrice(settings.expressFee), "Faster dispatch — demo option"],
            ] as const).map(([id, label, price, note]) => (
              <label key={id} className={cn("flex cursor-pointer items-center gap-3 rounded-lg border p-4 sm:col-span-2", delivery === id ? "border-gold bg-gold/5" : "border-border")}>
                <input type="radio" name="delivery" checked={delivery === id} onChange={() => setDelivery(id)} className="accent-primary" />
                <span className="flex-1"><span className="block text-sm font-medium">{label}</span><span className="text-xs text-muted-foreground">{note}</span></span>
                <span className="text-sm font-medium">{price}</span>
              </label>
            ))}
          </Fieldset>

          <Fieldset title="4. Payment">
            <label className="flex items-center gap-3 rounded-lg border border-gold bg-gold/5 p-4 sm:col-span-2">
              <input type="radio" checked readOnly className="accent-primary" />
              <span className="flex-1"><span className="block text-sm font-medium">Cash on Delivery (demo)</span><span className="text-xs text-muted-foreground">Online payments (Razorpay / Cashfree) are not connected yet.</span></span>
            </label>
          </Fieldset>
        </div>

        <aside className="h-fit space-y-4 rounded-xl border border-border bg-card p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-2xl">Order summary</h2>
          <ul className="max-h-72 space-y-3 overflow-y-auto">
            {lines.map(({ key, line, product: p }) => (
              <li key={key} className="flex gap-3 text-sm">
                <img src={p.images[0]} alt={p.name} className="h-14 w-14 rounded-md object-cover" />
                <div className="flex-1">
                  <p className="font-medium leading-tight">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{[line.size, line.color].filter(Boolean).join(" · ")} {formatPrice(p.price)} × {line.qty}</p>
                </div>
                <span>{formatPrice(p.price * line.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-1 border-t border-border pt-3 text-sm">
            <div className="flex justify-between"><span>Subtotal ({t.items} items)</span><span>{formatPrice(t.subtotal)}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span>{t.delivery === 0 ? "Free" : formatPrice(t.delivery)}</span></div>
            <div className="flex justify-between pt-2 text-base font-semibold"><span>Total</span><span>{formatPrice(t.total)}</span></div>
          </div>
          <button type="submit" disabled={busy} className={cn(btnPrimary, "w-full py-4")}>
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Placing demo order…</> : `Place demo order · ${formatPrice(t.total)}`}
          </button>
          <p className="text-center text-[11px] text-muted-foreground">No payment will be collected.</p>
        </aside>
      </form>
    </SiteLayout>
  );
}

function Fieldset({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-xl border border-border bg-card p-5">
      <legend className="px-1 font-display text-xl">{title}</legend>
      <div className="mt-2 grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({ label, error, hint, className, children }: { label: string; error?: string | undefined; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={cn("block text-sm", className)}>
      <span className="mb-1 block font-medium">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-destructive">{error}</span> : hint ? <span className="mt-1 block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}
