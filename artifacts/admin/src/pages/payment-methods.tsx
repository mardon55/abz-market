import { useState } from "react";
import { Plus, Trash2, CreditCard, X, Eye, EyeOff, Check, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface PaymentCard {
  id: string;
  bankName: string;
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  gradient: string;
  textColor: string;
  logo: string;
  isActive: boolean;
}

const STORAGE_KEY = "abz_payment_cards";

function loadCards(): PaymentCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveCards(cards: PaymentCard[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cards)); } catch {}
}

// ── Bank presets ──────────────────────────────────────────────────────────────
const BANKS = [
  { name: "Uzcard",     gradient: "from-[#1A3A6B] to-[#0D6EFD]",     textColor: "text-white",  logo: "🇺🇿" },
  { name: "Humo",       gradient: "from-[#C0392B] to-[#E74C3C]",      textColor: "text-white",  logo: "🔴" },
  { name: "Visa",       gradient: "from-[#1A1F71] to-[#2A3080]",      textColor: "text-white",  logo: "💳" },
  { name: "Mastercard", gradient: "from-[#1C1C1C] to-[#333333]",      textColor: "text-white",  logo: "🔵" },
  { name: "Kapitalbank", gradient: "from-[#F39C12] to-[#E67E22]",     textColor: "text-white",  logo: "🏦" },
  { name: "Ipak Yo'li", gradient: "from-[#16A085] to-[#1ABC9C]",      textColor: "text-white",  logo: "🟢" },
  { name: "Hamkorbank", gradient: "from-[#8E44AD] to-[#9B59B6]",      textColor: "text-white",  logo: "🟣" },
  { name: "Custom",     gradient: "from-[#2C3E50] to-[#34495E]",      textColor: "text-white",  logo: "💰" },
];

// ── Card visual component ─────────────────────────────────────────────────────
function CardPreview({ card, small = false }: { card: PaymentCard; small?: boolean }) {
  return (
    <div className={cn(
      `relative bg-gradient-to-br ${card.gradient} rounded-2xl overflow-hidden select-none`,
      small ? "w-full h-24 p-3" : "w-full max-w-sm h-44 p-5"
    )}>
      {/* Decorative circles */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
      <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/10 rounded-full" />

      <div className="relative h-full flex flex-col justify-between">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <span className={cn("font-bold", small ? "text-sm" : "text-base", card.textColor)}>{card.bankName}</span>
          <span className={small ? "text-lg" : "text-2xl"}>{card.logo}</span>
        </div>

        {/* Middle: card number */}
        {!small && (
          <div className={cn("font-mono tracking-widest text-lg font-bold", card.textColor)}>
            •••• •••• •••• {card.cardNumber}
          </div>
        )}

        {/* Bottom row */}
        <div className="flex items-end justify-between">
          <div>
            {!small && <p className={cn("text-[10px] uppercase opacity-60", card.textColor)}>Karta egasi</p>}
            <p className={cn("font-semibold", small ? "text-xs" : "text-sm", card.textColor)}>{card.cardHolder}</p>
          </div>
          <div className="text-right">
            {!small && <p className={cn("text-[10px] uppercase opacity-60", card.textColor)}>Muddat</p>}
            <p className={cn("font-mono font-semibold", small ? "text-xs" : "text-sm", card.textColor)}>{card.expiry}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Add card modal ─────────────────────────────────────────────────────────────
function AddCardModal({ onClose, onSave }: { onClose: () => void; onSave: (card: PaymentCard) => void }) {
  const [step, setStep]       = useState<"bank" | "details">("bank");
  const [bank, setBank]       = useState(BANKS[0]);
  const [cardNum, setCardNum] = useState("");
  const [holder, setHolder]   = useState("");
  const [expiry, setExpiry]   = useState("");
  const [showFull, setShowFull] = useState(false);
  const [errors, setErrors]   = useState<Record<string,string>>({});

  const preview: PaymentCard = {
    id: "",
    bankName: bank.name,
    cardNumber: cardNum.slice(-4) || "0000",
    cardHolder: holder || "KARTA EGASI",
    expiry: expiry || "MM/YY",
    gradient: bank.gradient,
    textColor: bank.textColor,
    logo: bank.logo,
    isActive: true,
  };

  const formatCardNum = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };
  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) return digits.slice(0,2) + "/" + digits.slice(2);
    return digits;
  };

  const validate = () => {
    const e: Record<string,string> = {};
    const digits = cardNum.replace(/\D/g, "");
    if (digits.length < 16) e.cardNum = "16 ta raqam kiriting";
    if (!holder.trim() || holder.length < 3) e.holder = "Karta egasi ismini kiriting";
    const expDigits = expiry.replace(/\D/g, "");
    if (expDigits.length < 4) e.expiry = "Muddatni kiriting (MM/YY)";
    return e;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({
      id: Date.now().toString(),
      bankName: bank.name,
      cardNumber: cardNum.replace(/\D/g, "").slice(-4),
      cardHolder: holder.toUpperCase().trim(),
      expiry,
      gradient: bank.gradient,
      textColor: bank.textColor,
      logo: bank.logo,
      isActive: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-background rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-card">
          <h2 className="font-display font-bold text-lg">Yangi karta qo'shish</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Card preview */}
          <CardPreview card={preview} />

          {/* Step 1: Bank */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Bank tanlang</label>
            <div className="grid grid-cols-4 gap-2">
              {BANKS.map((b) => (
                <button
                  key={b.name}
                  type="button"
                  onClick={() => setBank(b)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all",
                    bank.name === b.name ? "border-primary bg-primary/8" : "border-border/40 bg-muted/30 hover:border-primary/30"
                  )}
                >
                  <span className="text-xl">{b.logo}</span>
                  <span className="text-[10px] font-semibold leading-tight text-center">{b.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Card number */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Karta raqami *</label>
            <div className="relative">
              <input
                type={showFull ? "text" : "password"}
                inputMode="numeric"
                value={cardNum}
                onChange={(e) => setCardNum(formatCardNum(e.target.value))}
                placeholder="0000 0000 0000 0000"
                className="w-full h-11 px-4 pr-11 font-mono bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowFull(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showFull ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.cardNum && <p className="text-destructive text-xs mt-1">{errors.cardNum}</p>}
          </div>

          {/* Holder + Expiry */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Karta egasi *</label>
              <input
                type="text"
                value={holder}
                onChange={(e) => setHolder(e.target.value.toUpperCase())}
                placeholder="ALISHER USMONOV"
                className="w-full h-11 px-4 font-mono uppercase bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.holder && <p className="text-destructive text-xs mt-1">{errors.holder}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Muddat *</label>
              <input
                type="text"
                inputMode="numeric"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                className="w-full h-11 px-4 font-mono bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.expiry && <p className="text-destructive text-xs mt-1">{errors.expiry}</p>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 bg-muted border border-border/60 rounded-xl text-sm font-semibold hover:bg-muted/80 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 h-11 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/30"
          >
            Kartani saqlash
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PaymentMethods() {
  const [cards, setCards]       = useState<PaymentCard[]>(loadCards);
  const [showModal, setShowModal] = useState(false);

  const handleAdd = (card: PaymentCard) => {
    const next = [...cards, card];
    setCards(next);
    saveCards(next);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Kartani o'chirishni tasdiqlaysizmi?")) return;
    const next = cards.filter((c) => c.id !== id);
    setCards(next);
    saveCards(next);
  };

  const toggleActive = (id: string) => {
    const next = cards.map((c) => c.id === id ? { ...c, isActive: !c.isActive } : c);
    setCards(next);
    saveCards(next);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">To'lov usullari</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {cards.length} ta karta · Foydalanuvchilarga to'lovda ko'rinadi
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors self-start sm:self-auto shadow-sm shadow-primary/30"
        >
          <Plus className="w-4 h-4" /> Karta qo'shish
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-violet-50 border border-violet-200 rounded-2xl px-4 py-3 mb-5 flex items-start gap-3">
        <CreditCard className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-violet-800">Qanday ishlaydi?</p>
          <p className="text-xs text-violet-600 mt-0.5 leading-relaxed">
            Bu yerda qo'shilgan kartalar foydalanuvchilarga buyurtma to'lovida <strong>"Karta orqali"</strong> bo'limida ko'rinadi. 
            Faol / nofaol holati bilan boshqarishingiz mumkin.
          </p>
        </div>
      </div>

      {/* Cards grid */}
      {cards.length === 0 ? (
        <div className="bg-card border border-border/60 rounded-2xl p-16 text-center">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-muted-foreground opacity-40" />
          </div>
          <p className="font-display font-bold text-lg mb-1">Karta qo'shilmagan</p>
          <p className="text-muted-foreground text-sm mb-5">Foydalanuvchilarga ko'rsatiladigan kartalarni qo'shing</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Birinchi kartani qo'shish
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className={cn(
                "bg-card border rounded-2xl overflow-hidden shadow-sm transition-all",
                card.isActive ? "border-border/60" : "border-border/30 opacity-60"
              )}
            >
              {/* Card visual */}
              <div className="p-4">
                <CardPreview card={card} />
              </div>

              {/* Info + controls */}
              <div className="px-4 pb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{card.bankName}</p>
                    <p className="text-xs text-muted-foreground font-mono">•••• •••• •••• {card.cardNumber}</p>
                  </div>
                  <span className={cn(
                    "badge",
                    card.isActive ? "badge-success" : "badge-muted"
                  )}>
                    {card.isActive ? "Faol" : "Nofaol"}
                  </span>
                </div>

                <div className="flex gap-2">
                  {/* Toggle active */}
                  <button
                    onClick={() => toggleActive(card.id)}
                    className={cn(
                      "flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors",
                      card.isActive
                        ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    )}
                  >
                    {card.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    {card.isActive ? "Nofaol qilish" : "Faollashtirish"}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(card.id)}
                    className="w-9 h-9 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <AddCardModal
          onClose={() => setShowModal(false)}
          onSave={handleAdd}
        />
      )}
    </div>
  );
}
