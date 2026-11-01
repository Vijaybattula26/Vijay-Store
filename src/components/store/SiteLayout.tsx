import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useCategories } from "@/lib/db";
import { useHydrated, useStore } from "@/lib/store";

const NAV = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Categories", to: "/categories" },
  { label: "About Us", to: "/about" },
  { label: "Contact", to: "/contact" },
] as const;

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`block font-display text-xl tracking-[0.25em] sm:text-2xl ${className}`}>
      THE <span className="text-gold">VIJAY</span> STORE
    </span>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const { count, wishlist } = useStore();
  const hydrated = useHydrated();
  const [menu, setMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const categories = useCategories();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    void navigate({ to: "/shop", search: { q: q.trim() || undefined } });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="bg-primary px-2 py-2 text-center text-[10px] tracking-widest text-primary-foreground uppercase sm:text-[11px]">
        Demo store · No real orders or payments · Free delivery over ₹1,999
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4">
          <button
            aria-label="Open menu"
            className="-m-2 p-2 md:hidden"
            onClick={() => setMenu(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" aria-label="THE VIJAY STORE home" className="leading-none">
            <Logo />
          </Link>
          <nav className="hidden gap-8 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-sm tracking-wide transition-colors hover:text-gold"
                activeProps={{ className: "text-gold" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <IconBtn label="Search" onClick={() => setSearchOpen((s) => !s)}>
              {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </IconBtn>
            <Link
              to="/account"
              aria-label="Account"
              className="hidden p-2 hover:text-gold sm:block"
            >
              <User className="h-5 w-5" />
            </Link>
            <Link to="/wishlist" aria-label="Wishlist" className="relative p-2 hover:text-gold">
              <Heart className="h-5 w-5" />
              {hydrated && wishlist.length > 0 && <Badge n={wishlist.length} />}
            </Link>
            <Link to="/cart" aria-label="Cart" className="relative p-2 hover:text-gold">
              <ShoppingBag className="h-5 w-5" />
              {hydrated && count > 0 && <Badge n={count} />}
            </Link>
          </div>
        </div>
        {searchOpen && (
          <form onSubmit={submitSearch} className="mx-auto max-w-7xl px-4 pb-4">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search jewellery, watches, dresses…"
                aria-label="Search products"
                className="w-full rounded-lg border border-input bg-background py-3 pr-3 pl-9 text-sm outline-none focus:border-gold"
              />
            </div>
          </form>
        )}
      </header>

      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent side="left" className="w-72 overflow-y-auto">
          <SheetTitle className="px-4 pt-4">
            <Logo className="text-lg" />
          </SheetTitle>
          <nav className="mt-6 flex flex-col" onClick={() => setMenu(false)}>
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="border-b border-border px-4 py-4">
                {n.label}
              </Link>
            ))}
            <Link to="/account" className="border-b border-border px-4 py-4">
              My account
            </Link>
            <Link to="/orders" className="border-b border-border px-4 py-4">
              My orders
            </Link>
            <p className="px-4 pt-6 pb-2 text-[11px] tracking-widest text-gold uppercase">
              Categories
            </p>
            {categories.map((c) => (
              <Link
                key={c.id}
                to="/category/$category"
                params={{ category: c.id }}
                className="px-4 py-2.5 text-sm text-muted-foreground"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <main className="flex-1">{children}</main>

      <footer className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-3 text-xs opacity-70">
              Curated jewellery, fashion and lifestyle. Demo store with demo inventory.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-xs tracking-widest text-gold uppercase">Shop</h4>
            <ul className="space-y-2 text-sm opacity-80">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    to="/category/$category"
                    params={{ category: c.id }}
                    className="hover:text-gold"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs tracking-widest text-gold uppercase">Explore</h4>
            <ul className="space-y-2 text-sm opacity-80">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="hover:text-gold">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs tracking-widest text-gold uppercase">Account</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <Link to="/account" className="hover:text-gold">
                  My account
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-gold">
                  Order history
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-gold">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-gold">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-gold">
                  Store admin
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="border-t border-primary-foreground/10 px-4 py-4 text-center text-[11px] opacity-60">
          © {new Date().getFullYear()} THE VIJAY STORE · Demo store — no real orders or payments are
          processed.
        </p>
      </footer>
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button aria-label={label} onClick={onClick} className="p-2 hover:text-gold">
      {children}
    </button>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-gold-foreground">
      {n}
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="border-b border-border bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        {eyebrow && <p className="text-xs tracking-[0.3em] text-gold uppercase">{eyebrow}</p>}
        <h1 className="mt-2 font-display text-4xl md:text-5xl">{title}</h1>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary text-gold">
        {icon}
      </div>
      <p className="mt-5 font-display text-2xl">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-gold hover:text-gold-foreground disabled:pointer-events-none disabled:opacity-50";
export const btnOutline =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-primary px-6 py-3 text-sm font-medium transition-colors hover:border-gold hover:text-gold disabled:pointer-events-none disabled:opacity-50";
export const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-gold aria-[invalid=true]:border-destructive";
