import { useState } from "react";
import { Search, UserPlus, Edit2, Trash2, Shield, ShoppingBag, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const USERS = [
  { id: 1, name: "Akmal Rajabov",    phone: "+998 90 123 45 67", email: "akmal@email.com",    orders: 12, spent: 48500000,  role: "user",   status: "faol",   joined: "2024-06-12", city: "Toshkent" },
  { id: 2, name: "Dilnoza Yusupova", phone: "+998 91 234 56 78", email: "dilnoza@email.com",   orders: 8,  spent: 92000000,  role: "user",   status: "faol",   joined: "2024-07-03", city: "Samarqand" },
  { id: 3, name: "Sardor Ismoilov",  phone: "+998 93 345 67 89", email: "sardor@email.com",    orders: 24, spent: 156000000, role: "seller", status: "faol",   joined: "2024-05-20", city: "Toshkent" },
  { id: 4, name: "Nodira Hasanova",  phone: "+998 94 456 78 90", email: "nodira@email.com",    orders: 3,  spent: 12600000,  role: "user",   status: "bloklangan", joined: "2024-08-15", city: "Namangan" },
  { id: 5, name: "Jamshid Mirzayev", phone: "+998 95 567 89 01", email: "jamshid@email.com",   orders: 18, spent: 74800000,  role: "seller", status: "faol",   joined: "2024-04-10", city: "Andijon" },
  { id: 6, name: "Maftuna Rahimova", phone: "+998 97 678 90 12", email: "maftuna@email.com",   orders: 6,  spent: 31500000,  role: "user",   status: "faol",   joined: "2024-09-01", city: "Buxoro" },
  { id: 7, name: "Bobur Nazarov",    phone: "+998 98 789 01 23", email: "bobur@email.com",     orders: 31, spent: 215000000, role: "seller", status: "faol",   joined: "2024-03-05", city: "Toshkent" },
];

function fmt(n: number) { return n.toLocaleString("ru-RU") + " so'm"; }

const ROLE_CLASS: Record<string, string> = {
  user:   "badge badge-muted",
  seller: "badge badge-primary",
  admin:  "badge badge-warning",
};
const STATUS_CLASS: Record<string, string> = {
  faol:       "badge badge-success",
  bloklangan: "badge badge-danger",
};

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

const COLORS = ["bg-violet-500","bg-blue-500","bg-emerald-500","bg-amber-500","bg-rose-500","bg-cyan-500","bg-pink-500"];

export default function Users() {
  const [search, setSearch] = useState("");
  const [role, setRole]     = useState("all");

  const filtered = USERS.filter((u) => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search);
    const matchRole   = role === "all" || u.role === role;
    return matchSearch && matchRole;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Foydalanuvchilar</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{USERS.length} ta foydalanuvchi</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors self-start sm:self-auto">
          <UserPlus className="w-4 h-4" /> Foydalanuvchi qo'shish
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Jami", value: USERS.length, color: "text-foreground" },
          { label: "Sotuvchilar", value: USERS.filter(u => u.role === "seller").length, color: "text-violet-600" },
          { label: "Bloklangan", value: USERS.filter(u => u.status === "bloklangan").length, color: "text-red-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-card text-center">
            <div className={cn("font-display font-bold text-2xl", color)}>{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-col sm:flex-row mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Ism yoki telefon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-9 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="h-9 px-3 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">Barcha rollar</option>
          <option value="user">Foydalanuvchi</option>
          <option value="seller">Sotuvchi</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border/60">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Foydalanuvchi</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">Telefon</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Buyurtmalar</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">Sarflagan</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Rol</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Holat</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((u, idx) => (
                <tr key={u.id} className="table-row-hover">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0", COLORS[idx % COLORS.length])}>
                        {getInitials(u.name)}
                      </div>
                      <div>
                        <div className="font-semibold">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.city}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{u.phone}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-semibold">{u.orders}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell font-semibold">{fmt(u.spent)}</td>
                  <td className="px-4 py-3">
                    <span className={ROLE_CLASS[u.role]}>{u.role === "seller" ? "Sotuvchi" : u.role === "admin" ? "Admin" : "Foydalanuvchi"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={STATUS_CLASS[u.status]}>{u.status === "faol" ? "Faol" : "Bloklangan"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
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
        <div className="px-4 py-3 border-t border-border/40 text-xs text-muted-foreground">
          {filtered.length} ta natija
        </div>
      </div>
    </div>
  );
}
