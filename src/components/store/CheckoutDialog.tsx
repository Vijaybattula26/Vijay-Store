import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cartTotals, formatPrice, getProduct, type Product } from "@/lib/products";
import { demoProvider } from "@/lib/payments";
import { useStore } from "@/lib/store";

const empty = { name: "", mobile: "", email: "", address: "" };

export function validateCheckout(f: typeof empty) {
  const e: Partial<Record<keyof typeof empty, string>> = {};
  if (f.name.trim().length < 2) e.name = "Please enter your full name";
  if (!/^[6-9]\d{9}$/.test(f.mobile.trim())) e.mobile = "Enter a valid 10-digit mobile number";
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = "Enter a valid email address";
  if (f.address.trim().length < 10) e.address = "Please enter your full delivery address";
  return e;
}

export function CheckoutDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { cart, clearCart } = useStore();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<ReturnType<typeof validateCheckout>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const lines = Object.entries(cart)
    .map(([id, qty]) => ({ p: getProduct(id), qty }))
    .filter((l): l is { p: Product; qty: number } => !!l.p);
  const t = cartTotals(lines.map((l) => ({ price: l.p.price, qty: l.qty })));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateCheckout(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    const res = await demoProvider.pay({
      customer: form,
      items: lines.map((l) => ({ id: l.p.id, name: l.p.name, price: l.p.price, qty: l.qty })),
      total: t.total,
    });
    setLoading(false);
    setDone(res.reference);
    clearCart();
    setForm(empty);
  };

  const close = (o: boolean) => {
    onOpenChange(o);
    if (!o) setDone(null);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        {done ? (
          <div className="py-10 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-gold" />
            <DialogTitle className="mt-4 font-display text-3xl">Demo order complete</DialogTitle>
            <DialogDescription className="mx-auto mt-2 max-w-sm">
              This was a demonstration only. No payment was taken and no real order was placed. Reference: {done}
            </DialogDescription>
            <button onClick={() => close(false)} className="mt-6 rounded-lg bg-primary px-6 py-3 text-sm text-primary-foreground">
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <div>
              <span className="rounded-full bg-gold/15 px-3 py-1 text-[11px] font-medium tracking-wider text-gold uppercase">Demo checkout</span>
              <DialogTitle className="mt-3 font-display text-3xl">Checkout</DialogTitle>
              <DialogDescription>No real payment is processed. Online payments (Razorpay / Cashfree) can be connected later.</DialogDescription>
            </div>
            <form onSubmit={submit} noValidate className="grid gap-6 md:grid-cols-5">
              <div className="space-y-3 md:col-span-3">
                {(
                  [
                    ["name", "Full name", "text"],
                    ["mobile", "Mobile number", "tel"],
                    ["email", "Email", "email"],
                  ] as const
                ).map(([k, label, type]) => (
                  <Field key={k} label={label} error={errors[k]}>
                    <input
                      type={type}
                      value={form[k]}
                      onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
                    />
                  </Field>
                ))}
                <Field label="Delivery address" error={errors.address}>
                  <textarea
                    rows={3}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
                  />
                </Field>
                <p className="text-xs text-muted-foreground">Delivery info: [Delivery timeline & areas placeholder]</p>
              </div>
              <div className="rounded-xl bg-secondary p-4 md:col-span-2">
                <h4 className="font-display text-lg">Order summary</h4>
                {lines.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">Your cart is empty.</p>
                ) : (
                  <ul className="mt-3 space-y-2 text-sm">
                    {lines.map(({ p, qty }) => (
                      <li key={p.id} className="flex justify-between gap-2">
                        <span className="line-clamp-1">{p.name} × {qty}</span>
                        <span>{formatPrice(p.price * qty)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(t.subtotal)}</span></div>
                  <div className="flex justify-between"><span>Delivery</span><span>{t.shipping ? formatPrice(t.shipping) : "Free"}</span></div>
                  <div className="flex justify-between font-semibold"><span>Total</span><span>{formatPrice(t.total)}</span></div>
                </div>
                <button
                  disabled={loading || lines.length === 0}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Place demo order
                </button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, children }: { label: string; error?: string | undefined; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
