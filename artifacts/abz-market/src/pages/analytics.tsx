import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { formatPrice } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, Package, ShoppingCart,
  Users, DollarSign, Clock, CheckCircle, XCircle,
  AlertCircle, Crown, RefreshCw, BarChart2,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────
type Period = "today" | "week" | "month" | "year";

interface StoreSummary {
  totalRevenue: number;
  totalOrders: number;
  uniqueCustomers: number;
  pendingOrders: number;
  averageCheck: number;
  revenueChange: number;
  ordersChange: number;
  averageCheckChange: number;
  topProducts: { productId: string; productName: string; revenue: number; salesCount: number }[];
  recentOrders: { id: string; orderNumber: string; customerName: string; totalPrice: number; status: string; createdAt: string }[];
}

// ── Helpers ───────────────────────────────────────────────────────────────
function getTelegramId() {
  return (
    String((window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id ?? "") ||
    localStorage.getItem("tg_user_id") || ""
  );
}
function loadSeller(): { storeId: string; storeName: string } | null {
  try { const r = localStorage.getItem("abz_seller"); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
function short(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + " mlrd";
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + " mln";
  if (n >= 1_000)         return (n / 1_000).toFixed(0) + " ming";
  return n.toLocaleString("ru-RU");
}

const STATUS_STYLE: Record<string, string> = {
  pending:    "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  delivered:  "bg-emerald-100 text-emerald-700",
  cancelled:  "bg-red-100 text-red-600",
};
const STATUS_LBL: Record<string, string> = {
  pending: "Kutilmoqda", processing: "Jarayonda", delivered: "Yetkazildi", cancelled: "Bekor",
};
const STATUS_ICON: Record<string, any> = {
  pending: Clock, processing: AlertCircle, delivered: CheckCircle, cancelled: XCircle,
};

const PERIODS: { id: Period; label: string }[] = [
  { id: "today", label: "Bugun" },
  { id: "week",  label: "Hafta" },
  { id: "month", label: "Oy"    },
  { id: "year",  label: "Yil"   },
];

// ── Stat card ─────────────────────────────────────────────────────────────
function StatCard({
  label, value, change, icon: Icon, color, bg, sub,
}: {
  label: string; value: string; change: number;
  icon: any; color: string; bg: string; sub?: string;
}) {
  const up = change >= 0;
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-3.5 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${bg}`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        {change !== 0 && (
          <span className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-lg ${up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
            {up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="font-bold text-base leading-tight mt-1">{value}</div>
      <div className="text-muted-foreground text-[11px] mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</div>}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function Analytics() {
  const [period, setPeriod] = useState<Period>("month");
  const [chartType, setChartType] = useState<"revenue" | "orders">("revenue");
  const seller = useMemo(() => loadSeller(), []);
  const storeId = seller?.storeId;

  const { data: summary, isLoading, refetch } = useQuery<StoreSummary>({
    queryKey: ["store-analytics", storeId, period],
    queryFn: () =>
      fetch(`/api/analytics/store/${storeId}?period=${period}`).then((r) => r.json()),
    enabled: !!storeId,
    refetchInterval: 60_000,
  });

  const { data: chartRaw, isLoading: chartLoading } = useQuery<{ data: any[] }>({
    queryKey: ["store-chart", storeId, period],
    queryFn: () =>
      fetch(`/api/analytics/chart?period=${period}&storeId=${storeId}`).then((r) => r.json()),
    enabled: !!storeId,
    refetchInterval: 60_000,
  });

  const chartData = chartRaw?.data ?? [];

  // Not a seller
  if (!storeId) {
    return (
      <MobileLayout title="Analitika" showBack>
        <div className="flex flex-col items-center justify-center h-72 gap-4 p-6 text-center">
          <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center">
            <BarChart2 className="w-8 h-8 text-violet-400" />
          </div>
          <p className="font-semibold text-gray-700">Do'koningiz yo'q</p>
          <p className="text-sm text-muted-foreground">
            Analitikani ko'rish uchun avval do'kon oching
          </p>
        </div>
      </MobileLayout>
    );
  }

  const stats = summary
    ? [
        {
          label: "Daromad", value: short(summary.totalRevenue) + " so'm",
          change: summary.revenueChange, icon: DollarSign,
          color: "text-violet-600", bg: "bg-violet-50",
          sub: formatPrice(summary.totalRevenue),
        },
        {
          label: "Buyurtmalar", value: String(summary.totalOrders),
          change: summary.ordersChange, icon: ShoppingCart,
          color: "text-blue-600", bg: "bg-blue-50",
          sub: `${summary.pendingOrders} ta kutilmoqda`,
        },
        {
          label: "Mijozlar", value: String(summary.uniqueCustomers),
          change: 0, icon: Users,
          color: "text-emerald-600", bg: "bg-emerald-50",
        },
        {
          label: "O'rtacha chek", value: short(summary.averageCheck) + " so'm",
          change: summary.averageCheckChange, icon: Package,
          color: "text-amber-600", bg: "bg-amber-50",
        },
      ]
    : [];

  return (
    <MobileLayout title={seller.storeName ? `${seller.storeName} — Analitika` : "Analitika"} showBack>
      <div className="p-4 space-y-5 pb-6">

        {/* Period selector */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-secondary/60 p-1 rounded-xl flex gap-0.5">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  period === p.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl border border-border bg-card"
          >
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Stat cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map((i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s) => <StatCard key={s.label} {...s} />)}
          </div>
        )}

        {/* Chart */}
        <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Grafik</h3>
            <div className="flex gap-1 bg-secondary/60 p-0.5 rounded-lg">
              <button
                onClick={() => setChartType("revenue")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  chartType === "revenue" ? "bg-background shadow-sm text-violet-600" : "text-muted-foreground"
                }`}
              >
                Daromad
              </button>
              <button
                onClick={() => setChartType("orders")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  chartType === "orders" ? "bg-background shadow-sm text-violet-600" : "text-muted-foreground"
                }`}
              >
                Buyurtma
              </button>
            </div>
          </div>

          {chartLoading ? (
            <div className="h-44 bg-muted animate-pulse rounded-xl" />
          ) : chartData.every((d) => d[chartType] === 0) ? (
            <div className="h-44 flex items-center justify-center flex-col gap-2 text-muted-foreground">
              <BarChart2 className="w-8 h-8 opacity-30" />
              <p className="text-sm">Bu davr uchun ma'lumot yo'q</p>
            </div>
          ) : chartType === "revenue" ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revGradSeller" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9 }} tickFormatter={(v) => v >= 1_000_000 ? (v/1_000_000).toFixed(0)+"M" : v >= 1000 ? (v/1000).toFixed(0)+"K" : v} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,.1)", fontSize: 11 }}
                  formatter={(v: number) => [formatPrice(v), "Daromad"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={2.5} fillOpacity={1} fill="url(#revGradSeller)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,.1)", fontSize: 11 }}
                  formatter={(v: number) => [v, "Buyurtma"]}
                />
                <Bar dataKey="orders" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top products */}
        <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4 text-amber-500" />
            <h3 className="font-semibold text-sm">Eng ko'p sotilgan mahsulotlar</h3>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => <div key={i} className="h-10 bg-muted animate-pulse rounded-xl" />)}
            </div>
          ) : (summary?.topProducts ?? []).length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <Package className="w-7 h-7 mx-auto mb-2 opacity-30" />
              Sotuvlar yo'q
            </div>
          ) : (
            <div className="space-y-3">
              {(summary?.topProducts ?? []).map((p, i) => (
                <div key={p.productId} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    i === 0 ? "bg-amber-100 text-amber-700" :
                    i === 1 ? "bg-gray-100 text-gray-500" :
                    i === 2 ? "bg-orange-100 text-orange-600" :
                    "bg-muted text-muted-foreground"
                  }`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold line-clamp-1">{p.productName}</p>
                    <p className="text-[10px] text-muted-foreground">{p.salesCount} ta sotildi</p>
                  </div>
                  <div className="text-xs font-bold text-violet-600 shrink-0">
                    {short(p.revenue)} so'm
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-sm mb-3">So'nggi buyurtmalar</h3>
          {isLoading ? (
            <div className="space-y-2">
              {[1,2,3].map((i) => <div key={i} className="h-12 bg-muted animate-pulse rounded-xl" />)}
            </div>
          ) : (summary?.recentOrders ?? []).length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <ShoppingCart className="w-7 h-7 mx-auto mb-2 opacity-30" />
              Buyurtma yo'q
            </div>
          ) : (
            <div className="space-y-2">
              {(summary?.recentOrders ?? []).map((o) => {
                const Icon = STATUS_ICON[o.status] ?? Clock;
                return (
                  <div key={o.id} className="flex items-center gap-3 p-2.5 bg-secondary/40 rounded-xl">
                    <div className="w-8 h-8 bg-card rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                      <ShoppingCart className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{o.customerName || "Noma'lum"}</p>
                      <p className="text-[10px] text-muted-foreground">{o.orderNumber}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold">{short(o.totalPrice)} so'm</p>
                      <span className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${STATUS_STYLE[o.status] ?? STATUS_STYLE.pending}`}>
                        <Icon className="w-2 h-2" />{STATUS_LBL[o.status] ?? o.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </MobileLayout>
  );
}
