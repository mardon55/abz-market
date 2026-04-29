import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, ArrowLeft, X, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: string;
  originalPrice?: string | null;
  images?: string[] | null;
  storeId: string;
}

function formatPrice(n: number) {
  return n.toLocaleString("ru-RU") + " so'm";
}

export default function SearchPage() {
  const [, goTo] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const params = new URLSearchParams(window.location.search);
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Focus input on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isFetching } = useQuery<{ products: Product[]; total: number }>({
    queryKey: ["search", debouncedQuery],
    queryFn: () =>
      fetch(`/api/products?search=${encodeURIComponent(debouncedQuery)}&limit=40`)
        .then((r) => r.json()),
    enabled: debouncedQuery.trim().length >= 1,
  });

  const products = data?.products ?? [];

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Search header */}
      <div className="shrink-0 px-4 pt-4 pb-3 flex items-center gap-3 border-b border-border/40">
        <button
          onClick={() => history.length > 1 ? history.back() : goTo("/")}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-secondary hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 flex items-center gap-2 bg-secondary rounded-2xl px-3 h-11">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Mahsulot nomi yoki kalit so'z..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button onClick={() => setQuery("")} className="shrink-0">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Yozilmagan holat */}
        {!debouncedQuery.trim() && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">Mahsulot qidiring</p>
            <p className="text-sm text-muted-foreground">Mahsulot nomi, brend yoki kategoriya bo'yicha qidiring</p>
          </div>
        )}

        {/* Loading */}
        {isFetching && debouncedQuery.trim() && (
          <div className="grid grid-cols-2 gap-3 p-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-secondary animate-pulse aspect-[3/4]" />
            ))}
          </div>
        )}

        {/* Natijalar */}
        {!isFetching && debouncedQuery.trim() && products.length > 0 && (
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-3 font-medium">
              "{debouncedQuery}" bo'yicha {products.length} ta natija
            </p>
            <div className="grid grid-cols-2 gap-3">
              {products.map((p) => {
                const img = p.images?.[0];
                const price = Number(p.price);
                const orig = p.originalPrice ? Number(p.originalPrice) : null;
                const disc = orig && orig > price ? Math.round((1 - price / orig) * 100) : null;
                return (
                  <button
                    key={p.id}
                    onClick={() => goTo(`/product/${p.id}`)}
                    className="bg-card border border-border rounded-2xl overflow-hidden text-left hover:shadow-md transition-shadow active:scale-95"
                  >
                    <div className="aspect-[4/3] bg-secondary relative overflow-hidden">
                      {img ? (
                        <img src={img} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">🛍️</div>
                      )}
                      {disc && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg">
                          -{disc}%
                        </span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug mb-1">{p.name}</p>
                      <p className="text-sm font-bold text-primary">{formatPrice(price)}</p>
                      {orig && orig > price && (
                        <p className="text-[10px] text-muted-foreground line-through">{formatPrice(orig)}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Natija topilmadi */}
        {!isFetching && debouncedQuery.trim() && products.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8 pt-20">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
              <SearchX className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">Topilmadi</p>
            <p className="text-sm text-muted-foreground">
              "<span className="font-medium">{debouncedQuery}</span>" bo'yicha mahsulot topilmadi
            </p>
            <button
              onClick={() => setQuery("")}
              className="mt-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold"
            >
              Qayta qidirish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
