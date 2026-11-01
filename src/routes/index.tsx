import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, Truck, ShieldCheck, RotateCcw, Headphones, X, Instagram, Facebook, Twitter } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { categories, products, type CategoryId, type Product, getProduct } from "@/lib/products";
import { StoreProvider, useStore } from "@/lib/store";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductDialog } from "@/components/store/ProductDialog";
import { CartSheet, WishlistSheet } from "@/components/store/CartSheet";
import { CheckoutDialog } from "@/components/store/CheckoutDialog";
import { cn } from "@/lib/utils";

const TITLE = "THE VIJAY STORE — Jewellery, Fashion, Watches & Lifestyle";
const DESC = "Shop jewellery, clothing, watches, home decor, accessories and beauty at THE VIJAY STORE. Preview store with demo products.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <StoreProvider>
      <StorePage />
    </StoreProvider>
  ),
});

const MAX_PRICE = 35000;
const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

function StorePage() {
  const { count, wishlist, recent } = useStore();
  const [open, setOpen] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishOpen, setWishOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [menu, setMenu] = useState(false);

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [price, setPrice] = useState<[number, number]>([0, MAX_PRICE]);
  const [sort, setSort] = useState("popular");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = products.filter(
      (p) =>
        (cat === "all" || p.category === cat) &&
        p.price >= price[0] &&
        p.price <= price[1] &&
        (!term || p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)),
    );
    return [...list].sort((a, b) =>
      sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : b.popularity - a.popularity,
    );
  }, [q, cat, price, sort]);

  const goCategory = (id: CategoryId) => {
    setCat(id);
    scrollTo("shop");
  };

  const nav = [
    ["Home", "home"],
    ["Shop", "shop"],
    ["Categories", "categories"],
    ["About Us", "about"],
    ["Contact", "contact"],
  ] as const;

  const recentItems = recent.map(getProduct).filter((p): p is Product => !!p);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="bg-primary py-2 text-center text-[11px] tracking-widest text-primary-foreground uppercase">
        Preview store · All products are demo inventory · Free delivery over ₹1,999
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <button aria-label="Open menu" className="md:hidden" onClick={() => setMenu(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <button onClick={() => scrollTo("home")} className="text-left leading-none">
            <span className="block font-display text-xl tracking-[0.25em] sm:text-2xl">
              THE <span className="text-gold">VIJAY</span> STORE
            </span>
          </button>
          <nav className="hidden gap-8 md:flex">
            {nav.map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)} className="text-sm tracking-wide transition-colors hover:text-gold">
                {label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <button aria-label="Search" onClick={() => { scrollTo("shop"); setTimeout(() => document.getElementById("search")?.focus(), 400); }}>
              <Search className="h-5 w-5" />
            </button>
            <button aria-label="Wishlist" className="relative" onClick={() => setWishOpen(true)}>
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && <Badge n={wishlist.length} />}
            </button>
            <button aria-label="Cart" className="relative" onClick={() => setCartOpen(true)}>
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && <Badge n={count} />}
            </button>
          </div>
        </div>
      </header>

      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent side="left" className="w-72">
          <SheetTitle className="px-4 pt-4 font-display text-xl tracking-[0.2em]">THE VIJAY STORE</SheetTitle>
          <nav className="mt-6 flex flex-col">
            {nav.map(([label, id]) => (
              <button key={id} onClick={() => { setMenu(false); setTimeout(() => scrollTo(id), 250); }} className="border-b border-border px-4 py-4 text-left">
                {label}
              </button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <main>
        {/* Hero */}
        <section id="home" className="relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-24">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <p className="text-xs tracking-[0.3em] text-gold uppercase">New season edit</p>
              <h1 className="mt-4 font-display text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
                Timeless pieces for <em className="text-gold">every</em> moment
              </h1>
              <p className="mt-6 max-w-md text-muted-foreground">
                Discover jewellery, fashion, watches and lifestyle essentials — thoughtfully curated in one elegant place.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={() => scrollTo("shop")} className="rounded-lg bg-primary px-8 py-4 text-sm font-medium tracking-wide text-primary-foreground shadow-elegant transition-colors hover:bg-gold hover:text-gold-foreground">
                  Shop now
                </button>
                <button onClick={() => scrollTo("categories")} className="rounded-lg border border-foreground px-8 py-4 text-sm font-medium tracking-wide transition-colors hover:bg-foreground hover:text-background">
                  Browse categories
                </button>
              </div>
            </div>
            <div className="relative grid grid-cols-2 gap-4">
              <img src={categories[0]!.image} alt="Jewellery" className="aspect-[3/4] w-full rounded-2xl object-cover shadow-elegant" />
              <div className="mt-10 space-y-4">
                <img src={categories[2]!.image} alt="Watch" className="aspect-square w-full rounded-2xl object-cover shadow-elegant" />
                <img src={categories[4]!.image} alt="Handbag" className="aspect-square w-full rounded-2xl object-cover shadow-elegant" />
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <Section id="categories" eyebrow="Explore" title="Shop by category">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {categories.map((c) => (
              <button key={c.id} onClick={() => goCategory(c.id)} className="group relative aspect-[4/3] overflow-hidden rounded-xl text-left">
                <img src={c.image} alt={c.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-overlay/80 via-overlay/20 to-transparent" />
                <div className="absolute bottom-0 p-4 text-overlay-foreground">
                  <h3 className="font-display text-xl sm:text-2xl">{c.name}</h3>
                  <p className="text-xs opacity-80">{c.blurb}</p>
                </div>
              </button>
            ))}
          </div>
        </Section>

        <ProductRow id="featured" eyebrow="Handpicked" title="Featured products" items={products.filter((p) => p.tags.includes("featured")).slice(0, 8)} onOpen={setOpen} />

        {/* Shop with filters */}
        <Section id="shop" eyebrow="The collection" title="Shop all products" className="bg-secondary/50">
          <div className="mb-8 space-y-4 rounded-xl border border-border bg-card p-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input id="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="w-full rounded-lg border border-input bg-background py-2.5 pr-3 pl-9 text-sm outline-none focus:border-gold" />
              </div>
              <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort" className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm">
                <option value="popular">Sort: Popularity</option>
                <option value="low">Price: Low to high</option>
                <option value="high">Price: High to low</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              {[{ id: "all" as const, name: "All" }, ...categories].map((c) => (
                <button key={c.id} onClick={() => setCat(c.id)} className={cn("rounded-full border px-4 py-1.5 text-xs transition-colors", cat === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-gold")}>
                  {c.name}
                </button>
              ))}
            </div>
            <div>
              <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                <span>Price range</span>
                <span>₹{price[0].toLocaleString("en-IN")} – ₹{price[1].toLocaleString("en-IN")}</span>
              </div>
              <Slider min={0} max={MAX_PRICE} step={500} value={price} onValueChange={(v) => setPrice([v[0], v[1]] as [number, number])} />
            </div>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">{filtered.length} products</p>
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-display text-2xl">No products match</p>
              <button onClick={() => { setQ(""); setCat("all"); setPrice([0, MAX_PRICE]); }} className="mt-4 text-sm text-gold underline">Clear filters</button>
            </div>
          ) : (
            <Grid items={filtered} onOpen={setOpen} />
          )}
        </Section>

        <ProductRow id="bestsellers" eyebrow="Most loved (demo)" title="Best sellers" items={products.filter((p) => p.tags.includes("bestseller")).slice(0, 8)} onOpen={setOpen} />

        {/* Promo */}
        <section className="mx-auto max-w-7xl px-4 py-8">
          <div className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground">
            <img src={categories[3]!.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
            <div className="relative px-6 py-16 text-center md:py-24">
              <p className="text-xs tracking-[0.3em] text-gold uppercase">Limited edit</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl">The Festive Collection</h2>
              <p className="mx-auto mt-3 max-w-md text-sm opacity-80">[Promotional offer placeholder — add your real offer here]</p>
              <button onClick={() => scrollTo("collections")} className="mt-6 rounded-lg bg-gold px-8 py-3 text-sm font-medium text-gold-foreground">
                Explore collection
              </button>
            </div>
          </div>
        </section>

        <ProductRow id="new" eyebrow="Just in" title="New arrivals" items={products.filter((p) => p.tags.includes("new")).slice(0, 8)} onOpen={setOpen} />

        <Collections onOpen={setOpen} />

        {recentItems.length > 0 && <ProductRow id="recent" eyebrow="For you" title="Recently viewed" items={recentItems.slice(0, 4)} onOpen={setOpen} />}

        {/* Why */}
        <Section id="about" eyebrow="About us" title="Why shop with us">
          <p className="mx-auto -mt-4 mb-10 max-w-2xl text-center text-sm text-muted-foreground">
            [About THE VIJAY STORE placeholder — share your story, values and where you're based.]
          </p>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              [Truck, "Delivery", "[Delivery policy placeholder]"],
              [ShieldCheck, "Secure checkout", "Payment integration coming soon"],
              [RotateCcw, "Returns", "[Return policy placeholder]"],
              [Headphones, "Support", "[Support hours placeholder]"],
            ].map(([Icon, t, d]) => {
              const I = Icon as typeof Truck;
              return (
                <div key={t as string} className="rounded-xl border border-border bg-card p-6 text-center">
                  <I className="mx-auto h-8 w-8 text-gold" />
                  <h3 className="mt-3 font-display text-lg">{t as string}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{d as string}</p>
                </div>
              );
            })}
          </div>
        </Section>

        <Newsletter />

        {/* Contact */}
        <Section id="contact" eyebrow="Get in touch" title="Contact us">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3 rounded-xl border border-border bg-card p-6 text-sm">
              <p><strong>Email:</strong> [store email placeholder]</p>
              <p><strong>Phone / WhatsApp:</strong> [phone number placeholder]</p>
              <p><strong>Address:</strong> [store address placeholder]</p>
              <p><strong>Hours:</strong> [opening hours placeholder]</p>
            </div>
            <ContactForm />
          </div>
        </Section>
      </main>

      <footer className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
          <div>
            <p className="font-display text-xl tracking-[0.25em]">THE <span className="text-gold">VIJAY</span> STORE</p>
            <p className="mt-3 text-xs opacity-70">Curated jewellery, fashion and lifestyle. Preview site with demo inventory.</p>
          </div>
          <FooterCol title="Shop" items={categories.map((c) => [c.name, () => goCategory(c.id)])} />
          <FooterCol title="Explore" items={nav.map(([l, id]) => [l, () => scrollTo(id)])} />
          <div>
            <h4 className="mb-3 text-xs tracking-widest text-gold uppercase">Follow</h4>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((I, i) => (
                <button key={i} aria-label="Social link placeholder" onClick={() => toast("Social link coming soon", { description: "[Add your social profile link]" })} className="rounded-full border border-primary-foreground/30 p-2 hover:border-gold hover:text-gold">
                  <I className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="border-t border-primary-foreground/10 py-4 text-center text-[11px] opacity-60">
          © {new Date().getFullYear()} THE VIJAY STORE · Demo store — no real orders or payments are processed.
        </p>
      </footer>

      <ProductDialog product={open} onClose={() => setOpen(null)} onOpen={setOpen} />
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} onCheckout={() => { setCartOpen(false); setCheckout(true); }} />
      <WishlistSheet open={wishOpen} onOpenChange={setWishOpen} onOpen={(p) => { setWishOpen(false); setOpen(p); }} />
      <CheckoutDialog open={checkout} onOpenChange={setCheckout} />
    </div>
  );
}

function Badge({ n }: { n: number }) {
  return <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-gold-foreground">{n}</span>;
}

function Section({ id, eyebrow, title, children, className }: { id: string; eyebrow: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={cn("scroll-mt-20 py-16", className)}>
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <p className="text-xs tracking-[0.3em] text-gold uppercase">{eyebrow}</p>
          <h2 className="mt-2 font-display text-4xl md:text-5xl">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function Grid({ items, onOpen }: { items: Product[]; onOpen: (p: Product) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {items.map((p) => <ProductCard key={p.id} product={p} onOpen={onOpen} />)}
    </div>
  );
}

function ProductRow({ id, eyebrow, title, items, onOpen }: { id: string; eyebrow: string; title: string; items: Product[]; onOpen: (p: Product) => void }) {
  return (
    <Section id={id} eyebrow={eyebrow} title={title}>
      <Grid items={items} onOpen={onOpen} />
    </Section>
  );
}

function Collections({ onOpen }: { onOpen: (p: Product) => void }) {
  const tabs = [["festive", "Festive"], ["everyday", "Everyday Essentials"], ["gifting", "Gifting"]] as const;
  const [tab, setTab] = useState<(typeof tabs)[number][0]>("festive");
  return (
    <Section id="collections" eyebrow="Curated" title="Special collections" className="bg-secondary/50">
      <div className="mb-8 flex justify-center gap-2">
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={cn("rounded-full px-5 py-2 text-sm transition-colors", tab === id ? "bg-primary text-primary-foreground" : "bg-card hover:text-gold")}>
            {label}
          </button>
        ))}
      </div>
      <Grid items={products.filter((p) => p.collection === tab).slice(0, 8)} onOpen={onOpen} />
    </Section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="rounded-2xl border border-gold/40 bg-card p-8 text-center md:p-12">
        <h2 className="font-display text-3xl md:text-4xl">Join our newsletter</h2>
        <p className="mt-2 text-sm text-muted-foreground">Demo sign-up — no emails are stored or sent yet.</p>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (!/^\S+@\S+\.\S+$/.test(email)) { toast.error("Please enter a valid email"); return; }
            toast.success("Thanks for subscribing (demo)");
            setEmail("");
          }}
          className="mx-auto mt-6 flex max-w-md gap-2"
        >
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Your email" className="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
          <button className="rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-gold hover:text-gold-foreground">Subscribe</button>
        </form>
      </div>
    </section>
  );
}

function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", msg: "" });
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!f.name.trim() || !/^\S+@\S+\.\S+$/.test(f.email) || f.msg.trim().length < 5) { toast.error("Please fill in all fields correctly"); return; }
        toast.success("Message noted (demo)", { description: "Messages aren't sent anywhere yet." });
        setF({ name: "", email: "", msg: "" });
      }}
      className="space-y-3 rounded-xl border border-border bg-card p-6"
    >
      <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Name" className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm" />
      <input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="Email" className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm" />
      <textarea value={f.msg} onChange={(e) => setF({ ...f, msg: e.target.value })} rows={3} placeholder="Message" className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm" />
      <button className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground">Send message</button>
    </form>
  );
}

function FooterCol({ title, items }: { title: string; items: (readonly [string, () => void])[] }) {
  return (
    <div>
      <h4 className="mb-3 text-xs tracking-widest text-gold uppercase">{title}</h4>
      <ul className="space-y-2 text-sm opacity-80">
        {items.map(([l, fn]) => (
          <li key={l}><button onClick={fn} className="hover:text-gold">{l}</button></li>
        ))}
      </ul>
    </div>
  );
}

// keep X imported icon tree-shaken safe
void X;
