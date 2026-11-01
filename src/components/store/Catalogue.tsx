import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, PackageSearch } from "lucide-react";
import { ProductGrid } from "./ProductCard";
import { EmptyState, inputCls } from "./SiteLayout";
import { filterProducts, type SortKey } from "@/lib/commerce";
import { useCategories, useProducts } from "@/lib/db";
import type { CategoryId } from "@/lib/products";
import { cn } from "@/lib/utils";

export interface CatalogueSearch {
  q?: string | undefined;
  min?: number | undefined;
  max?: number | undefined;
  stock?: boolean | undefined;
  size?: string | undefined;
  color?: string | undefined;
  sort?: SortKey | undefined;
  cat?: CategoryId | undefined;
}

const SORTS: [SortKey, string][] = [
  ["featured", "Featured"],
  ["price-asc", "Price: Low to High"],
  ["price-desc", "Price: High to Low"],
  ["newest", "Newest First"],
  ["name", "Name: A to Z"],
];

export function parseCatalogueSearch(s: Record<string, unknown>): CatalogueSearch {
  const num = (v: unknown) => (v === undefined || v === "" || isNaN(Number(v)) ? undefined : Number(v));
  const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);
  const sort = str(s["sort"]);
  return {
    q: str(s["q"]),
    min: num(s["min"]),
    max: num(s["max"]),
    stock: s["stock"] === true || s["stock"] === "true" ? true : undefined,
    size: str(s["size"]),
    color: str(s["color"]),
    sort: SORTS.some(([k]) => k === sort) ? (sort as SortKey) : undefined,
    cat: str(s["cat"]) as CategoryId | undefined,
  };
}

/** Search + filter + sort UI. `fixedCategory` locks the category (category pages). */
export function Catalogue({ search, fixedCategory }: { search: CatalogueSearch; fixedCategory?: CategoryId }) {
  const navigate = useNavigate();
  const products = useProducts();
  const categories = useCategories();
  const [showFilters, setShowFilters] = useState(false);
  const [q, setQ] = useState(search.q ?? "");
  const category = fixedCategory ?? search.cat;

  const update = (patch: Partial<CatalogueSearch>) =>
    void navigate({ to: ".", search: (prev: CatalogueSearch) => ({ ...prev, ...patch }), replace: true });

  const pool = products.filter((p) => p.active && (!category || p.category === category));
  const sizes = [...new Set(pool.flatMap((p) => p.sizes))];
  const colors = [...new Set(pool.flatMap((p) => p.colors))];

  const results = useMemo(
    () =>
      filterProducts(
        products,
        { ...search, category, inStock: search.stock },
        (id) => categories.find((c) => c.id === id)?.name ?? id,
      ),
    [products, categories, search, category],
  );

  const active = !!(search.q || search.min != null || search.max != null || search.stock || search.size || search.color || (!fixedCategory && search.cat));
  const clear = () => {
    setQ("");
    void navigate({ to: ".", search: {}, replace: true });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <form
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: q.trim() || undefined });
          }}
        >
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              update({ q: e.target.value.trim() || undefined });
            }}
            placeholder="Search by name, description or category…"
            aria-label="Search products"
            className={cn(inputCls, "pl-9")}
          />
        </form>
        <div className="flex gap-2">
          <select value={search.sort ?? "featured"} onChange={(e) => update({ sort: e.target.value as SortKey })} aria-label="Sort products" className={cn(inputCls, "md:w-56")}>
            {SORTS.map(([k, l]) => (
              <option key={k} value={k}>{l}</option>
            ))}
          </select>
          <button onClick={() => setShowFilters((s) => !s)} className="inline-flex items-center gap-2 rounded-lg border border-input px-4 text-sm md:hidden" aria-expanded={showFilters}>
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[230px_1fr]">
        <aside className={cn("space-y-6 rounded-xl border border-border bg-card p-4 md:block md:self-start", showFilters ? "block" : "hidden")}>
          {!fixedCategory && (
            <FilterGroup title="Category">
              <select value={search.cat ?? ""} onChange={(e) => update({ cat: (e.target.value || undefined) as CategoryId | undefined, size: undefined, color: undefined })} aria-label="Category" className={inputCls}>
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FilterGroup>
          )}
          <FilterGroup title="Price (₹)">
            <div className="flex items-center gap-2">
              <input type="number" min={0} inputMode="numeric" placeholder="Min" aria-label="Minimum price" value={search.min ?? ""} onChange={(e) => update({ min: e.target.value === "" ? undefined : Number(e.target.value) })} className={inputCls} />
              <span className="text-muted-foreground">–</span>
              <input type="number" min={0} inputMode="numeric" placeholder="Max" aria-label="Maximum price" value={search.max ?? ""} onChange={(e) => update({ max: e.target.value === "" ? undefined : Number(e.target.value) })} className={inputCls} />
            </div>
          </FilterGroup>
          <FilterGroup title="Availability">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!search.stock} onChange={(e) => update({ stock: e.target.checked || undefined })} className="h-4 w-4 accent-primary" />
              In stock only
            </label>
          </FilterGroup>
          {sizes.length > 0 && (
            <FilterGroup title="Size">
              <Chips options={sizes} value={search.size} onChange={(size) => update({ size })} />
            </FilterGroup>
          )}
          {colors.length > 0 && (
            <FilterGroup title="Colour">
              <Chips options={colors} value={search.color} onChange={(color) => update({ color })} />
            </FilterGroup>
          )}
          {active && (
            <button onClick={clear} className="w-full rounded-lg border border-border py-2 text-sm hover:border-gold hover:text-gold">Clear filters</button>
          )}
        </aside>

        <div>
          <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
            {results.length} {results.length === 1 ? "product" : "products"} found
          </p>
          {results.length === 0 ? (
            <EmptyState
              icon={<PackageSearch className="h-10 w-10" />}
              title="No results found"
              text="Try a different search term or loosen your filters."
              action={<button onClick={clear} className="text-sm text-gold underline">Clear filters</button>}
            />
          ) : (
            <ProductGrid items={results} />
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] tracking-widest text-gold uppercase">{title}</p>
      {children}
    </div>
  );
}

function Chips({ options, value, onChange }: { options: string[]; value: string | undefined; onChange: (v: string | undefined) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(value === o ? undefined : o)} aria-pressed={value === o} className={cn("rounded-full border px-3 py-1 text-xs", value === o ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-gold")}>
          {o}
        </button>
      ))}
    </div>
  );
}
