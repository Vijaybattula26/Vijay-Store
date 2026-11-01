/**
 * Payment provider abstraction. Only the demo provider exists today.
 * Razorpay / Cashfree can be added later by implementing PaymentProvider
 * behind a server function (keys must stay server-side).
 */
export interface OrderDraft {
  customer: { name: string; mobile: string; email: string; address: string };
  items: { id: string; name: string; price: number; qty: number }[];
  total: number;
}

export interface PaymentResult {
  ok: boolean;
  reference: string;
  demo: boolean;
}

export interface PaymentProvider {
  id: "demo" | "razorpay" | "cashfree";
  pay(order: OrderDraft): Promise<PaymentResult>;
}

export const demoProvider: PaymentProvider = {
  id: "demo",
  async pay() {
    await new Promise((r) => setTimeout(r, 1200));
    return { ok: true, reference: `DEMO-${Date.now().toString(36).toUpperCase()}`, demo: true };
  },
};
