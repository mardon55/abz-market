import { useState } from "react";
import { Search, Eye, CheckCircle, XCircle, Truck, Clock, AlertCircle, Download } from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(n: number) { return n.toLocaleString("ru-RU"); }

const ORDERS = [
  { id: "#ORD-1042", customer: "Akmal Rajabov",    phone: "+998 90 123 45 67", product: "Zamonaviy Shkaf",        amount: 12500000, status: "yangi",    date: "2025-01-15", city: "Toshkent",   items: 1 },
  { id: "#ORD-1041", customer: "Dilnoza Yusupova",  phone: "+998 91 234 56 78", product: "Oshxona to'plami",      amount: 28000000, status: "jarayonda", date: "2025-01-15", city: "Samarqand",  items: 3 },
  { id: "#ORD-1040", customer: "Sardor Ismoilov",   phone: "+998 93 345 67 89", product: "Premium Krovatlar",      amount: 15600000, status: "yetkazildi", date: "2025-01-14", city: "Toshkent",   items: 2 },
  { id: "#ORD-1039", customer: "Nodira Hasanova",   phone: "+998 94 456 78 90", product: "Komod 4-tortmachali",   amount: 4200000,  status: "bekor",    date: "2025-01-14", city: "Namangan",   items: 1 },
  { id: "#ORD-1038", customer: "Jamshid Mirzayev",  phone: "+998 95 567 89 01", product: "Kutubxona javoni",       amount: 7800000,  status: "yetkazildi", date: "2025-01-13", city: "Andijon",    items: 1 },
  { id: "#ORD-1037", customer: "Maftuna Rahimova",  phone: "+998 97 678 90 12", product: "Divan L-shakl",         amount: 18500000, status: "jarayonda", date: "2025-01-13", city: "Buxoro",     items: 1 },
  { id: "#ORD-1036", customer: "Bobur Nazarov",     phone: "+998 98 789 01 23", product: "Oshxona Stoli to'plami", amount: 8900000, status: "yangi",    date: "2025-01-13", city: "Toshkent",   items: 5 },
  { id: "#ORD-1035", customer: "Zulfiya Qodirov",   phone: "+998 90 890 12 34", product: "Yotoq xona to'plami",   amount: 35000000, status: "yetkazildi", date: "2025-01-12", city: "Farg'ona",   items: 4 },
];

const STATUS: Record<string, { label: string; class: string; icon: any }> = {
  yangi:      { label: "Yangi",      class: "badge badge-primary", icon: Clock },
  jarayonda:  { label: "Jarayonda",  class: "badge badge-warning", icon: Truck },
  yetkazildi: { label: "Yetkazildi", class: "badge badge-success", icon: CheckCircle },
  bekor:      { label: "Bekor",      class: "badge badge-danger",  icon: XCircle },
};

export default function Orders() {
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState("all");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = ORDERS.filter((o) => {
    const matchSearch = !search || o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search);
    const matchStatus = status === "all" || o.status === status;
    return matchSearch && matchStatus;
  });

  const counts = ORDERS.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Buyurtmalar</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{ORDERS.length} ta buyurtma</p>
        </div>
        <button className="flex items-center gap-2 bg-muted border border-border/60 text-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-muted/80 transition-colors self-start sm:self-auto">
          <Download className="w-4 h-4" /> Eksport
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        {[
          { key: "all", label: `Barchasi (${ORDERS.length})` },
          { key: "yangi", label: `Yangi (${counts.yangi || 0})` },
          { key: "jarayonda", label: `Jarayonda (${counts.jarayonda || 0})` },
          { key: "yetkazildi", label: `Yetkazildi (${counts.yetkazildi || 0})` },
          { key: "bekor", label: `Bekor (${counts.bekor || 0})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatus(tab.key)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all",
              status === tab.key
                ? "bg-primary text-white border-primary"
                : "bg-card border-border/60 text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="ID yoki mijoz qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 h-9 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border/60">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">ID</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Mijoz</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Mahsulot</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Summa</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">Sana</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Holat</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((o) => {
                const S = STATUS[o.status];
                return (
                  <tr key={o.id} className="table-row-hover" onClick={() => setSelected(selected === o.id ? null : o.id)}>
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-primary text-xs">{o.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{o.customer}</div>
                      <div className="text-xs text-muted-foreground">{o.city}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="max-w-[180px] truncate text-muted-foreground">{o.product}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold">{fmt(o.amount)}</div>
                      <div className="text-xs text-muted-foreground">{o.items} ta mahsulot</div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground text-xs">{o.date}</td>
                    <td className="px-4 py-3">
                      <span className={S.class}>{S.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-violet-100 hover:text-violet-700 transition-colors" onClick={(e) => e.stopPropagation()}>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {o.status === "yangi" && (
                          <button className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-emerald-100 hover:text-emerald-700 transition-colors" onClick={(e) => e.stopPropagation()}>
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
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
