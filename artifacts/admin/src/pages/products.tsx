import { useState } from "react";
import { Search, Plus, Filter, Edit2, Trash2, Eye, Star, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(n: number) { return n.toLocaleString("ru-RU") + " so'm"; }

const PRODUCTS = [
  { id: 1, name: "Zamonaviy Lusso Yotoq To'plami", category: "Yotoqxona", price: 12500000, oldPrice: 15000000, stock: 12, rating: 4.8, reviews: 124, status: "faol",   img: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=64&q=70", store: "Comfort Home" },
  { id: 2, name: "Premium Oshxona Mebellari To'plami", category: "Oshxonalar", price: 28000000, oldPrice: null, stock: 5, rating: 4.9, reviews: 89,  status: "faol",   img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=64&q=70", store: "Kitchen Pro" },
  { id: 3, name: "Zamonaviy Shkaf 2 qanotli Eman",  category: "Shkaflar",  price: 9980000,  oldPrice: 11500000, stock: 0, rating: 4.6, reviews: 56,  status: "tugagan", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=64&q=70", store: "Comfort Home" },
  { id: 4, name: "Komod 4 tortmachali Dub",         category: "Komodlar",  price: 4200000,  oldPrice: null, stock: 23, rating: 4.4, reviews: 38,  status: "faol",    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=64&q=70", store: "Wood Masters" },
  { id: 5, name: "Kutubxona Javoni Klassik",         category: "Javonlar",  price: 6800000,  oldPrice: 7500000, stock: 8, rating: 4.7, reviews: 72,  status: "faol",   img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=64&q=70", store: "Book Shelf" },
  { id: 6, name: "Designer Divan L-shakl",           category: "Divonlar",  price: 18500000, oldPrice: 22000000, stock: 3, rating: 4.5, reviews: 45,  status: "faol",   img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=64&q=70", store: "Living Style" },
  { id: 7, name: "Oshxona Stoli + 4 Stul",          category: "Stollar",   price: 8900000,  oldPrice: null, stock: 15, rating: 4.3, reviews: 29,  status: "kutilmoqda", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=64&q=70", store: "Furniture City" },
];

const STATUS_CLASS: Record<string, string> = {
  faol:       "badge badge-success",
  tugagan:    "badge badge-danger",
  kutilmoqda: "badge badge-warning",
};

export default function Products() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = PRODUCTS.filter((p) => {
    const matchSearch   = !search   || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "all" || p.category === category;
    const matchStatus   = status   === "all" || p.status === status;
    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Mahsulotlar</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{PRODUCTS.length} ta mahsulot</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Mahsulot qo'shish
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Mahsulot qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-9 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-9 px-3 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">Barcha kategoriyalar</option>
          {[...new Set(PRODUCTS.map((p) => p.category))].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 px-3 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">Barcha holat</option>
          <option value="faol">Faol</option>
          <option value="tugagan">Tugagan</option>
          <option value="kutilmoqda">Kutilmoqda</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border/60">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Mahsulot</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Kategoriya</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Narx</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">Ombor</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">Reyting</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Holat</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((p) => (
                <tr key={p.id} className="table-row-hover">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.img} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-muted shrink-0" />
                      <div>
                        <div className="font-semibold line-clamp-1 max-w-[200px]">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.store}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="badge badge-primary">{p.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">{fmt(p.price)}</div>
                    {p.oldPrice && <div className="text-xs text-muted-foreground line-through">{fmt(p.oldPrice)}</div>}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={cn("font-semibold", p.stock === 0 ? "text-destructive" : p.stock < 5 ? "text-amber-600" : "text-foreground")}>
                      {p.stock} ta
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="font-semibold">{p.rating}</span>
                      <span className="text-muted-foreground text-xs">({p.reviews})</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={STATUS_CLASS[p.status]}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-violet-100 hover:text-violet-700 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-blue-100 hover:text-blue-700 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
          <span>{filtered.length} ta natija</span>
          <div className="flex gap-1">
            {[1,2,3].map((p) => (
              <button key={p} className={cn("w-7 h-7 rounded-lg text-xs font-semibold", p === 1 ? "bg-primary text-white" : "bg-muted hover:bg-muted/80")}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
