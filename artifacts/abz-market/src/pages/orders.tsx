import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useOrders } from "@/hooks/use-api";
import { formatPrice, getStatusColor, getStatusLabel } from "@/lib/utils";
import { PackageOpen, Clock, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function Orders() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const { data, isLoading } = useOrders(activeTab !== "all" ? { status: activeTab as any } : undefined);

  const tabs = [
    { id: "all", label: "Barchasi" },
    { id: "new", label: "Yangi" },
    { id: "accepted", label: "Jarayonda" },
    { id: "shipped", label: "Yuborilgan" }
  ];

  return (
    <MobileLayout title="Buyurtmalarim" showBack>
      <div className="sticky top-14 z-40 bg-background pt-2 pb-3 px-4 border-b border-border/50">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                activeTab === tab.id 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-background text-muted-foreground border-border hover:bg-secondary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-40 bg-secondary animate-pulse rounded-2xl" />)}
          </div>
        ) : data?.orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <PackageOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">Buyurtmalar yo'q</h3>
            <p className="text-sm text-muted-foreground mt-1">Hali hech narsa xarid qilmadingiz</p>
          </div>
        ) : (
          data?.orders.map(order => (
            <Link key={order.id} href={`/order/${order.id}`} className="block tap-highlight-transparent active:scale-[0.98] transition-transform">
              <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">#{order.orderNumber}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(order.createdAt), "dd MMM, HH:mm")}
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex -space-x-4">
                    {order.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="w-12 h-12 rounded-full border-2 border-background overflow-hidden bg-muted relative z-10">
                        <img src={item.productImage || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&q=80'} className="w-full h-full object-cover" alt="" />
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-12 h-12 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs font-bold text-foreground relative z-0">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm line-clamp-1">{order.items[0]?.productName}</p>
                    {order.items.length > 1 && <p className="text-xs text-muted-foreground">va yana {order.items.length - 1} ta mahsulot</p>}
                  </div>
                </div>

                <div className="flex justify-between items-center bg-secondary/30 rounded-xl p-3">
                  <span className="text-xs text-muted-foreground font-medium">Jami summa:</span>
                  <span className="font-display font-bold text-primary">{formatPrice(order.totalPrice)}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </MobileLayout>
  );
}
