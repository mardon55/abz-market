import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useCartStore } from "@/store/cart-store";
import { useSubmitOrder } from "@/hooks/use-api";
import { formatPrice } from "@/lib/utils";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2, CreditCard, Banknote, LayoutGrid,
  MapPin, Plus, Home, Building2, Map, Phone,
  Truck, Package, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
interface PaymentCard {
  id: string; bankName: string; cardNumber: string; cardHolder: string;
  expiry: string; gradient: string; textColor: string; logo: string; isActive: boolean;
}
interface SavedAddress {
  id: string; label: string; address: string; city: string | null;
  region: string | null; isDefault: boolean;
}
interface PickupPoint {
  id: string; name: string; address: string; city: string;
  phone: string | null; workingHours: string | null; isActive: boolean;
}
interface DeliveryZone {
  id: string; region: string; district: string | null; price: number; isActive: boolean;
}

function loadAdminCards(): PaymentCard[] {
  try {
    const raw = localStorage.getItem("abz_payment_cards");
    const all: PaymentCard[] = raw ? JSON.parse(raw) : [];
    return all.filter((c) => c.isActive);
  } catch { return []; }
}

const LABEL_ICONS: Record<string, string> = { Uy: "🏠", Ish: "🏢", Ofis: "🏗️", Boshqa: "📍" };

// ── Mini card visual ───────────────────────────────────────────────────────────
function MiniCard({ card, selected, onClick }: { card: PaymentCard; selected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative cursor-pointer rounded-2xl overflow-hidden transition-all border-2",
        selected ? "border-primary scale-[1.02] shadow-lg shadow-primary/20" : "border-transparent"
      )}
    >
      <div className={cn("bg-gradient-to-br p-4 h-32", card.gradient)}>
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
        <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-white/10 rounded-full" />
        <div className="relative h-full flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className={cn("text-xs font-bold tracking-wide", card.textColor)}>{card.bankName}</span>
            <span className="text-base">{card.logo}</span>
          </div>
          <div className={cn("font-mono text-[11px] font-bold tracking-widest", card.textColor)}>
            {card.cardNumber || "•••• •••• •••• ••••"}
          </div>
          <div className="flex items-end justify-between">
            <span className={cn("text-[10px] font-semibold uppercase tracking-wide truncate max-w-[60%]", card.textColor)}>{card.cardHolder}</span>
            <span className={cn("text-[10px] font-mono opacity-80", card.textColor)}>{card.expiry}</span>
          </div>
        </div>
      </div>
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
        </div>
      )}
    </div>
  );
}

// ── Schema ─────────────────────────────────────────────────────────────────────
const checkoutSchema = z.object({
  customerName:  z.string().min(3, "Ism kamida 3ta harfdan iborat bo'lishi kerak"),
  customerPhone: z.string().min(9, "To'g'ri telefon raqam kiriting"),
  address:       z.string().min(3, "Manzilni to'liq kiriting"),
  comment:       z.string().optional(),
  paymentMethod: z.enum(["cash", "card", "installment"]),
});
type CheckoutForm = z.infer<typeof checkoutSchema>;

const PAYMENT_METHODS = [
  { id: "cash",        label: "Naqd pul",       icon: Banknote,    desc: "Yetkazib berishda to'lang" },
  { id: "card",        label: "Karta orqali",   icon: CreditCard,  desc: "Bank kartasi bilan to'lash" },
  { id: "installment", label: "Bo'lib to'lash", icon: LayoutGrid,  desc: "Oylik to'lovlarga bo'lish" },
];

// ── Manual address form ────────────────────────────────────────────────────────
interface ManualAddr {
  city: string; street: string; district: string; house: string; phone: string;
}
function buildAddressString(m: ManualAddr): string {
  return [m.city, m.district, m.street, m.house].filter(Boolean).join(", ");
}

// ── Delivery price finder ──────────────────────────────────────────────────────
function findDeliveryPrice(zones: DeliveryZone[], city: string, district: string): number | null {
  if (!zones.length || !city) return null;
  const q = city.toLowerCase();
  const dq = district.toLowerCase();
  // Try district match first
  const districtMatch = zones.find(z => z.isActive && dq && z.district && z.district.toLowerCase().includes(dq));
  if (districtMatch) return districtMatch.price;
  // Then region match
  const regionMatch = zones.find(z => z.isActive && z.region.toLowerCase().includes(q));
  if (regionMatch) return regionMatch.price;
  return null;
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Checkout() {
  const { items, getTotal, clearCart } = useCartStore();
  const createOrder = useSubmitOrder();
  const [, navigate] = useLocation();

  // ── Delivery method ────────────────────────────────────────────────────────
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");

  // ── Delivery zone & price ──────────────────────────────────────────────────
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [deliveryPrice, setDeliveryPrice] = useState<number | null>(null);

  // ── Pickup points ──────────────────────────────────────────────────────────
  const [pickupPoints, setPickupPoints]     = useState<PickupPoint[]>([]);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  // ── Address ────────────────────────────────────────────────────────────────
  const [adminCards, setAdminCards]         = useState<PaymentCard[]>([]);
  const [selectedCard, setSelectedCard]     = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddrId, setSelectedAddrId] = useState<string | null>(null);
  const [showCustom, setShowCustom]         = useState(false);
  const [manualAddr, setManualAddr]         = useState<ManualAddr>({
    city: "", street: "", district: "", house: "", phone: "",
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  const telegramId = (() => {
    try {
      const id = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id;
      if (id) return String(id);
      return localStorage.getItem("tg_user_id") ?? "";
    } catch { return ""; }
  })();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: "cash" },
  });
  const paymentMethod = watch("paymentMethod");

  useEffect(() => {
    setAdminCards(loadAdminCards());

    // Fetch delivery zones
    fetch("/api/delivery-zones?activeOnly=true")
      .then(r => r.json())
      .then(d => setDeliveryZones(d.zones ?? []))
      .catch(() => {});

    // Fetch pickup points
    fetch("/api/pickup-points?activeOnly=true")
      .then(r => r.json())
      .then(d => {
        const pts: PickupPoint[] = d.points ?? [];
        setPickupPoints(pts);
        if (pts.length > 0) setSelectedPointId(pts[0].id);
      })
      .catch(() => {});

    // Fetch saved addresses
    if (telegramId) {
      fetch(`/api/addresses?telegramId=${telegramId}`)
        .then(r => r.json())
        .then(d => {
          const addrs: SavedAddress[] = d.addresses ?? [];
          setSavedAddresses(addrs);
          const def = addrs.find(a => a.isDefault) ?? addrs[0];
          if (def) {
            setSelectedAddrId(def.id);
            const full = [def.address, def.city, def.region].filter(Boolean).join(", ");
            setValue("address", full);
            // Calculate delivery price for saved address
            const price = findDeliveryPrice(deliveryZones, def.city ?? "", "");
            setDeliveryPrice(price);
          } else {
            setShowCustom(true);
          }
        })
        .catch(() => setShowCustom(true));
    } else {
      setShowCustom(true);
    }

    // Pre-fill name & phone from profile
    try {
      const profile = JSON.parse(localStorage.getItem("abz_user_profile") ?? "{}");
      if (profile.firstName) setValue("customerName", `${profile.firstName} ${profile.lastName ?? ""}`.trim());
      if (profile.phone) setValue("customerPhone", profile.phone);
    } catch {}
  }, []);

  // Recalculate delivery price when zones or address changes
  useEffect(() => {
    if (deliveryMethod !== "delivery") { setDeliveryPrice(null); return; }
    let city = "";
    let district = "";
    if (selectedAddrId && !showCustom) {
      const addr = savedAddresses.find(a => a.id === selectedAddrId);
      city = addr?.city ?? "";
      district = addr?.region ?? "";
    } else {
      city = manualAddr.city;
      district = manualAddr.district;
    }
    setDeliveryPrice(findDeliveryPrice(deliveryZones, city, district));
  }, [deliveryMethod, selectedAddrId, showCustom, manualAddr.city, manualAddr.district, deliveryZones, savedAddresses]);

  // When picking up — set address to selected punkt
  useEffect(() => {
    if (deliveryMethod === "pickup") {
      const pt = pickupPoints.find(p => p.id === selectedPointId);
      if (pt) setValue("address", `Punkt: ${pt.name}, ${pt.city}, ${pt.address}`, { shouldValidate: true });
      setDeliveryPrice(null);
    }
  }, [deliveryMethod, selectedPointId, pickupPoints]);

  const selectSavedAddr = (addr: SavedAddress) => {
    setSelectedAddrId(addr.id);
    setShowCustom(false);
    const full = [addr.address, addr.city, addr.region].filter(Boolean).join(", ");
    setValue("address", full, { shouldValidate: true });
  };

  const openCustom = () => {
    setSelectedAddrId(null);
    setShowCustom(true);
    setValue("address", buildAddressString(manualAddr));
  };

  const updateManual = (key: keyof ManualAddr, val: string) => {
    const next = { ...manualAddr, [key]: val };
    setManualAddr(next);
    if (key !== "phone") setValue("address", buildAddressString(next), { shouldValidate: true });
    if (key === "phone") setValue("customerPhone", val, { shouldValidate: true });
  };

  const grandTotal = getTotal() + (deliveryPrice ?? 0);

  const onSubmit = async (data: CheckoutForm) => {
    if (items.length === 0) return;
    // Pickup validation
    if (deliveryMethod === "pickup" && !selectedPointId) return;
    setSubmitError(null);
    try {
      await createOrder.mutateAsync({
        ...data,
        telegramId: telegramId || undefined,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          color: i.selectedColor,
        })),
      });
      clearCart();
      navigate("/orders");
    } catch {
      setSubmitError("Buyurtma berishda xato yuz berdi. Iltimos qayta urining.");
    }
  };

  if (items.length === 0 && !createOrder.isSuccess) {
    navigate("/cart");
    return null;
  }

  return (
    <MobileLayout title="Buyurtma berish" showBack hideNav>
      <div className="p-4 pb-36">
        <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* ── Personal info ── */}
          <div className="glass-card rounded-2xl p-4 shadow-ios-sm space-y-4">
            <h3 className="font-display font-semibold text-base border-b border-white/20 pb-2">Shaxsiy ma'lumotlar</h3>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Ism va Familiya</Label>
              <Input
                {...register("customerName")}
                placeholder="Alisher Usmonov"
                className="rounded-xl h-11 bg-white/30 border-white/30 focus:border-primary/50"
              />
              {errors.customerName && <p className="text-xs text-destructive">{errors.customerName.message}</p>}
            </div>

            {!showCustom && deliveryMethod === "delivery" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Telefon raqam</Label>
                <Input
                  type="tel"
                  {...register("customerPhone")}
                  placeholder="+998 90 123 45 67"
                  className="rounded-xl h-11 bg-white/30 border-white/30 focus:border-primary/50"
                />
                {errors.customerPhone && <p className="text-xs text-destructive">{errors.customerPhone.message}</p>}
              </div>
            )}

            {deliveryMethod === "pickup" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Telefon raqam</Label>
                <Input
                  type="tel"
                  {...register("customerPhone")}
                  placeholder="+998 90 123 45 67"
                  className="rounded-xl h-11 bg-white/30 border-white/30 focus:border-primary/50"
                />
                {errors.customerPhone && <p className="text-xs text-destructive">{errors.customerPhone.message}</p>}
              </div>
            )}
          </div>

          {/* ── Delivery method selector ── */}
          <div className="glass-card rounded-2xl p-4 shadow-ios-sm space-y-3">
            <h3 className="font-display font-semibold text-base border-b border-white/20 pb-2 flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              Yetkazib berish usuli
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {/* Dastavka */}
              <div
                onClick={() => setDeliveryMethod("delivery")}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 cursor-pointer transition-all",
                  deliveryMethod === "delivery"
                    ? "border-primary bg-primary/8"
                    : "border-white/30 bg-white/10 hover:bg-white/20"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  deliveryMethod === "delivery" ? "bg-primary/15" : "bg-white/20"
                )}>
                  <Truck className={cn("w-5 h-5", deliveryMethod === "delivery" ? "text-primary" : "text-muted-foreground")} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-xs">Dastavka</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Manzilingizga</p>
                </div>
                {deliveryMethod === "delivery" && <CheckCircle2 className="w-4 h-4 text-primary absolute top-2 right-2" style={{ position: "absolute", top: 8, right: 8 }} />}
              </div>

              {/* Punktdan olib ketish */}
              <div
                onClick={() => { setDeliveryMethod("pickup"); }}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 cursor-pointer transition-all",
                  deliveryMethod === "pickup"
                    ? "border-emerald-500 bg-emerald-500/8"
                    : "border-white/30 bg-white/10 hover:bg-white/20"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  deliveryMethod === "pickup" ? "bg-emerald-500/15" : "bg-white/20"
                )}>
                  <Package className={cn("w-5 h-5", deliveryMethod === "pickup" ? "text-emerald-600" : "text-muted-foreground")} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-xs">Olib ketish</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Punktdan</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── DELIVERY: Address section ── */}
          {deliveryMethod === "delivery" && (
            <div className="glass-card rounded-2xl p-4 shadow-ios-sm space-y-3">
              <div className="flex items-center justify-between border-b border-white/20 pb-2">
                <h3 className="font-display font-semibold text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Manzil
                </h3>
                {deliveryPrice !== null && (
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    🚚 {formatPrice(deliveryPrice)}
                  </span>
                )}
              </div>

              {/* Saved addresses list */}
              {savedAddresses.length > 0 && (
                <div className="space-y-2">
                  {savedAddresses.map(addr => (
                    <div
                      key={addr.id}
                      onClick={() => selectSavedAddr(addr)}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all",
                        selectedAddrId === addr.id && !showCustom
                          ? "border-primary bg-primary/8"
                          : "border-white/30 bg-white/10 hover:bg-white/20"
                      )}
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0",
                        selectedAddrId === addr.id && !showCustom ? "bg-primary/15" : "bg-white/20"
                      )}>
                        {LABEL_ICONS[addr.label] ?? "📍"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{addr.label}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {[addr.address, addr.city, addr.region].filter(Boolean).join(", ")}
                        </p>
                      </div>
                      {selectedAddrId === addr.id && !showCustom && (
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* "Enter different address" button */}
              {!showCustom && (
                <button
                  type="button"
                  onClick={openCustom}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-primary/30 text-primary text-sm font-semibold hover:bg-primary/5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Boshqa manzil kiritish
                </button>
              )}

              {/* Custom address form */}
              {showCustom && (
                <div className="space-y-3 pt-1">
                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const first = savedAddresses.find(a => a.isDefault) ?? savedAddresses[0];
                        if (first) selectSavedAddr(first);
                      }}
                      className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
                    >
                      ← Saqlangan manzillardan tanlash
                    </button>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Map className="w-3.5 h-3.5" /> Viloyat / Shahar
                    </Label>
                    <Input
                      value={manualAddr.city}
                      onChange={e => updateManual("city", e.target.value)}
                      placeholder="Toshkent shahri"
                      className="rounded-xl h-11 bg-white/30 border-white/30 focus:border-primary/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" /> Tuman
                    </Label>
                    <Input
                      value={manualAddr.district}
                      onChange={e => updateManual("district", e.target.value)}
                      placeholder="Yunusobod tumani"
                      className="rounded-xl h-11 bg-white/30 border-white/30 focus:border-primary/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Ko'cha
                    </Label>
                    <Input
                      value={manualAddr.street}
                      onChange={e => updateManual("street", e.target.value)}
                      placeholder="Amir Temur ko'chasi"
                      className="rounded-xl h-11 bg-white/30 border-white/30 focus:border-primary/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5" /> Uy / Kvartira
                    </Label>
                    <Input
                      value={manualAddr.house}
                      onChange={e => updateManual("house", e.target.value)}
                      placeholder="12-uy, 5-xonadon"
                      className="rounded-xl h-11 bg-white/30 border-white/30 focus:border-primary/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> Telefon raqami
                    </Label>
                    <Input
                      type="tel"
                      value={manualAddr.phone}
                      onChange={e => updateManual("phone", e.target.value)}
                      placeholder="+998 90 123 45 67"
                      className="rounded-xl h-11 bg-white/30 border-white/30 focus:border-primary/50"
                    />
                  </div>

                  {/* Delivery price notification */}
                  {deliveryPrice !== null && (
                    <div className="flex items-center gap-2 p-3 bg-primary/8 rounded-xl border border-primary/20">
                      <Truck className="w-4 h-4 text-primary shrink-0" />
                      <p className="text-xs font-semibold text-primary">
                        Bu hudud uchun dastavka narxi: {formatPrice(deliveryPrice)}
                      </p>
                    </div>
                  )}
                  {manualAddr.city && deliveryPrice === null && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                      <p className="text-xs text-amber-700">
                        Bu hudud uchun dastavka narxi aniqlanmadi. Operator aloqa qiladi.
                      </p>
                    </div>
                  )}

                  {errors.address && (
                    <p className="text-xs text-destructive">Manzilni to'liq to'ldiring</p>
                  )}
                </div>
              )}

              <input type="hidden" {...register("address")} />
              <input type="hidden" {...register("customerPhone")} />
            </div>
          )}

          {/* ── PICKUP: Select punkt ── */}
          {deliveryMethod === "pickup" && (
            <div className="glass-card rounded-2xl p-4 shadow-ios-sm space-y-3">
              <h3 className="font-display font-semibold text-base border-b border-white/20 pb-2 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                Punkt tanlang
              </h3>

              {pickupPoints.length === 0 ? (
                <div className="py-8 text-center">
                  <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Hozircha aktiv punkt yo'q</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pickupPoints.map(pt => (
                    <div
                      key={pt.id}
                      onClick={() => {
                        setSelectedPointId(pt.id);
                        setValue("address", `Punkt: ${pt.name}, ${pt.city}, ${pt.address}`, { shouldValidate: true });
                      }}
                      className={cn(
                        "p-3 rounded-xl border-2 cursor-pointer transition-all",
                        selectedPointId === pt.id
                          ? "border-emerald-500 bg-emerald-500/8"
                          : "border-white/30 bg-white/10 hover:bg-white/20"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                          selectedPointId === pt.id ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-white/20"
                        )}>
                          <Package className={cn("w-4.5 h-4.5", selectedPointId === pt.id ? "text-emerald-600" : "text-muted-foreground")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm">{pt.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                            <p className="text-xs text-muted-foreground truncate">{pt.city}, {pt.address}</p>
                          </div>
                          {pt.workingHours && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                              <p className="text-xs text-muted-foreground">{pt.workingHours}</p>
                            </div>
                          )}
                          {pt.phone && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                              <p className="text-xs text-muted-foreground">{pt.phone}</p>
                            </div>
                          )}
                        </div>
                        {selectedPointId === pt.id && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Free pickup notice */}
              <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700/40">
                <Package className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Punktdan olib ketish — bepul!
                </p>
              </div>

              <input type="hidden" {...register("address")} />
              <input type="hidden" {...register("customerPhone")} />
            </div>
          )}

          {/* ── Payment method ── */}
          <div className="glass-card rounded-2xl p-4 shadow-ios-sm space-y-3">
            <h3 className="font-display font-semibold text-base border-b border-white/20 pb-2">To'lov usuli</h3>

            <div className="space-y-2">
              {PAYMENT_METHODS.map(({ id, label, icon: Icon, desc }) => (
                <div
                  key={id}
                  onClick={() => {
                    setValue("paymentMethod", id as any);
                    if (id !== "card") setSelectedCard(null);
                  }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer",
                    paymentMethod === id
                      ? "border-primary bg-primary/8"
                      : "border-white/30 bg-white/10 hover:bg-white/20"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    paymentMethod === id ? "bg-primary/15" : "bg-white/20"
                  )}>
                    <Icon className={cn("w-5 h-5", paymentMethod === id ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  {paymentMethod === id && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
                </div>
              ))}
            </div>

            {paymentMethod === "card" && adminCards.length > 0 && (
              <div className="mt-1 pt-3 border-t border-white/20">
                <p className="text-xs font-semibold text-muted-foreground mb-2.5">Kartani tanlang:</p>
                <div className="grid grid-cols-2 gap-2">
                  {adminCards.map((card) => (
                    <MiniCard key={card.id} card={card} selected={selectedCard === card.id} onClick={() => setSelectedCard(card.id)} />
                  ))}
                </div>
                {!selectedCard && <p className="text-xs text-amber-600 mt-2 font-medium">⚠️ Karta tanlanmagan</p>}
              </div>
            )}

            {paymentMethod === "card" && adminCards.length === 0 && (
              <div className="mt-1 pt-3 border-t border-white/20">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-700">Hozircha karta to'lov usuli mavjud emas.</p>
                </div>
              </div>
            )}

            {paymentMethod === "installment" && (
              <div className="mt-1 pt-3 border-t border-white/20">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <p className="text-xs text-blue-700 font-medium">📋 Qo'shimcha hujjatlar talab etiladi. Operatorimiz siz bilan bog'lanadi.</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Comment ── */}
          <div className="glass-card rounded-2xl p-4 shadow-ios-sm">
            <Label className="text-xs font-semibold text-muted-foreground block mb-1.5">
              Qo'shimcha izoh (ixtiyoriy)
            </Label>
            <Input
              {...register("comment")}
              placeholder="Masalan: Uyga kirish orqa tarafdan"
              className="rounded-xl h-11 bg-white/30 border-white/30 focus:border-primary/50"
            />
          </div>

          {/* ── Order summary ── */}
          <div className="glass-card rounded-2xl p-4 shadow-ios-sm space-y-2">
            <h3 className="font-display font-semibold text-sm text-muted-foreground border-b border-white/20 pb-2">Buyurtma xulosasi</h3>
            {items.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground truncate max-w-[60%]">{item.product.name} × {item.quantity}</span>
                <span className="font-semibold">{formatPrice(item.product.price * item.quantity)}</span>
              </div>
            ))}
            {/* Delivery row */}
            {deliveryMethod === "delivery" && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" /> Dastavka
                </span>
                <span className={cn("font-semibold", deliveryPrice !== null ? "text-primary" : "text-muted-foreground")}>
                  {deliveryPrice !== null ? formatPrice(deliveryPrice) : "Aniqlanadi"}
                </span>
              </div>
            )}
            {deliveryMethod === "pickup" && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" /> Olib ketish
                </span>
                <span className="font-semibold text-emerald-600">Bepul</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-white/20">
              <span className="font-bold">Jami:</span>
              <span className="font-display font-extrabold text-primary text-lg">{formatPrice(grandTotal)}</span>
            </div>
          </div>

        </form>
      </div>

      {/* ── Fixed bottom bar ── */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto glass border-t border-white/30 p-4 pb-safe z-50">
        {submitError && (
          <div className="mb-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700 font-medium">
            ⚠️ {submitError}
          </div>
        )}
        <Button
          type="submit"
          form="checkout-form"
          disabled={
            createOrder.isPending ||
            (paymentMethod === "card" && adminCards.length > 0 && !selectedCard) ||
            (deliveryMethod === "pickup" && pickupPoints.length > 0 && !selectedPointId)
          }
          className="w-full h-14 rounded-2xl font-bold shadow-lg shadow-primary/25 text-base"
        >
          {createOrder.isPending
            ? "Buyurtma berilmoqda..."
            : `✅ Buyurtmani tasdiqlash · ${formatPrice(grandTotal)}`}
        </Button>
      </div>
    </MobileLayout>
  );
}
