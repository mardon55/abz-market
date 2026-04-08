import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search, Shield, ShoppingBag, MapPin, Phone,
  X, Home, Briefcase, Building2, Star, RefreshCw,
  User, Calendar, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiUser {
  id: string;
  telegramId: string | null;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  avatar: string | null;
  createdAt: string;
}

interface Address {
  id: string;
  label: string;
  address: string;
  city: string | null;
  region: string | null;
  isDefault: boolean;
  createdAt: string;
}

const LABEL_META: Record<string, { icon: typeof Home; color: string }> = {
  Uy:     { icon: Home,      color: "bg-emerald-100 text-emerald-600" },
  Ish:    { icon: Briefcase, color: "bg-blue-100 text-blue-600" },
  Ofis:   { icon: Building2, color: "bg-violet-100 text-violet-600" },
  Boshqa: { icon: MapPin,    color: "bg-amber-100 text-amber-600" },
};
function labelMeta(label: string) {
  return LABEL_META[label] ?? LABEL_META["Boshqa"];
}

function getInitials(u: ApiUser) {
  const f = u.firstName[0] ?? "";
  const l = u.lastName?.[0] ?? "";
  return (f + l).toUpperCase() || "?";
}

const COLORS = [
  "bg-violet-500", "bg-blue-500", "bg-emerald-500",
  "bg-amber-500",  "bg-rose-500", "bg-cyan-500", "bg-pink-500",
];
function colorFor(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0;
  return COLORS[Math.abs(h) % COLORS.length];
}

async function fetchUsers(): Promise<ApiUser[]> {
  const r = await fetch("/api/users");
  if (!r.ok) throw new Error("Foydalanuvchilar yuklanmadi");
  const d = await r.json();
  return d.users ?? [];
}

async function fetchAddresses(telegramId: string): Promise<Address[]> {
  const r = await fetch(`/api/users/${telegramId}/addresses`);
  if (!r.ok) return [];
  const d = await r.json();
  return d.addresses ?? [];
}

// ── User detail modal ──────────────────────────────────────────
function UserModal({ user, onClose }: { user: ApiUser; onClose: () => void }) {
  const [loadingAddr, setLoadingAddr] = useState(false);
  const [addresses, setAddresses]     = useState<Address[] | null>(null);
  const [showAddr, setShowAddr]       = useState(false);

  const loadAddresses = async () => {
    if (!user.telegramId) return;
    setLoadingAddr(true);
    try {
      const addrs = await fetchAddresses(user.telegramId);
      setAddresses(addrs);
      setShowAddr(true);
    } finally { setLoadingAddr(false); }
  };

  const initials = getInitials(user);
  const color    = colorFor(user.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-2xl shadow-2xl border border-border/60 w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-card">
          <h2 className="font-display font-bold text-base">Foydalanuvchi</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center font-display font-bold text-white text-xl shrink-0", color)}>
              {user.avatar
                ? <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover rounded-2xl" />
                : initials
              }
            </div>
            <div>
              <div className="font-display font-bold text-lg">{user.firstName} {user.lastName}</div>
              {user.telegramId && (
                <div className="text-xs text-muted-foreground font-mono">TG: {user.telegramId}</div>
              )}
            </div>
          </div>

          {/* Info rows */}
          <div className="space-y-2">
            {user.phone && (
              <div className="flex items-center gap-2.5 p-3 bg-muted/40 rounded-xl">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground">Telefon</div>
                  <div className="text-sm font-semibold">{user.phone}</div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2.5 p-3 bg-muted/40 rounded-xl">
              <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground">Ro'yxatdan o'tgan</div>
                <div className="text-sm font-semibold">
                  {new Date(user.createdAt).toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              </div>
            </div>
          </div>

          {/* Addresses section */}
          {user.telegramId && (
            <div>
              <button
                onClick={() => { if (!showAddr) loadAddresses(); else setShowAddr(v => !v); }}
                disabled={loadingAddr}
                className="w-full flex items-center gap-2 p-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200/60 dark:border-violet-700/40 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
              >
                <MapPin className="w-4 h-4 text-violet-600 shrink-0" />
                <span className="flex-1 text-left text-sm font-semibold text-violet-700 dark:text-violet-300">
                  {loadingAddr ? "Yuklanmoqda..." : "Saqlangan manzillar"}
                  {addresses !== null && ` (${addresses.length})`}
                </span>
                {!loadingAddr && (
                  <ChevronDown className={cn("w-4 h-4 text-violet-600 transition-transform", showAddr && "rotate-180")} />
                )}
              </button>

              {showAddr && addresses !== null && (
                <div className="mt-2 space-y-2">
                  {addresses.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Hali manzil saqlanmagan</p>
                  ) : (
                    addresses.map(addr => {
                      const meta = labelMeta(addr.label);
                      const Icon = meta.icon;
                      return (
                        <div key={addr.id} className={cn(
                          "p-3 rounded-xl border",
                          addr.isDefault
                            ? "bg-primary/5 border-primary/30"
                            : "bg-muted/40 border-border/40"
                        )}>
                          <div className="flex items-start gap-2.5">
                            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5", meta.color)}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold">{addr.label}</span>
                                {addr.isDefault && (
                                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                    <Star className="w-2 h-2" /> Asosiy
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-foreground/80 mt-0.5 leading-snug">{addr.address}</p>
                              {(addr.city || addr.region) && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {[addr.city, addr.region].filter(Boolean).join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border/60 bg-card">
          <button onClick={onClose} className="w-full h-10 bg-muted rounded-xl text-sm font-semibold hover:bg-muted/80">
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────
export default function Users() {
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState<ApiUser | null>(null);

  const { data: users = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchUsers,
    refetchInterval: 60_000,
  });

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(q) ||
      (u.lastName ?? "").toLowerCase().includes(q) ||
      (u.phone ?? "").includes(search) ||
      (u.telegramId ?? "").includes(search)
    );
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Foydalanuvchilar</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{users.length} ta foydalanuvchi</p>
        </div>
        <button
          onClick={() => refetch()}
          className="w-9 h-9 flex items-center justify-center bg-muted border border-border/60 rounded-xl hover:bg-muted/80 self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: "Jami foydalanuvchilar", value: users.length,                                  color: "text-foreground" },
          { label: "Telefon kiritganlar",   value: users.filter(u => u.phone).length,             color: "text-emerald-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-card text-center">
            <div className={cn("font-display font-bold text-2xl", color)}>{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Ism, telefon yoki Telegram ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 h-9 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {[1,2,3].map(i => (
            <div key={i} className="h-16 bg-card border border-border/60 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="text-center py-10 text-muted-foreground text-sm">
          Yuklanmadi. <button onClick={() => refetch()} className="text-primary underline">Qayta urinish</button>
        </div>
      )}

      {/* Users list */}
      {!isLoading && !isError && (
        <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              {search ? "Topilmadi" : "Foydalanuvchilar yo'q"}
            </div>
          ) : (
            filtered.map((u, idx) => {
              const initials = getInitials(u);
              const color    = colorFor(u.id);
              return (
                <button
                  key={u.id}
                  onClick={() => setSelected(u)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40",
                    idx > 0 && "border-t border-border/40"
                  )}
                >
                  {/* Avatar */}
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0", color)}>
                    {u.avatar
                      ? <img src={u.avatar} alt={u.firstName} className="w-full h-full object-cover rounded-xl" />
                      : initials
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">
                      {u.firstName} {u.lastName}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      {u.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {u.phone}
                        </span>
                      )}
                      {u.telegramId && !u.phone && (
                        <span className="font-mono">TG: {u.telegramId}</span>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                    {new Date(u.createdAt).toLocaleDateString("uz-UZ")}
                  </div>

                  {/* Addresses badge */}
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              );
            })
          )}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <UserModal user={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
