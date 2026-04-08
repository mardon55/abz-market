import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Trash2, Edit2, Eye, EyeOff, Zap, Clock, Package,
  X, Check, Loader2, Search, ChevronDown, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = "/api";

// ── Types ──────────────────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  price: string;
  images: string[] | null;
  discount: number | null;
}

interface FlashSale {
  id: string;
  title: string;
  endsAt: string;
  isActive: boolean;
  productIds: string[];
  products?: Product[];
  createdAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function fmt(n: number) { return n.toLocaleString("ru-RU") + " so'm"; }

function pad(n: number) { return String(n).padStart(2, "0"); }

function TimeRemaining({ endsAt }: { endsAt: string }) {
  const end = new Date(endsAt);
  const now  = new Date();
  const diff = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
  if (diff === 0) return <span className="text-red-500 text-xs font-bold">Tugagan</span>;
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return (
    <span className="text-xs font-mono font-bold text-rose-600">
      {h > 0 ? `${pad(h)}:` : ""}{pad(m)}:{pad(s)}
    </span>
  );
}

function localDatetimeValue(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}

// ── Product picker ─────────────────────────────────────────────────────────
function ProductPicker({
  selected, onChange, products,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
  products: Product[];
}) {
  const [search, setSearch] = useState("");
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter((x) => x !== id));
    else onChange([...selected, id]);
  };

  return (
    <div className="border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-gray-50">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Mahsulot qidirish..."
          className="flex-1 text-sm bg-transparent focus:outline-none"
        />
      </div>
      <div className="max-h-52 overflow-y-auto divide-y">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-6">Mahsulot topilmadi</p>
        ) : filtered.map((p) => {
          const checked = selected.includes(p.id);
          return (
            <label
              key={p.id}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors",
                checked ? "bg-violet-50" : "hover:bg-gray-50"
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(p.id)}
                className="accent-violet-600 w-4 h-4"
              />
              <img
                src={p.images?.[0] ?? ""}
                alt=""
                className="w-9 h-9 rounded-lg object-cover bg-gray-100 shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 line-clamp-1">{p.name}</p>
                <p className="text-xs text-violet-600 font-semibold">{fmt(Number(p.price))}</p>
              </div>
              {p.discount && (
                <span className="text-[10px] font-bold bg-red-50 text-red-500 border border-red-100 px-1.5 py-0.5 rounded-full shrink-0">
                  -{p.discount}%
                </span>
              )}
            </label>
          );
        })}
      </div>
      {selected.length > 0 && (
        <div className="px-3 py-2 bg-violet-50 border-t text-xs text-violet-700 font-semibold">
          {selected.length} ta mahsulot tanlandi
        </div>
      )}
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────
function FlashSaleModal({
  sale, products, onClose,
}: { sale: FlashSale | null; products: Product[]; onClose: () => void }) {
  const qc = useQueryClient();
  const defaultEndsAt = () => {
    const d = new Date(); d.setHours(d.getHours() + 24);
    return localDatetimeValue(d.toISOString());
  };

  const [form, setForm] = useState(() => sale ? {
    title:      sale.title,
    endsAt:     localDatetimeValue(sale.endsAt),
    isActive:   sale.isActive,
    productIds: sale.productIds ?? [],
  } : {
    title: "Flash Sale!", endsAt: defaultEndsAt(), isActive: true, productIds: [],
  });

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const mutation = useMutation({
    mutationFn: async () => {
      const url  = sale ? `${BASE}/flash-sales/${sale.id}` : `${BASE}/flash-sales`;
      const meth = sale ? "PUT" : "POST";
      const r = await fetch(url, {
        method: meth,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          endsAt: new Date(form.endsAt).toISOString(),
        }),
      });
      if (!r.ok) throw new Error((await r.json()).error || "Xato");
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["flash-sales"] }); onClose(); },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-100 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-rose-500 fill-rose-500" />
            </div>
            <h2 className="font-bold text-lg">{sale ? "Flash Sale tahrirlash" : "Yangi Flash Sale"}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nomi *</label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Flash Sale!"
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {/* Ends at */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              <Clock className="w-3.5 h-3.5 inline mr-1" />Tugash vaqti *
            </label>
            <input
              type="datetime-local"
              value={form.endsAt}
              onChange={(e) => set("endsAt", e.target.value)}
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {/* Active toggle */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Holati</label>
            <button
              type="button"
              onClick={() => set("isActive", !form.isActive)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors",
                form.isActive ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-gray-50 border-gray-300 text-gray-500"
              )}
            >
              {form.isActive ? <><Eye className="w-4 h-4" /> Aktiv</> : <><EyeOff className="w-4 h-4" /> Nofaol</>}
            </button>
          </div>

          {/* Products */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              <Package className="w-3.5 h-3.5 inline mr-1" />Mahsulotlar tanlang
            </label>
            <ProductPicker
              selected={form.productIds}
              onChange={(ids) => set("productIds", ids)}
              products={products}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border text-sm font-medium hover:bg-gray-50">
            Bekor
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.title || !form.endsAt}
            className="px-5 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 disabled:opacity-60 flex items-center gap-2"
          >
            {mutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saqlanmoqda...</> : <><Check className="w-4 h-4" /> Saqlash</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function FlashSalesPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<FlashSale | null | "new">(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: salesData, isLoading: salesLoading } = useQuery<{ flashSales: FlashSale[] }>({
    queryKey: ["flash-sales"],
    queryFn: () => fetch(`${BASE}/flash-sales?all=true`).then((r) => r.json()),
    refetchInterval: 15_000,
  });

  const { data: productsData } = useQuery<{ products: Product[] }>({
    queryKey: ["products-all"],
    queryFn: () => fetch(`${BASE}/products?status=approved&limit=200`).then((r) => r.json()),
  });

  const sales    = salesData?.flashSales ?? [];
  const products = productsData?.products ?? [];

  const deleteMut = useMutation({
    mutationFn: (id: string) => fetch(`${BASE}/flash-sales/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["flash-sales"] }),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await fetch(`${BASE}/flash-sales/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["flash-sales"] }),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-rose-500 fill-rose-500" /> Flash Sale
          </h1>
          <p className="text-gray-500 text-sm mt-1">Vaqtli chegirmali mahsulotlar aksiyasini boshqaring</p>
        </div>
        <button
          onClick={() => setModal("new")}
          className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200"
        >
          <Plus className="w-4 h-4" /> Yangi Flash Sale
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Jami",     value: sales.length, color: "bg-rose-50 text-rose-700 border-rose-100" },
          { label: "Faol",     value: sales.filter((s) => s.isActive && new Date(s.endsAt) > new Date()).length, color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
          { label: "Tugagan",  value: sales.filter((s) => !s.isActive || new Date(s.endsAt) <= new Date()).length, color: "bg-gray-50 text-gray-500 border-gray-100" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`border rounded-2xl px-4 py-3 ${color}`}>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* List */}
      {salesLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-2xl" />)}
        </div>
      ) : sales.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <Zap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-500">Hali Flash Sale yo'q</p>
          <p className="text-gray-400 text-sm mt-1">Birinchi aksiyani yarating</p>
          <button
            onClick={() => setModal("new")}
            className="mt-4 px-5 py-2 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600"
          >
            Flash Sale yaratish
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sales.map((sale) => {
            const isExpired = new Date(sale.endsAt) <= new Date();
            const isExpanded = expandedId === sale.id;
            const saleProducts = (sale.productIds ?? [])
              .map((id) => products.find((p) => p.id === id))
              .filter(Boolean) as Product[];

            return (
              <div
                key={sale.id}
                className={cn(
                  "bg-white border rounded-2xl shadow-sm overflow-hidden",
                  (!sale.isActive || isExpired) && "opacity-60"
                )}
              >
                {/* Flash bar */}
                <div className="h-1.5 bg-gradient-to-r from-rose-400 via-pink-400 to-red-400" />

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5 text-rose-500 fill-rose-200" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{sale.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {new Date(sale.endsAt).toLocaleString("uz-UZ", {
                              day: "2-digit", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </span>
                          {!isExpired && sale.isActive && (
                            <><span className="text-gray-300">·</span><TimeRemaining endsAt={sale.endsAt} /></>
                          )}
                          {isExpired && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">Tugagan</span>}
                        </div>
                      </div>
                    </div>
                    <span className={cn(
                      "shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border",
                      sale.isActive && !isExpired
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-gray-50 text-gray-400 border-gray-200"
                    )}>
                      {sale.isActive && !isExpired ? "Faol" : "Nofaol"}
                    </span>
                  </div>

                  {/* Product count badge */}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5 border">
                      <Package className="w-3.5 h-3.5" />
                      {(sale.productIds ?? []).length} ta mahsulot
                    </div>

                    {/* Action buttons */}
                    <button
                      onClick={() => toggleActive.mutate({ id: sale.id, isActive: !sale.isActive })}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors",
                        sale.isActive
                          ? "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      )}
                    >
                      {sale.isActive ? <><EyeOff className="w-3.5 h-3.5" /> O'chirish</> : <><Eye className="w-3.5 h-3.5" /> Yoqish</>}
                    </button>
                    <button
                      onClick={() => setModal(sale)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Tahrirlash
                    </button>
                    <button
                      onClick={() => { if (confirm("O'chirasizmi?")) deleteMut.mutate(sale.id); }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> O'chirish
                    </button>
                    {saleProducts.length > 0 && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : sale.id)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 ml-1"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                  </div>

                  {/* Expanded products */}
                  {isExpanded && saleProducts.length > 0 && (
                    <div className="mt-3 pt-3 border-t grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {saleProducts.map((p) => (
                        <div key={p.id} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2 border">
                          <img
                            src={p.images?.[0] ?? ""}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover bg-gray-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-800 line-clamp-1">{p.name}</p>
                            <p className="text-[10px] text-violet-600 font-bold">{fmt(Number(p.price))}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal !== null && (
        <FlashSaleModal
          sale={modal === "new" ? null : modal}
          products={products}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
