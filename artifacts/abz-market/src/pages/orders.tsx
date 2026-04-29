import { useState, useMemo } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useOrders } from "@/hooks/use-api";
import { formatPrice, getStatusColor, getStatusLabel } from "@/lib/utils";
import {
  PackageOpen, Clock, ChevronRight, AlertCircle, Star, CheckCircle2,
  XCircle, RotateCcw, ChevronDown, Info,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
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

function getReviewedKey(orderId: string, productId: string) {
  return `reviewed_${orderId}_${productId}`;
}

// ── Cancel reasons ────────────────────────────────────────────────────────────
const CANCEL_REASONS = [
  "Fikrimni o'zgartirdim",
  "Noto'g'ri mahsulot tanladim",
  "Tovar narxi yuqori",
  "Boshqa do'kondan topdim",
  "Buyurtma juda uzoq kelmoqda",
  "Moliyaviy sabab",
  "Boshqa sabab",
];

// ── Return reasons ────────────────────────────────────────────────────────────
const RETURN_REASONS = [
  "Mahsulot tavsifga mos kelmadi",
  "Mahsulot shikastlangan / nuqsonli yetkazildi",
  "Noto'g'ri o'lcham / rang",
  "Sifat yomon",
  "Menga zarur emas (noto'g'ri buyurtma)",
  "Rasm va haqiqiy mahsulot farq qildi",
  "Boshqa sabab",
];

// ── Return/Cancel policy ──────────────────────────────────────────────────────
const CANCEL_DAYS  = 3;   // Buyurtma berilgandan keyin necha kun ichida bekor qilish mumkin
const RETURN_DAYS  = 7;   // Yetkazib berilgandan keyin necha kun ichida qaytarish mumkin

function canCancel(order: any): boolean {
  if (!["new", "accepted"].includes(order.status)) return false;
  const diffDays = differenceInDays(new Date(), new Date(order.createdAt));
  return diffDays < CANCEL_DAYS;
}

function canReturn(order: any): boolean {
  if (order.status !== "delivered") return false;
  const refDate = order.deliveredAt ?? order.createdAt;
  const diffDays = differenceInDays(new Date(), new Date(refDate));
  return diffDays < RETURN_DAYS;
}

function daysLeft(order: any, type: "cancel" | "return"): number {
  const refDate = type === "cancel"
    ? order.createdAt
    : (order.deliveredAt ?? order.createdAt);
  const limit = type === "cancel" ? CANCEL_DAYS : RETURN_DAYS;
  const elapsed = differenceInDays(new Date(), new Date(refDate));
  return Math.max(0, limit - elapsed);
}

// ── Cancel Modal ──────────────────────────────────────────────────────────────
function CancelModal({
  order,
  onClose,
  onSuccess,
}: { order: any; onClose: () => void; onSuccess: () => void }) {
  const [reason, setReason]   = useState(CANCEL_REASONS[0]);
  const [custom, setCustom]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const finalReason = reason === "Boshqa sabab" ? custom.trim() : reason;

  async function handleSubmit() {
    if (reason === "Boshqa sabab" && !custom.trim()) {
      setError("Iltimos, sababni kiriting");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled", reason: finalReason }),
      });
      if (!res.ok) throw new Error();
      onSuccess();
    } catch {
      setError("Xato yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full bg-background rounded-t-3xl shadow-2xl flex flex-col max-h-[80svh]">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-6 pt-3 pb-4 space-y-5">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-base">Buyurtmani bekor qilish</h3>
              <p className="text-xs text-muted-foreground">{order.orderNumber}</p>
            </div>
          </div>
          {/* Policy note */}
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 space-y-1">
              <p className="font-semibold">Bekor qilish qoidasi</p>
              <p>Buyurtma berilgan sanadan <strong>{CANCEL_DAYS} kun</strong> ichida bekor qilish mumkin.</p>
              <p className="text-amber-700">Sizda <strong>{daysLeft(order, "cancel")} kun</strong> qolgan.</p>
            </div>
          </div>
          {/* Reason selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bekor qilish sababi</label>
            <div className="relative">
              <select value={reason} onChange={(e) => setReason(e.target.value)}
                className="w-full h-11 pl-4 pr-10 bg-secondary border border-border rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20">
                {CANCEL_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            {reason === "Boshqa sabab" && (
              <textarea value={custom} onChange={(e) => setCustom(e.target.value)}
                placeholder="Sababni yozing..." rows={3}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
            )}
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        {/* Buttons — always visible, above nav bar */}
        <div className="shrink-0 px-6 pt-4 pb-6 border-t border-border/50 flex gap-3">
          <button onClick={onClose}
            className="flex-1 h-13 rounded-2xl border-2 border-border text-sm font-semibold hover:bg-secondary transition-colors">
            Orqaga
          </button>
          <button onClick={handleSubmit} disabled={loading} data-testid="confirm-cancel-btn"
            className="flex-1 h-13 rounded-2xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50">
            {loading ? "Yuborilmoqda..." : "Bekor qilish"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Return Modal ──────────────────────────────────────────────────────────────
function ReturnModal({
  order,
  onClose,
  onSuccess,
}: { order: any; onClose: () => void; onSuccess: () => void }) {
  const [reason, setReason]   = useState(RETURN_REASONS[0]);
  const [custom, setCustom]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const finalReason = reason === "Boshqa sabab" ? custom.trim() : reason;

  async function handleSubmit() {
    if (reason === "Boshqa sabab" && !custom.trim()) {
      setError("Iltimos, sababni kiriting");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "return_requested", reason: finalReason }),
      });
      if (!res.ok) throw new Error();
      onSuccess();
    } catch {
      setError("Xato yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full bg-background rounded-t-3xl shadow-2xl flex flex-col max-h-[80svh]">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-6 pt-3 pb-4 space-y-5">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-base">Mahsulotni qaytarish</h3>
              <p className="text-xs text-muted-foreground">{order.orderNumber}</p>
            </div>
          </div>
          {/* Policy note */}
          <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800 space-y-1">
              <p className="font-semibold">Qaytarish qoidalari</p>
              <p>Mahsulot yetkazilgan sanadan <strong>{RETURN_DAYS} kun</strong> ichida qaytarish mumkin.</p>
              <p>Mahsulot <strong>original qadoqda</strong> va <strong>ishlatilmagan holda</strong> bo'lishi kerak.</p>
              <p className="text-blue-700">Sizda <strong>{daysLeft(order, "return")} kun</strong> qolgan.</p>
            </div>
          </div>
          {/* Reason selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Qaytarish sababi</label>
            <div className="relative">
              <select value={reason} onChange={(e) => setReason(e.target.value)}
                className="w-full h-11 pl-4 pr-10 bg-secondary border border-border rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20">
                {RETURN_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            {reason === "Boshqa sabab" && (
              <textarea value={custom} onChange={(e) => setCustom(e.target.value)}
                placeholder="Sababni yozing..." rows={3}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
            )}
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        {/* Buttons — always visible, above nav bar */}
        <div className="shrink-0 px-6 pt-4 pb-6 border-t border-border/50 flex gap-3">
          <button onClick={onClose}
            className="flex-1 h-13 rounded-2xl border-2 border-border text-sm font-semibold hover:bg-secondary transition-colors">
            Orqaga
          </button>
          <button onClick={handleSubmit} disabled={loading} data-testid="confirm-return-btn"
            className="flex-1 h-13 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50">
            {loading ? "Yuborilmoqda..." : "Qaytarish so'rovi"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Orders() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const telegramId = useMemo(() => getTelegramId(), []);
  const [reviewTarget, setReviewTarget] = useState<{
    orderId: string; productId: string; productName: string;
    productImage: string | null; storeId: string | null;
  } | null>(null);
  const [sessionReviewed, setSessionReviewed] = useState<Set<string>>(new Set());
  const [cancelTarget, setCancelTarget] = useState<any | null>(null);
  const [returnTarget, setReturnTarget]   = useState<any | null>(null);

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (activeTab !== "all") p.status = activeTab;
    if (telegramId) p.telegramId = telegramId;
    return Object.keys(p).length > 0 ? p : undefined;
  }, [activeTab, telegramId]);

  const { data, isLoading, isError, refetch } = useOrders(params as any, { refetchInterval: 15_000 });

  const tabs = [
    { id: "all",              label: "Barchasi" },
    { id: "new",              label: "Yangi" },
    { id: "accepted",         label: "Jarayonda" },
    { id: "shipped",          label: "Yuborilgan" },
    { id: "delivered",        label: "Yetkazildi" },
    { id: "cancelled",        label: "Bekor" },
    { id: "return_requested", label: "Qaytarish" },
    { id: "returned",         label: "Qaytarildi" },
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
              data-testid={`orders-tab-${tab.id}`}
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
            const isDelivered        = order.status === "delivered";
            const showCancel         = canCancel(order);
            const showReturn         = canReturn(order);
            const isReturnRequested  = order.status === "return_requested";
            const isReturned         = order.status === "returned";

            return (
              <div key={order.id} className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
                {/* Card header — clickable to detail */}
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

                {/* ── Cancel button (3 kun ichida, new/accepted) ── */}
                {showCancel && (
                  <div className="border-t border-border/50 bg-red-50/40 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-red-700 font-medium flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        Bekor qilish: {daysLeft(order, "cancel")} kun qoldi
                      </p>
                      <button
                        data-testid="cancel-order-btn"
                        onClick={() => setCancelTarget(order)}
                        className="flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 border border-red-300 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <XCircle className="w-3 h-3" />
                        Bekor qilish
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Return button (7 kun ichida, delivered) ── */}
                {showReturn && (
                  <div className="border-t border-border/50 bg-blue-50/40 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-blue-700 font-medium flex items-center gap-1">
                        <RotateCcw className="w-3.5 h-3.5" />
                        Qaytarish: {daysLeft(order, "return")} kun qoldi
                      </p>
                      <button
                        data-testid="return-order-btn"
                        onClick={() => setReturnTarget(order)}
                        className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 border border-blue-300 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Qaytarish
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Return requested badge ── */}
                {isReturnRequested && (
                  <div className="border-t border-border/50 bg-orange-50/60 px-4 py-3">
                    <p className="text-xs text-orange-700 font-semibold flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5" />
                      Qaytarish so'rovi yuborildi — admin ko'rib chiqmoqda
                    </p>
                    {(order as any).returnReason && (
                      <p className="text-xs text-orange-600 mt-1">Sabab: {(order as any).returnReason}</p>
                    )}
                  </div>
                )}

                {/* ── Returned confirmation ── */}
                {isReturned && (
                  <div className="border-t border-border/50 bg-emerald-50/60 px-4 py-3">
                    <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Qaytarish tasdiqlandi — pul mablag'i qaytariladi
                    </p>
                  </div>
                )}

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

      {/* Cancel Modal */}
      {cancelTarget && (
        <CancelModal
          order={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onSuccess={() => { setCancelTarget(null); refetch(); }}
        />
      )}

      {/* Return Modal */}
      {returnTarget && (
        <ReturnModal
          order={returnTarget}
          onClose={() => setReturnTarget(null)}
          onSuccess={() => { setReturnTarget(null); refetch(); }}
        />
      )}
    </MobileLayout>
  );
}
