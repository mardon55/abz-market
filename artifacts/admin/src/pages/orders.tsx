import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Eye, CheckCircle, XCircle, Truck, Clock,
  X, Phone, MapPin, CreditCard, Package, RefreshCw,
  ShoppingBag, Star, RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
type OrderStatus = "new" | "accepted" | "shipped" | "delivered" | "cancelled" | "return_requested" | "returned";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  price: string;
  color: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  address: string;
  comment: string | null;
  paymentMethod: string;
  totalPrice: string;
  createdAt: string;
  storeName: string | null;
  cancelReason: string | null;
  returnReason: string | null;
  deliveredAt: string | null;
  items: OrderItem[];
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS: Record<OrderStatus, { label: string; badgeClass: string; icon: any; color: string; bg: string; border: string }> = {
  new:              { label: "Yangi",           badgeClass: "badge badge-primary", icon: Clock,       color: "text-violet-700",  bg: "bg-violet-50",   border: "border-violet-300" },
  accepted:         { label: "Jarayonda",       badgeClass: "badge badge-warning", icon: ShoppingBag, color: "text-amber-700",   bg: "bg-amber-50",    border: "border-amber-300" },
  shipped:          { label: "Yuborildi",       badgeClass: "badge badge-info",    icon: Truck,       color: "text-blue-700",    bg: "bg-blue-50",     border: "border-blue-300" },
  delivered:        { label: "Yetkazildi",      badgeClass: "badge badge-success", icon: Star,        color: "text-emerald-700", bg: "bg-emerald-50",  border: "border-emerald-300" },
  cancelled:        { label: "Bekor",           badgeClass: "badge badge-danger",  icon: XCircle,     color: "text-red-700",     bg: "bg-red-50",      border: "border-red-300" },
  return_requested: { label: "Qaytarish so'rovi", badgeClass: "badge",            icon: RotateCcw,   color: "text-orange-700",  bg: "bg-orange-50",   border: "border-orange-300" },
  returned:         { label: "Qaytarildi",      badgeClass: "badge",               icon: CheckCircle, color: "text-teal-700",    bg: "bg-teal-50",     border: "border-teal-300" },
};

// Main flow (linear steps), cancel is separate
const FLOW_STEPS: OrderStatus[] = ["new", "accepted", "shipped", "delivered"];

const PAY_LABEL: Record<string, string> = {
  cash:        "Naqd pul",
  card:        "Karta orqali",
  installment: "Bo'lib to'lash",
};

function fmt(n: number) { return n.toLocaleString("ru-RU") + " so'm"; }

function fmtDate(d: string) {
  return new Date(d).toLocaleString("uz-UZ", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── API helpers ───────────────────────────────────────────────────────────────
async function fetchOrders(status?: string): Promise<{ orders: Order[] }> {
  const url = status && status !== "all" ? `/api/orders?status=${status}` : "/api/orders";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Buyurtmalarni yuklashda xato");
  return res.json();
}

async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const res = await fetch(`/api/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Holatni yangilashda xato");
  return res.json();
}

// ── Status pipeline step ───────────────────────────────────────────────────────
function StepButton({
  step, current, onClick, isPending, loadingStep,
}: {
  step: OrderStatus;
  current: OrderStatus;
  onClick: (s: OrderStatus) => void;
  isPending: boolean;
  loadingStep: OrderStatus | null;
}) {
  const S = STATUS[step];
  const Icon = S.icon;
  const isCurrent = step === current;
  const isLoading = loadingStep === step && isPending;
  const currentIdx = FLOW_STEPS.indexOf(current);
  const stepIdx    = FLOW_STEPS.indexOf(step);
  const isDone     = current !== "cancelled" && stepIdx < currentIdx;

  return (
    <button
      disabled={isCurrent || isPending}
      onClick={() => !isCurrent && onClick(step)}
      className={cn(
        "flex flex-col items-center gap-1.5 flex-1 py-3 px-2 rounded-2xl border-2 transition-all",
        isCurrent
          ? cn("border-2 cursor-default shadow-sm", S.border, S.bg)
          : isDone
          ? "border-emerald-200 bg-emerald-50/60 cursor-pointer hover:bg-emerald-100"
          : "border-border/50 bg-muted/30 cursor-pointer hover:bg-muted/60 hover:border-border",
        isPending && !isCurrent && "opacity-50 cursor-not-allowed",
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-xl flex items-center justify-center",
        isCurrent ? S.bg : isDone ? "bg-emerald-100" : "bg-muted",
      )}>
        {isLoading ? (
          <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
        ) : isDone ? (
          <CheckCircle className="w-4 h-4 text-emerald-600" />
        ) : (
          <Icon className={cn("w-4 h-4", isCurrent ? S.color : "text-muted-foreground")} />
        )}
      </div>
      <span className={cn(
        "text-[11px] font-semibold leading-tight text-center",
        isCurrent ? S.color : isDone ? "text-emerald-700" : "text-muted-foreground",
      )}>
        {S.label}
      </span>
      {isCurrent && (
        <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">Hozirgi</span>
      )}
    </button>
  );
}

// ── Order detail modal ────────────────────────────────────────────────────────
function OrderModal({ order: initialOrder, onClose }: { order: Order; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [order, setOrder] = useState<Order>(initialOrder);
  const [loadingStep, setLoadingStep] = useState<OrderStatus | null>(null);

  const S = STATUS[order.status] ?? STATUS.new;

  const mutation = useMutation({
    mutationFn: ({ status }: { status: OrderStatus }) => updateOrderStatus(order.id, status),
    onSuccess: (updated) => {
      setOrder(updated);
      setLoadingStep(null);
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: () => setLoadingStep(null),
  });

  const handleStatusChange = (status: OrderStatus) => {
    setLoadingStep(status);
    mutation.mutate({ status });
  };

  const isCancelled        = order.status === "cancelled";
  const isReturnRequested  = order.status === "return_requested";
  const isReturned         = order.status === "returned";
  const isSpecialStatus    = isCancelled || isReturnRequested || isReturned;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-lg h-full bg-background shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-card shrink-0">
          <div>
            <h2 className="font-display font-bold text-base">Buyurtma tafsilotlari</h2>
            <p className="font-mono text-xs text-primary mt-0.5">{order.orderNumber}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* ── STATUS PIPELINE ── */}
          <div className="bg-card border border-border/60 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Buyurtma holati</h3>
              <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", S.bg, S.color, "border", S.border)}>
                {S.label}
              </span>
            </div>

            {/* Steps row */}
            {!isSpecialStatus && (
              <div className="flex gap-1.5 mb-3">
                {FLOW_STEPS.map((step) => (
                  <StepButton
                    key={step}
                    step={step}
                    current={order.status}
                    onClick={handleStatusChange}
                    isPending={mutation.isPending}
                    loadingStep={loadingStep}
                  />
                ))}
              </div>
            )}

            {/* Cancelled state */}
            {isCancelled && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-3">
                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-red-700">Buyurtma bekor qilindi</p>
                  {order.cancelReason && <p className="text-xs text-red-500 mt-0.5">Sabab: {order.cancelReason}</p>}
                  <p className="text-xs text-red-400 mt-0.5">Qayta tiklash uchun "Yangi" bosqichini bosing</p>
                </div>
              </div>
            )}

            {/* Return requested state */}
            {isReturnRequested && (
              <div className="space-y-2 mb-3">
                <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                  <RotateCcw className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-orange-700">Mijoz qaytarish so'rovi yubordi</p>
                    {order.returnReason && <p className="text-xs text-orange-600 mt-0.5">Sabab: {order.returnReason}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={mutation.isPending}
                    onClick={() => handleStatusChange("returned")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border-2 border-teal-200 bg-teal-50 text-teal-700 text-sm font-semibold transition-all hover:bg-teal-100",
                      mutation.isPending && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <CheckCircle className="w-4 h-4" /> Qaytarishni tasdiqlash
                  </button>
                  <button
                    disabled={mutation.isPending}
                    onClick={() => handleStatusChange("delivered")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border-2 border-border bg-muted text-muted-foreground text-sm font-semibold transition-all hover:bg-muted/80",
                      mutation.isPending && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <XCircle className="w-4 h-4" /> Rad etish
                  </button>
                </div>
              </div>
            )}

            {/* Returned state */}
            {isReturned && (
              <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 mb-3">
                <CheckCircle className="w-5 h-5 text-teal-500 shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-teal-700">Qaytarish tasdiqlandi</p>
                  {order.returnReason && <p className="text-xs text-teal-500 mt-0.5">Sabab: {order.returnReason}</p>}
                </div>
              </div>
            )}

            {/* Cancel / restore button */}
            <div className="flex gap-2">
              {!isSpecialStatus ? (
                <button
                  disabled={mutation.isPending}
                  onClick={() => handleStatusChange("cancelled")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border-2 border-red-200 bg-red-50 text-red-700 text-sm font-semibold transition-all hover:bg-red-100",
                    mutation.isPending && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {loadingStep === "cancelled" && mutation.isPending
                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                    : <XCircle className="w-4 h-4" />
                  }
                  Bekor qilish
                </button>
              ) : (
                <button
                  disabled={mutation.isPending}
                  onClick={() => handleStatusChange("new")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border-2 border-violet-200 bg-violet-50 text-violet-700 text-sm font-semibold transition-all hover:bg-violet-100",
                    mutation.isPending && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {loadingStep === "new" && mutation.isPending
                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                    : <Clock className="w-4 h-4" />
                  }
                  Qayta ochish (Yangi)
                </button>
              )}
            </div>

            {mutation.isError && (
              <p className="text-destructive text-xs mt-2">⚠️ Xato yuz berdi. Qayta urining.</p>
            )}
          </div>

          {/* Status + date row */}
          <div className="flex items-center justify-between bg-muted/40 rounded-2xl px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">Sana</p>
              <p className="text-xs font-semibold mt-0.5">{fmtDate(order.createdAt)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">To'lov</p>
              <p className="text-xs font-semibold mt-0.5">{PAY_LABEL[order.paymentMethod] ?? order.paymentMethod}</p>
            </div>
          </div>

          {/* Customer info */}
          <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-2.5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Mijoz ma'lumotlari</h3>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{order.customerName[0]}</span>
              </div>
              <div>
                <p className="font-semibold text-sm">{order.customerName}</p>
                {order.storeName && <p className="text-xs text-muted-foreground">{order.storeName}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <a href={`tel:${order.customerPhone}`} className="hover:text-primary transition-colors">{order.customerPhone}</a>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <span>{order.address}</span>
            </div>
            {order.comment && (
              <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                💬 {order.comment}
              </div>
            )}
          </div>

          {/* Payment total */}
          <div className="flex items-center gap-3 bg-card border border-border/60 rounded-2xl px-4 py-3">
            <CreditCard className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">To'lov usuli</p>
              <p className="text-sm font-semibold">{PAY_LABEL[order.paymentMethod] ?? order.paymentMethod}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-muted-foreground">Jami</p>
              <p className="font-bold text-primary">{fmt(Number(order.totalPrice))}</p>
            </div>
          </div>

          {/* Items */}
          <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border/40 bg-muted/30">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <Package className="w-3.5 h-3.5 inline mr-1" />Mahsulotlar ({order.items.length})
              </h3>
            </div>
            <div className="divide-y divide-border/40">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                  {item.productImage ? (
                    <img src={item.productImage} alt={item.productName} className="w-10 h-10 rounded-xl object-cover bg-muted shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} ta × {fmt(Number(item.price))}
                      {item.color && ` · ${item.color}`}
                    </p>
                  </div>
                  <p className="font-bold text-sm shrink-0">{fmt(Number(item.price) * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border/60 bg-card px-5 py-4">
          <button onClick={onClose} className="w-full h-10 bg-muted rounded-xl text-sm font-semibold hover:bg-muted/80 transition-colors">
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Orders() {
  const [search, setSearch]   = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Order | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-orders", statusFilter],
    queryFn: () => fetchOrders(statusFilter),
    refetchInterval: 15_000,
  });

  const orders: Order[] = data?.orders ?? [];

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.customerName.toLowerCase().includes(q) ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerPhone.includes(q)
    );
  });

  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const TABS = [
    { key: "all",              label: `Barchasi (${orders.length})` },
    { key: "new",              label: `Yangi (${counts.new || 0})` },
    { key: "accepted",         label: `Jarayonda (${counts.accepted || 0})` },
    { key: "shipped",          label: `Yuborildi (${counts.shipped || 0})` },
    { key: "delivered",        label: `Yetkazildi (${counts.delivered || 0})` },
    { key: "cancelled",        label: `Bekor (${counts.cancelled || 0})` },
    { key: "return_requested", label: `Qaytarish so'rovi (${counts.return_requested || 0})` },
    { key: "returned",         label: `Qaytarildi (${counts.returned || 0})` },
  ];

  // Keep selected order in sync after status update
  const handleSelect = (o: Order) => setSelected(o);
  const handleClose  = () => {
    setSelected(null);
    refetch();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Buyurtmalar</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{orders.length} ta buyurtma</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 bg-muted border border-border/60 text-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-muted/80 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" /> Yangilash
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all",
              statusFilter === tab.key
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
          placeholder="Ism, ID yoki telefon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 h-9 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="space-y-0 divide-y divide-border/40">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-4 animate-pulse">
                <div className="w-20 h-4 bg-muted rounded" />
                <div className="flex-1 h-4 bg-muted rounded" />
                <div className="w-24 h-4 bg-muted rounded" />
                <div className="w-16 h-4 bg-muted rounded" />
                <div className="w-20 h-6 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-3">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
            <p className="font-semibold text-sm">API ga ulanishda xato</p>
            <p className="text-xs text-muted-foreground mt-1 mb-3">API server ishlamasligi mumkin</p>
            <button onClick={() => refetch()} className="text-xs text-primary hover:underline flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Qayta urinish
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Package className="w-10 h-10 text-muted-foreground opacity-30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Buyurtmalar yo'q</p>
          </div>
        ) : (
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
                  const S = STATUS[o.status] ?? STATUS.new;
                  return (
                    <tr key={o.id} className="table-row-hover cursor-pointer" onClick={() => handleSelect(o)}>
                      <td className="px-4 py-3">
                        <span className="font-mono font-semibold text-primary text-xs">{o.orderNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{o.customerName}</div>
                        <div className="text-xs text-muted-foreground">{o.customerPhone}</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="max-w-[180px] truncate text-muted-foreground text-xs">
                          {o.items[0]?.productName ?? "—"}
                          {o.items.length > 1 && ` +${o.items.length - 1}`}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold">{fmt(Number(o.totalPrice))}</div>
                        <div className="text-xs text-muted-foreground">{o.items.length} ta</div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground text-xs">
                        {fmtDate(o.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={S.badgeClass}>{S.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSelect(o); }}
                            className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-violet-100 hover:text-violet-700 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 py-3 border-t border-border/40 text-xs text-muted-foreground flex items-center justify-between">
          <span>{filtered.length} ta natija</span>
          <span className="text-[10px] opacity-60">Har 15 soniyada yangilanadi</span>
        </div>
      </div>

      {/* Detail modal */}
      {selected && <OrderModal order={selected} onClose={handleClose} />}
    </div>
  );
}
