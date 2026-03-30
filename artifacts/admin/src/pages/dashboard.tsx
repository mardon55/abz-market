import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Package, ShoppingCart, Users, Store, TrendingUp, TrendingDown,
  DollarSign, Eye, Star, Clock, CheckCircle, XCircle, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(n: number) { return n.toLocaleString("ru-RU"); }
function fmtMoney(n: number) { return fmt(n) + " so'm"; }

const revenueData = [
  { month: "Yan", revenue: 42000000, orders: 124 },
  { month: "Fev", revenue: 58000000, orders: 168 },
  { month: "Mar", revenue: 51000000, orders: 145 },
  { month: "Apr", revenue: 74000000, orders: 212 },
  { month: "May", revenue: 89000000, orders: 257 },
  { month: "Iyn", revenue: 96000000, orders: 284 },
  { month: "Iyl", revenue: 112000000, orders: 318 },
];

const categoryData = [
  { name: "Shkaflar",    value: 35, color: "#7C3AED" },
  { name: "Yotoqxona",  value: 25, color: "#A855F7" },
  { name: "Oshxonalar", value: 20, color: "#C084FC" },
  { name: "Komodlar",   value: 12, color: "#DDD6FE" },
  { name: "Boshqalar",  value: 8,  color: "#EDE9FE" },
];

const recentOrders = [
  { id: "#ORD-1042", customer: "Akmal Rajabov",  product: "Zamonaviy Shkaf",    amount: 12500000, status: "yangi",    time: "5 daqiqa" },
  { id: "#ORD-1041", customer: "Dilnoza Yusupova", product: "Oshxona to'plami", amount: 28000000, status: "jarayonda", time: "23 daqiqa" },
  { id: "#ORD-1040", customer: "Sardor Ismoilov", product: "Premium Krovatlar",   amount: 15600000, status: "yetkazildi", time: "1 soat" },
  { id: "#ORD-1039", customer: "Nodira Hasanova", product: "Komod 4-tortmachali", amount: 4200000,  status: "bekor",    time: "2 soat" },
  { id: "#ORD-1038", customer: "Jamshid Mirzayev", product: "Kutubxona javoni",   amount: 7800000,  status: "yetkazildi", time: "3 soat" },
];

const topProducts = [
  { name: "Zamonaviy Lusso Yotoq To'plami", sales: 124, revenue: 1550000000, img: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=64&q=70" },
  { name: "Premium Oshxona Mebellari",       sales: 98,  revenue: 2744000000, img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=64&q=70" },
  { name: "Zamonaviy Shkaf 2 qanotli",       sales: 87,  revenue: 869000000,  img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=64&q=70" },
  { name: "Komod 4 tortmachali Dub",        sales: 76,  revenue: 319200000,  img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=64&q=70" },
];

const STATUS_STYLE: Record<string, string> = {
  yangi:      "badge badge-primary",
  jarayonda:  "badge badge-warning",
  yetkazildi: "badge badge-success",
  bekor:      "badge badge-danger",
};
const STATUS_ICON: Record<string, any> = {
  yangi:      Clock,
  jarayonda:  AlertCircle,
  yetkazildi: CheckCircle,
  bekor:      XCircle,
};

const STATS = [
  { label: "Jami daromad",   value: fmtMoney(522000000), change: +18.4, icon: DollarSign, color: "text-violet-600",  bg: "bg-violet-50" },
  { label: "Buyurtmalar",    value: fmt(1508),            change: +12.2, icon: ShoppingCart, color: "text-blue-600",  bg: "bg-blue-50" },
  { label: "Foydalanuvchilar", value: fmt(3842),          change: +8.7,  icon: Users,      color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Faol do'konlar", value: fmt(148),             change: +5.1,  icon: Store,      color: "text-amber-600",   bg: "bg-amber-50" },
];

export default function Dashboard() {
  const [period, setPeriod] = useState<"7d"|"30d"|"90d">("30d");

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">ABZ Market ko'rsatkichlari — bugun</p>
        </div>
        <div className="flex gap-1 bg-muted rounded-xl p-1 self-start sm:self-auto">
          {(["7d","30d","90d"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                period === p ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p === "7d" ? "7 kun" : p === "30d" ? "30 kun" : "90 kun"}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STATS.map(({ label, value, change, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="flex items-start justify-between mb-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bg)}>
                <Icon className={cn("w-5 h-5", color)} />
              </div>
              <span className={cn(
                "text-xs font-semibold flex items-center gap-0.5",
                change >= 0 ? "text-emerald-600" : "text-red-500"
              )}>
                {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(change)}%
              </span>
            </div>
            <div className="font-display font-bold text-xl leading-tight">{value}</div>
            <div className="text-muted-foreground text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Revenue area chart */}
        <div className="lg:col-span-2 stat-card">
          <h3 className="font-display font-bold text-base mb-4">Daromad dinamikasi</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => (v/1000000)+"M"} />
              <Tooltip
                formatter={(v: any) => [fmtMoney(v), "Daromad"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={2.5} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category pie chart */}
        <div className="stat-card">
          <h3 className="font-display font-bold text-base mb-4">Kategoriyalar</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => [v + "%", ""]} contentStyle={{ borderRadius: 10, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {categoryData.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-muted-foreground">{c.name}</span>
                </div>
                <span className="font-semibold">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Recent orders */}
        <div className="lg:col-span-3 stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base">So'nggi buyurtmalar</h3>
            <button className="text-primary text-xs font-semibold hover:underline">Barchasi</button>
          </div>
          <div className="space-y-3">
            {recentOrders.map((o) => {
              const Icon = STATUS_ICON[o.status];
              return (
                <div key={o.id} className="flex items-center gap-3 py-1">
                  <div className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center shrink-0">
                    <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{o.customer}</div>
                    <div className="text-xs text-muted-foreground truncate">{o.product}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold">{fmt(o.amount)}</div>
                    <span className={STATUS_STYLE[o.status]}>{o.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top products */}
        <div className="lg:col-span-2 stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base">Top mahsulotlar</h3>
            <button className="text-primary text-xs font-semibold hover:underline">Barchasi</button>
          </div>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-5 text-muted-foreground text-xs font-bold shrink-0">{i + 1}</span>
                <img src={p.img} alt={p.name} className="w-10 h-10 rounded-xl object-cover shrink-0 bg-muted" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold line-clamp-2 leading-tight">{p.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{p.sales} ta sotildi</div>
                </div>
                <div className="text-xs font-bold text-violet-700 shrink-0">{fmt(p.revenue / 1000000)}M</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
