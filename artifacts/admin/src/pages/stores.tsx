import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Trash2, Eye, Star, Package, TrendingUp,
  CheckCircle, XCircle, Clock, RefreshCw, AlertCircle, X,
  Phone, MapPin, Building2, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiStore {
  id: string;
  name: string;
  logo: string | null;
  description: string | null;
  type: string;
  rating: string;
  reviewCount: number;
  productCount: number;
  salesCount: number;
  location: string | null;
  phone: string | null;
  stir: string | null;
  activityType: string | null;
  isVerified: boolean;
  createdAt: string;
}

function getStatus(s: ApiStore): "pending" | "approved" | "rejected" {
  if (s.type === "pending")  return "pending";
  if (s.type === "rejected") return "rejected";
  return "approved";
}

const STATUS_MAP = {
  pending:  { label: "Kutilmoqda",   badgeClass: "badge badge-warning",  icon: Clock },
  approved: { label: "Tasdiqlangan", badgeClass: "badge badge-success",  icon: CheckCircle },
  rejected: { label: "Rad etilgan",  badgeClass: "badge badge-danger",   icon: XCircle },
};

// ── API helpers ───────────────────────────────────────────────────────────────
async function fetchStores(): Promise<ApiStore[]> {
  const r = await fetch("/api/stores");
  if (!r.ok) throw new Error("Do'konlar yuklanmadi");
  const data = await r.json();
  return data.stores ?? [];
}

async function patchStore(id: string, action: "approve" | "reject"): Promise<ApiStore> {
  const r = await fetch(`/api/stores/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  if (!r.ok) throw new Error("Xato yuz berdi");
  return r.json();
}

async function removeStore(id: string): Promise<void> {
  const r = await fetch(`/api/stores/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("O'chirishda xato");
}

// ── Detail Modal ─────────────────────────────────────────────────────────────
function StoreModal({
  store,
  onClose,
  onApprove,
  onReject,
  isBusy,
}: {
  store: ApiStore;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  isBusy: boolean;
}) {
  const status = getStatus(store);
  const S = STATUS_MAP[status];
  const Icon = S.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-2xl shadow-2xl border border-border/60 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-card">
          <h2 className="font-display font-bold text-base">Do'kon tafsiloti</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Store header */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center font-display font-bold text-violet-700 text-2xl shrink-0">
              {store.name[0]}
            </div>
            <div>
              <div className="font-display font-bold text-lg">{store.name}</div>
              <span className={S.badgeClass}>
                <Icon className="w-3 h-3" /> {S.label}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            {store.activityType && (
              <div className="flex items-center gap-2.5 p-3 bg-muted/40 rounded-xl">
                <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground">Faoliyat turi</div>
                  <div className="text-sm font-semibold">{store.activityType}</div>
                </div>
              </div>
            )}
            {store.phone && (
              <div className="flex items-center gap-2.5 p-3 bg-muted/40 rounded-xl">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground">Telefon</div>
                  <div className="text-sm font-semibold">{store.phone}</div>
                </div>
              </div>
            )}
            {store.location && (
              <div className="flex items-center gap-2.5 p-3 bg-muted/40 rounded-xl">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground">Manzil</div>
                  <div className="text-sm font-semibold">{store.location}</div>
                </div>
              </div>
            )}
            {store.stir && (
              <div className="flex items-center gap-2.5 p-3 bg-muted/40 rounded-xl">
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground">STIR</div>
                  <div className="text-sm font-semibold">{store.stir}</div>
                </div>
              </div>
            )}
            {store.description && (
              <div className="p-3 bg-muted/40 rounded-xl">
                <div className="text-xs text-muted-foreground mb-1">Do'kon haqida</div>
                <div className="text-sm">{store.description}</div>
              </div>
            )}
            <div className="p-3 bg-muted/40 rounded-xl">
              <div className="text-xs text-muted-foreground mb-1">Ariza sanasi</div>
              <div className="text-sm font-semibold">
                {new Date(store.createdAt).toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-border/60 bg-card">
          {status === "pending" ? (
            <div className="flex gap-3">
              <button
                onClick={onReject}
                disabled={isBusy}
                className="flex-1 h-11 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
              >
                <XCircle className="w-4 h-4" /> Rad etish
              </button>
              <button
                onClick={onApprove}
                disabled={isBusy}
                className="flex-[2] h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
              >
                {isBusy ? (
                  <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Tasdiqlanmoqda...</>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Tasdiqlash</>
                )}
              </button>
            </div>
          ) : (
            <button onClick={onClose} className="w-full h-11 bg-muted rounded-xl text-sm font-semibold">
              Yopish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Stores() {
  const qc = useQueryClient();
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("all");
  const [selected, setSelected] = useState<ApiStore | null>(null);

  const { data: stores = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-stores"],
    queryFn: fetchStores,
    refetchInterval: 30_000,
  });

  const patchMut = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "approve" | "reject" }) =>
      patchStore(id, action),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-stores"] });
      setSelected(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: removeStore,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-stores"] }),
  });

  const pending  = stores.filter((s) => getStatus(s) === "pending");
  const approved = stores.filter((s) => getStatus(s) === "approved");

  const filtered = stores.filter((s) => {
    const matchSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone ?? "").includes(search) ||
      (s.location ?? "").toLowerCase().includes(search.toLowerCase());
    const status = getStatus(s);
    const matchFilter =
      filter === "all"      ? true :
      filter === "pending"  ? status === "pending" :
      filter === "approved" ? status === "approved" :
      filter === "rejected" ? status === "rejected" : true;
    return matchSearch && matchFilter;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Do'konlar</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{stores.length} ta do'kon</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="w-9 h-9 flex items-center justify-center bg-muted border border-border/60 rounded-xl hover:bg-muted/80"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {pending.length > 0 && (
            <button
              onClick={() => setFilter("pending")}
              className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-amber-100 transition-colors"
            >
              <Clock className="w-4 h-4" />
              {pending.length} ta ariza kutilmoqda
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Jami do'konlar", value: stores.length,   icon: Package,      color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Tasdiqlangan",   value: approved.length, icon: CheckCircle,  color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Kutilmoqda",     value: pending.length,  icon: Clock,        color: "text-amber-600",  bg: "bg-amber-50" },
          { label: "Rad etilgan",    value: stores.filter(s => getStatus(s) === "rejected").length, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", bg)}>
              <Icon className={cn("w-5 h-5", color)} />
            </div>
            <div>
              <div className="font-display font-bold text-xl">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-col sm:flex-row mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Do'kon, telefon, manzil..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-9 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-1.5">
          {[
            { val: "all",      label: "Barchasi" },
            { val: "pending",  label: "Kutilmoqda" },
            { val: "approved", label: "Tasdiqlangan" },
            { val: "rejected", label: "Rad etilgan" },
          ].map(({ val, label }) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={cn(
                "px-3 h-9 rounded-xl text-xs font-semibold border transition-all shrink-0",
                filter === val ? "bg-primary text-white border-primary" : "bg-card border-border/60 text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Pending banner */}
      {pending.length > 0 && filter !== "pending" && (
        <div
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 cursor-pointer hover:bg-amber-100 transition-colors"
          onClick={() => setFilter("pending")}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-800 text-sm">{pending.length} ta yangi ariza admin tasdiqlashini kutmoqda</p>
            <p className="text-xs text-amber-600 mt-0.5">Ko'rish uchun bosing</p>
          </div>
          <CheckCircle className="w-5 h-5 text-amber-500" />
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm">Yuklanmoqda...</span>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <AlertCircle className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm font-medium">Do'konlarni yuklashda xato</p>
          <button onClick={() => refetch()} className="mt-3 text-xs text-primary hover:underline">Qayta urinish</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Package className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm font-medium">Do'konlar topilmadi</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => {
            const status = getStatus(s);
            const S = STATUS_MAP[status];
            const Icon = S.icon;
            return (
              <div
                key={s.id}
                className={cn(
                  "bg-card border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow",
                  status === "pending" ? "border-amber-200 bg-amber-50/30" : "border-border/60"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center font-display font-bold text-violet-700 text-lg shrink-0">
                      {s.name[0]}
                    </div>
                    <div>
                      <div className="font-display font-bold text-[15px] leading-tight">{s.name}</div>
                      {s.activityType && (
                        <div className="text-xs text-muted-foreground mt-0.5">{s.activityType}</div>
                      )}
                    </div>
                  </div>
                  <span className={S.badgeClass}>
                    <Icon className="w-3 h-3" /> {S.label}
                  </span>
                </div>

                <div className="space-y-1.5 mb-3">
                  {s.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3 shrink-0" /> {s.phone}
                    </div>
                  )}
                  {s.location && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 shrink-0" /> {s.location}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 shrink-0" />
                    {new Date(s.createdAt).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>

                {status === "approved" && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center p-2 bg-muted/50 rounded-xl">
                      <div className="font-bold text-sm">{s.productCount}</div>
                      <div className="text-[10px] text-muted-foreground">Mahsulot</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded-xl">
                      <div className="font-bold text-sm">{s.salesCount}</div>
                      <div className="text-[10px] text-muted-foreground">Sotuv</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded-xl">
                      <div className="font-bold text-sm flex items-center justify-center gap-0.5">
                        {Number(s.rating) > 0
                          ? <><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{Number(s.rating).toFixed(1)}</>
                          : "—"}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Reyting</div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-border/40">
                  <button
                    onClick={() => setSelected(s)}
                    className="flex-1 h-8 bg-muted hover:bg-violet-100 hover:text-violet-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Ko'rish
                  </button>

                  {status === "pending" && (
                    <>
                      <button
                        onClick={() => patchMut.mutate({ id: s.id, action: "reject" })}
                        disabled={patchMut.isPending}
                        className="flex-1 h-8 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Rad
                      </button>
                      <button
                        onClick={() => patchMut.mutate({ id: s.id, action: "approve" })}
                        disabled={patchMut.isPending}
                        className="flex-1 h-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Tasdiq
                      </button>
                    </>
                  )}

                  {status !== "pending" && (
                    <button
                      onClick={() => {
                        if (!confirm(`"${s.name}" do'konini o'chirishni tasdiqlaysizmi?`)) return;
                        deleteMut.mutate(s.id);
                      }}
                      disabled={deleteMut.isPending}
                      className="w-8 h-8 bg-muted hover:bg-red-100 hover:text-red-600 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <StoreModal
          store={selected}
          onClose={() => setSelected(null)}
          onApprove={() => patchMut.mutate({ id: selected.id, action: "approve" })}
          onReject={() => patchMut.mutate({ id: selected.id, action: "reject" })}
          isBusy={patchMut.isPending}
        />
      )}
    </div>
  );
}
