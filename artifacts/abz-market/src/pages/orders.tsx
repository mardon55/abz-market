import { useState, useMemo } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useOrders } from "@/hooks/use-api";
import { formatPrice, getStatusColor, getStatusLabel } from "@/lib/utils";
import { PackageOpen, Clock, ChevronRight, AlertCircle, Star, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import ReviewModal from "@/components/ReviewModal";

function getTelegramId(): string | undefined {
  try {
    const tg = (window as any).Telegram?.WebApp;
    const id = tg?.initDataUnsafe?.user?.id;
    if (id) return String(id);
    return localStorage.getItem("tg_user_id") ?? undefined;
  } catch { return undefined; }
}

// Track which order+product combos have already been reviewed (in-session)
function getReviewedKey(orderId: string, productId: string) {
  return `reviewed_${orderId}_${productId}`;
}

export default function Orders() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const telegramId = useMemo(() => getTelegramId(), []);
  const [reviewTarget, setReviewTarget] = useState<{
    orderId: string; productId: string; productName: string;
    productImage: string | null; storeId: string | null;
  } | null>(null);
  const [sessionReviewed, setSessionReviewed] = useState<Set<string>>(new Set());

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (activeTab !== "all") p.status = activeTab;
    if (telegramId) p.telegramId = telegramId;
    return Object.keys(p).length > 0 ? p : undefined;
  }, [activeTab, telegramId]);

  const { data, isLoading, isError, refetch } = useOrders(params as any, { refetchInterval: 15_000 });

  const tabs = [
    { id: "all",      label: "Barchasi" },
    { id: "new",      label: "Yangi" },
    { id: "accepted", label: "Jarayonda" },
    { id: "shipped",  label: "Yuborilgan" },
    { id: "delivered",label: "Yetkazildi" },
    { id: "cancelled",label: "Bekor" },
  ];

  const isReviewed = (orderId: string, productId: string) =>
    sessionReviewed.has(getReviewedKey(orderId, productId)) ||
    !!localStorage.getItem(getReviewedKey(orderId, productId));

  const markReviewed = (orderId: string, productId: string) => {
    const key = getReviewedKey(orderId, productId);
    localStorage.setItem(key, "1");
    setSessionReviewed((prev) => new Set(prev).add(key));
  };

  return (
    <MobileLayout title="Buyurtmalarim" showBack>
      {/* Tabs */}
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
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-secondary animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="font-semibold text-lg">Xato yuz berdi</h3>
            <p className="text-sm text-muted-foreground mt-1">Buyurtmalarni yuklashda muammo</p>
          </div>
        ) : !data?.orders || data.orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <PackageOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">Buyurtmalar yo'q</h3>
            <p className="text-sm text-muted-foreground mt-1">Hali hech narsa xarid qilmadingiz</p>
          </div>
        ) : (
          data.orders.map(order => {
            const isDelivered = order.status === "delivered";
            return (
              <div key={order.id} className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
                {/* Header */}
                <Link href={`/order/${order.id}`} className="block active:scale-[0.98] transition-transform p-4">
                  <div className="flex justify-between items-center mb-3 pb-3 border-b border-border/50">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">{order.orderNumber}</p>
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
                      {order.items.slice(0, 3).map((item: any, i: number) => (
                        <div key={i} className="w-12 h-12 rounded-full border-2 border-background overflow-hidden bg-muted relative z-10">
                          <img
                            src={item.productImage || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&q=80"}
                            className="w-full h-full object-cover"
                            alt=""
                          />
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
                      {order.items.length > 1 && (
                        <p className="text-xs text-muted-foreground">va yana {order.items.length - 1} ta mahsulot</p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>

                  <div className="flex justify-between items-center bg-secondary/30 rounded-xl p-3">
                    <span className="text-xs text-muted-foreground font-medium">Jami summa:</span>
                    <span className="font-display font-bold text-primary">{formatPrice(order.totalPrice)}</span>
                  </div>
                </Link>

                {/* ── Review section — only for delivered orders ── */}
                {isDelivered && (
                  <div className="border-t border-border/50 bg-gradient-to-r from-amber-50/60 to-orange-50/40 px-4 py-3">
                    <p className="text-xs font-semibold text-amber-800 mb-2.5 flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      Mahsulotlarni baholang
                    </p>
                    <div className="space-y-2">
                      {order.items.map((item: any) => {
                        const reviewed = isReviewed(order.id, item.productId);
                        return (
                          <div key={item.id} className="flex items-center gap-2">
                            <img
                              src={item.productImage || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=60&q=60"}
                              className="w-9 h-9 rounded-xl object-cover shrink-0 border border-border/30"
                              alt=""
                            />
                            <p className="flex-1 text-xs font-medium text-foreground line-clamp-1">{item.productName}</p>
                            {reviewed ? (
                              <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold shrink-0">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Sharh qoldirildi
                              </div>
                            ) : (
                              <button
                                onClick={() => setReviewTarget({
                                  orderId: order.id,
                                  productId: item.productId,
                                  productName: item.productName,
                                  productImage: item.productImage,
                                  storeId: (order as any).storeId ?? null,
                                })}
                                className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2.5 py-1.5 rounded-xl transition-colors"
                              >
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                Sharh qoldirish
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Review Modal */}
      {reviewTarget && (
        <ReviewModal
          item={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSuccess={() => {
            markReviewed(reviewTarget.orderId, reviewTarget.productId);
            setReviewTarget(null);
            refetch();
          }}
        />
      )}
    </MobileLayout>
  );
}
