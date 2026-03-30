import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useAnalyticsSummary, useAnalyticsChart } from "@/hooks/use-api";
import { formatPrice } from "@/lib/utils";
import { TrendingUp, TrendingDown, Package, ShoppingCart, Users, DollarSign } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const [period, setPeriod] = useState<"today" | "7days" | "30days">("7days");
  const { data: summary } = useAnalyticsSummary({ period });
  const { data: chartData } = useAnalyticsChart({ period });

  const periods = [
    { id: "today", label: "Bugun" },
    { id: "7days", label: "7 kun" },
    { id: "30days", label: "30 kun" }
  ];

  const StatCard = ({ title, value, change, icon: Icon, format = false }: any) => {
    const isPositive = change > 0;
    return (
      <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Icon className="w-4 h-4" />
          </div>
          <div className={`flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md ${isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        </div>
        <p className="text-xs text-muted-foreground font-medium mb-1">{title}</p>
        <h3 className="font-display font-bold text-lg text-foreground">
          {format ? formatPrice(value) : value}
        </h3>
      </div>
    );
  };

  return (
    <MobileLayout title="Analitika" showBack>
      <div className="p-4 space-y-6">
        
        {/* Period Selector */}
        <div className="bg-secondary/50 p-1 rounded-xl flex">
          {periods.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id as any)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                period === p.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        {summary && (
          <div className="grid grid-cols-2 gap-3">
            <StatCard title="Umumiy savdo" value={summary.totalRevenue} change={summary.revenueChange} icon={DollarSign} format />
            <StatCard title="Buyurtmalar" value={summary.totalOrders} change={summary.ordersChange} icon={ShoppingCart} />
            <StatCard title="O'rtacha chek" value={summary.averageCheck} change={summary.averageCheckChange} icon={Package} format />
            <StatCard title="Konversiya" value={`${summary.conversionRate}%`} change={summary.conversionChange} icon={Users} />
          </div>
        )}

        {/* Chart */}
        <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold mb-4">Sotuvlar grafigi</h3>
          <div className="h-48 w-full -ml-2">
            {chartData && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.data}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'hsl(var(--muted-foreground))'}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                    formatter={(value: number) => [`${new Intl.NumberFormat('ru-RU').format(value)} so'm`, 'Savdo']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold mb-4">Top sotilganlar</h3>
          <div className="space-y-4">
            {summary?.topProducts.map((product, index) => (
              <div key={product.productId} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary text-muted-foreground flex items-center justify-center font-bold text-xs shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold truncate">{product.productName}</p>
                  <p className="text-xs text-muted-foreground">{product.salesCount} ta sotilgan</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-primary">{formatPrice(product.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </MobileLayout>
  );
}
