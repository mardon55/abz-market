import { useState } from "react";
import { Search, Plus, Edit2, Trash2, Eye, Star, Package, TrendingUp, CheckCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(n: number) { return n.toLocaleString("ru-RU") + " so'm"; }

const STORES = [
  { id: "s1", name: "Comfort Home",   owner: "Sardor Ismoilov",  products: 45, orders: 320, revenue: 850000000, rating: 4.8, status: "tasdiqlangan", joined: "2024-03-10", city: "Toshkent",   category: "Yotoqxona", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=64&q=70" },
  { id: "s2", name: "Kitchen Pro",    owner: "Bobur Nazarov",    products: 32, orders: 210, revenue: 620000000, rating: 4.9, status: "tasdiqlangan", joined: "2024-04-05", city: "Toshkent",   category: "Oshxonalar", img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=64&q=70" },
  { id: "s3", name: "Wood Masters",   owner: "Jamshid Mirzayev", products: 28, orders: 156, revenue: 410000000, rating: 4.6, status: "tasdiqlangan", joined: "2024-05-15", city: "Andijon",    category: "Shkaflar", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=64&q=70" },
  { id: "s4", name: "Living Style",   owner: "Maftuna Rahimova", products: 19, orders: 89,  revenue: 285000000, rating: 4.5, status: "kutilmoqda",  joined: "2024-10-20", city: "Buxoro",     category: "Divonlar", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=64&q=70" },
  { id: "s5", name: "Book Shelf",     owner: "Zulfiya Qodirov",  products: 15, orders: 67,  revenue: 142000000, rating: 4.7, status: "tasdiqlangan", joined: "2024-06-30", city: "Farg'ona",   category: "Javonlar", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=64&q=70" },
  { id: "s6", name: "Furniture City", owner: "Otabek Xolmatov",  products: 52, orders: 0,   revenue: 0,         rating: 0,   status: "rad etilgan", joined: "2024-11-10", city: "Samarqand",  category: "Boshqa", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=64&q=70" },
];

const STATUS: Record<string, { label: string; class: string; icon: any }> = {
  tasdiqlangan: { label: "Tasdiqlangan", class: "badge badge-success", icon: CheckCircle },
  kutilmoqda:   { label: "Kutilmoqda",   class: "badge badge-warning", icon: Clock },
  "rad etilgan": { label: "Rad etilgan", class: "badge badge-danger",  icon: XCircle },
};

export default function Stores() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = STORES.filter((s) => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.owner.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "all" || s.status === status;
    return matchSearch && matchStatus;
  });

  const pending = STORES.filter(s => s.status === "kutilmoqda").length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Do'konlar</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{STORES.length} ta do'kon</p>
        </div>
        {pending > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-xl text-sm font-semibold">
            <Clock className="w-4 h-4" /> {pending} ta tasdiqlash kutilmoqda
          </div>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Jami do'konlar", value: STORES.length, icon: Package, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Tasdiqlangan",   value: STORES.filter(s => s.status === "tasdiqlangan").length, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Kutilmoqda",     value: pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Jami mahsulot",  value: STORES.reduce((a, s) => a + s.products, 0), icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
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
            placeholder="Do'kon yoki egasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-9 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 px-3 bg-card border border-border/60 rounded-xl text-sm focus:outline-none"
        >
          <option value="all">Barcha holat</option>
          <option value="tasdiqlangan">Tasdiqlangan</option>
          <option value="kutilmoqda">Kutilmoqda</option>
          <option value="rad etilgan">Rad etilgan</option>
        </select>
      </div>

      {/* Store grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => {
          const S = STATUS[s.status];
          return (
            <div key={s.id} className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center font-display font-bold text-violet-700 text-lg">
                    {s.name[0]}
                  </div>
                  <div>
                    <div className="font-display font-bold text-[15px]">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.owner}</div>
                  </div>
                </div>
                <span className={S.class}>{S.label}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 bg-muted/50 rounded-xl">
                  <div className="font-bold text-sm">{s.products}</div>
                  <div className="text-[10px] text-muted-foreground">Mahsulot</div>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-xl">
                  <div className="font-bold text-sm">{s.orders}</div>
                  <div className="text-[10px] text-muted-foreground">Buyurtma</div>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-xl">
                  <div className="font-bold text-sm flex items-center justify-center gap-0.5">
                    {s.rating > 0 ? <><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{s.rating}</> : "—"}
                  </div>
                  <div className="text-[10px] text-muted-foreground">Reyting</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>📍 {s.city}</span>
                <span>{s.category}</span>
              </div>

              {s.revenue > 0 && (
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {fmt(s.revenue)} daromad
                </div>
              )}

              <div className="flex gap-2 mt-3 pt-3 border-t border-border/40">
                <button className="flex-1 h-8 bg-muted hover:bg-violet-100 hover:text-violet-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> Ko'rish
                </button>
                {s.status === "kutilmoqda" && (
                  <>
                    <button className="flex-1 h-8 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Tasdiqlash
                    </button>
                    <button className="flex-1 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Rad etish
                    </button>
                  </>
                )}
                {s.status === "tasdiqlangan" && (
                  <button className="h-8 px-3 bg-muted hover:bg-red-100 hover:text-red-600 rounded-lg text-xs font-semibold transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
