import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  Package, ShoppingCart, Users, Store, TrendingUp, TrendingDown,
  DollarSign, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, Send, Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Broadcast notification panel ─────────────────────────────
function BroadcastPanel() {
  const [title, setTitle]     = useState("");
  const [body, setBody]       = useState("");
  const [telegramId, setTid]  = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);

  const send = async () => {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          type: "announcement",
          telegramId: telegramId.trim() || null,
        }),
      });
      setTitle(""); setBody(""); setTid("");
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center">
          <Megaphone className="w-4 h-4 text-violet-600" />
        </div>
        <div>
          <h3 className="font-bold text-sm">Bildirishnoma yuborish</h3>
          <p className="text-[11px] text-muted-foreground">Foydalanuvchilarga xabar yuboring</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Sarlavha *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Masalan: Yangi aksiya boshlandi!"
            className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Xabar matni *</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={2}
            placeholder="Batafsil ma'lumot..."
            className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
            Telegram ID <span className="text-muted-foreground/60 font-normal">(bo'sh qoldiring = barchaga)</span>
          </label>
          <input
            value={telegramId}
            onChange={e => setTid(e.target.value)}
            placeholder="Shaxsiy yuborish uchun ID kiriting"
            className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          onClick={send}
          disabled={sending || !title.trim() || !body.trim()}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
            sent
              ? "bg-emerald-100 text-emerald-700"
              : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          )}
        >
          <Send className="w-4 h-4" />
          {sending ? "Yuborilmoqda..." : sent ? "Yuborildi ✓" : "Yuborish"}
        </button>
      </div>
    </div>
  );
}

type Period = "today" | "week" | "month" | "year";

function fmt(n: number)      { return n.toLocaleString("ru-RU"); }
function fmtM(n: number)     { return fmt(n) + " so'm"; }
function short(n: number)    {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + " mlrd";
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + " mln";
  if (n >= 1_000)         return (n / 1_000).toFixed(0) + " ming";
  return fmt(n);
}

const STATUS_STYLE: Record<string, string> = {
  pending:    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700",
  processing: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700",
  delivered:  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700",
  cancelled:  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600",
};
const STATUS_LBL: Record<string, string> = {
  pending: "Kutilmoqda", processing: "Jarayonda", delivered: "Yetkazildi", cancelled: "Bekor",
};
const STATUS_ICON: Record<string, any> = {
  pending: Clock, processing: AlertCircle, delivered: CheckCircle, cancelled: XCircle,
};

// API fetchers
async function fetchSummary(period: string) {
  const r = await fetch(`/api/analytics/summary?period=${period}`);
  return r.json();
}
async function fetchChart(period: string) {
  const r = await fetch(`/api/analytics/chart?period=${period}`);
  return r.json();
}

const PERIODS: { id: Period; label: string }[] = [
  { id: "today", label: "Bugun" },
  { id: "week",  label: "Hafta" },
  { id: "month", label: "Oy"    },
  { id: "year",  label: "Yil"   },
];

// ── Stat card ─────────────────────────────────────────────────────────────
function StatCard({
  label, value, change, icon: Icon, iconBg, iconColor, sub,
}: {
  label: string; value: string; change: number;
  icon: any; iconBg: string; iconColor: string; sub?: string;
}) {
  const up = change >= 0;
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBg)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        <span className={cn(
          "text-xs font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg",
          up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
        )}>
          {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </span>
      </div>
      <div className="font-bold text-xl leading-tight">{value}</div>
      <div className="text-muted-foreground text-xs mt-1">{label}</div>
      {sub && <div className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>("month");

  const { data: summary, isLoading: sumLoading, refetch: refetchSum } = useQuery({
    queryKey: ["admin-summary", period],
    queryFn: () => fetchSummary(period),
    refetchInterval: 15_000,
  });

  const { data: chartRaw, isLoading: chartLoading } = useQuery({
    queryKey: ["admin-chart", period],
    queryFn: () => fetchChart(period),
    refetchInterval: 15_000,
  });

  const chartData: { label: string; revenue: number; orders: number }[] = chartRaw?.data ?? [];

  const STATS = summary
    ? [
        {
          label: "Jami daromad", value: short(summary.totalRevenue), change: summary.revenueChange ?? 0,
          icon: DollarSign, iconBg: "bg-violet-50", iconColor: "text-violet-600",
          sub: fmtM(summary.totalRevenue),
        },
        {
          label: "Buyurtmalar", value: fmt(summary.totalOrders), change: summary.ordersChange ?? 0,
          icon: ShoppingCart, iconBg: "bg-blue-50", iconColor: "text-blue-600",
          sub: `O'rtacha chek: ${short(summary.averageCheck)}`,
        },
        {
          label: "Mijozlar", value: fmt(summary.totalCustomers), change: 0,
          icon: Users, iconBg: "bg-emerald-50", iconColor: "text-emerald-600",
          sub: "Ro'yxatdan o'tgan",
        },
        {
          label: "Faol do'konlar", value: fmt(summary.activeStores), change: 0,
          icon: Store, iconBg: "bg-amber-50", iconColor: "text-amber-600",
          sub: `${fmt(summary.activeProducts)} ta mahsulot`,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Broadcast notification */}
      <BroadcastPanel />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-bold text-2xl">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">ABZ Market umumiy ko'rsatkichlari</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetchSum()}
            className="p-2 rounded-xl border hover:bg-muted transition-colors"
            title="Yangilash"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex gap-1 bg-muted rounded-xl p-1">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  period === p.id ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      {sumLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s) => <StatCard key={s.label} {...s} />)}
        </div>
      )}

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base">Daromad dinamikasi</h3>
            <span className="text-xs text-muted-foreground">
              {period === "today" ? "Soat bo'yicha" : period === "year" ? "Oy bo'yicha" : "Kun bo'yicha"}
            </span>
          </div>
          {chartLoading ? (
            <div className="h-52 bg-muted animate-pulse rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => v >= 1_000_000 ? (v/1_000_000).toFixed(0)+"M" : v >= 1000 ? (v/1000).toFixed(0)+"K" : v} />
                <Tooltip
                  formatter={(v: any) => [fmtM(v), "Daromad"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={2.5} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Orders bar chart */}
        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base">Buyurtmalar</h3>
          </div>
          {chartLoading ? (
            <div className="h-52 bg-muted animate-pulse rounded-xl" />
          ) : chartData.every((d) => d.orders === 0) ? (
            <div className="h-52 flex items-center justify-center text-muted-foreground text-sm flex-col gap-2">
              <ShoppingCart className="w-8 h-8 text-muted-foreground/30" />
              <p>Ma'lumot yo'q</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  formatter={(v: any) => [v, "Buyurtma"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                />
                <Bar dataKey="orders" fill="#7C3AED" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Recent orders */}
        <div className="lg:col-span-3 bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base">So'nggi buyurtmalar</h3>
            <span className="text-xs text-muted-foreground">{fmt(summary?.totalOrders ?? 0)} ta jami</span>
          </div>
          {sumLoading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map((i) => <div key={i} className="h-12 bg-muted animate-pulse rounded-xl" />)}
            </div>
          ) : (summary?.recentOrders ?? []).length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm flex flex-col items-center gap-2">
              <ShoppingCart className="w-8 h-8 text-muted-foreground/30" />
              <p>Buyurtma yo'q</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(summary?.recentOrders ?? []).map((o: any) => {
                const Icon = STATUS_ICON[o.status] ?? Clock;
                return (
                  <div key={o.id} className="flex items-center gap-3 py-1">
                    <div className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center shrink-0">
                      <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{o.customerName || "Noma'lum"}</div>
                      <div className="text-xs text-muted-foreground">{o.orderNumber}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold">{short(o.totalPrice)}</div>
                      <span className={STATUS_STYLE[o.status] ?? STATUS_STYLE.pending}>
                        <Icon className="w-2.5 h-2.5" />
                        {STATUS_LBL[o.status] ?? o.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="lg:col-span-2 bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base">Top mahsulotlar</h3>
            <span className="text-xs text-muted-foreground bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full font-medium">
              {period === "today" ? "Bugun" : period === "week" ? "Hafta" : period === "month" ? "Oy" : "Yil"}
            </span>
          </div>
          {sumLoading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map((i) => <div key={i} className="h-10 bg-muted animate-pulse rounded-xl" />)}
            </div>
          ) : (summary?.topProducts ?? []).length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm flex flex-col items-center gap-2">
              <Package className="w-8 h-8 text-muted-foreground/30" />
              <p>Buyurtma yo'q</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(summary?.topProducts ?? []).slice(0, 7).map((p: any, i: number) => (
                <div key={p.productId} className="flex items-center gap-3">
                  <span className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                    i === 0 ? "bg-amber-100 text-amber-700" :
                    i === 1 ? "bg-gray-100 text-gray-600" :
                    i === 2 ? "bg-orange-100 text-orange-600" :
                    "bg-muted text-muted-foreground"
                  )}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold line-clamp-1">{p.productName}</div>
                    <div className="text-[10px] text-muted-foreground">{fmt(p.salesCount)} ta sotildi</div>
                  </div>
                  <div className="text-xs font-bold text-violet-700 shrink-0">{short(p.revenue)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category pie */}
      {!sumLoading && (summary?.categoryBreakdown ?? []).length > 0 && (
        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-base mb-4">Kategoriyalar bo'yicha sotuvlar</h3>
          <div className="grid sm:grid-cols-2 gap-6 items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={summary.categoryBreakdown}
                  dataKey="sales"
                  nameKey="name"
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={90}
                  paddingAngle={3}
                >
                  {summary.categoryBreakdown.map((c: any, i: number) => (
                    <Cell key={i} fill={c.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: any, n: any, p: any) => [fmt(v) + " ta", p.payload.name]}
                  contentStyle={{ borderRadius: 10, fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {summary.categoryBreakdown.map((c: any) => {
                const total = summary.categoryBreakdown.reduce((s: number, x: any) => s + x.sales, 0);
                const pct = total > 0 ? Math.round((c.sales / total) * 100) : 0;
                return (
                  <div key={c.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">{c.name}</span>
                      </div>
                      <span className="text-xs font-bold">{pct}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: c.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
