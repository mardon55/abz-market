import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Link } from "wouter";
import {
  Settings, Package, Heart, MapPin, CreditCard,
  HelpCircle, LogOut, ChevronRight, Store, BarChart2,
  User, Phone, UserCheck, X, ChevronDown, CheckCircle2,
  ShoppingBag, Star, Bell,
} from "lucide-react";
import { hapticFeedback } from "@/hooks/use-telegram";
import { cn } from "@/lib/utils";

// ── Storage helpers ───────────────────────────────────────────
interface UserProfile {
  firstName: string;
  lastName: string;
  phone: string;
}

function saveProfile(p: UserProfile) {
  try { localStorage.setItem("abz_user", JSON.stringify(p)); } catch {}
}
function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem("abz_user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function clearProfile() {
  try { localStorage.removeItem("abz_user"); } catch {}
}

function getInitials(p: UserProfile) {
  return (p.firstName[0] ?? "") + (p.lastName[0] ?? "");
}

// ── Phone formatter (+998 XX XXX XX XX) ──────────────────────
function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 12);
  if (!digits) return "";
  let out = "+";
  if (digits.length >= 3)  out += digits.slice(0,3) + " ";
  else return "+" + digits;
  if (digits.length >= 5)  out += digits.slice(3,5) + " ";
  else return out + digits.slice(3);
  if (digits.length >= 8)  out += digits.slice(5,8) + " ";
  else return out + digits.slice(5);
  if (digits.length >= 10) out += digits.slice(8,10) + " ";
  else return out + digits.slice(8);
  if (digits.length >= 12) out += digits.slice(10,12);
  else return out + digits.slice(10);
  return out.trim();
}

// ── Menu section ─────────────────────────────────────────────
const MenuSection = ({ items, title }: { items: { icon: any; label: string; path: string }[]; title?: string }) => (
  <div className="mb-5">
    {title && (
      <h3 className="px-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{title}</h3>
    )}
    <div className="mx-4 glass-card rounded-3xl overflow-hidden shadow-ios-sm">
      {items.map((item, i) => (
        <Link
          key={i}
          href={item.path}
          className="flex items-center gap-3 px-4 py-3.5 active:bg-black/5 transition-colors border-b border-white/30 last:border-0"
        >
          <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center">
            <item.icon className="w-4 h-4 text-primary" />
          </div>
          <span className="flex-1 font-medium text-sm">{item.label}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Link>
      ))}
    </div>
  </div>
);

// ── Registration bottom sheet ─────────────────────────────────
function RegisterSheet({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: (p: UserProfile) => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [phone,     setPhone]     = useState("");
  const [errors,    setErrors]    = useState<Record<string, string>>({});
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim())          e.firstName = "Ism kiritilsin";
    if (!lastName.trim())           e.lastName  = "Familya kiritilsin";
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 12)         e.phone     = "To'liq raqam kiriting";
    return e;
  };

  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length <= 12) setPhone(formatPhone(digits));
  };

  const handleSubmit = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) { hapticFeedback("error"); return; }
    hapticFeedback("impact");
    setLoading(true);
    setTimeout(() => {
      const profile: UserProfile = {
        firstName: firstName.trim(),
        lastName:  lastName.trim(),
        phone,
      };
      saveProfile(profile);
      setLoading(false);
      setDone(true);
      hapticFeedback("success");
      setTimeout(() => {
        onSuccess(profile);
        onClose();
      }, 1200);
    }, 900);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end max-w-[430px] mx-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
      <div
        className="relative glass rounded-t-[36px] px-5 pt-4 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-foreground/15 rounded-full mx-auto mb-5" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-5 w-8 h-8 glass-card rounded-full flex items-center justify-center press-sm"
        >
          <X className="w-4 h-4 text-foreground/60" />
        </button>

        {/* Success state */}
        {done ? (
          <div className="flex flex-col items-center py-8 gap-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-display font-bold text-xl">Xush kelibsiz!</h3>
            <p className="text-muted-foreground text-sm text-center">
              Ro'yxatdan muvaffaqiyatli o'tdingiz
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <h2 className="font-display font-bold text-2xl">Ro'yxatdan o'tish</h2>
              <p className="text-muted-foreground text-sm mt-1">Ma'lumotlaringizni kiriting</p>
            </div>

            <div className="space-y-3">
              {/* First name */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Ism</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[17px] h-[17px] text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Ismingizni kiriting"
                    value={firstName}
                    onChange={(e) => { setFirstName(e.target.value); setErrors((p) => ({...p, firstName: ""})); }}
                    className={cn(
                      "w-full pl-10 pr-4 h-12 glass-input rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all",
                      errors.firstName && "ring-2 ring-destructive/40"
                    )}
                  />
                </div>
                {errors.firstName && <p className="text-destructive text-[11px] mt-1 ml-1">{errors.firstName}</p>}
              </div>

              {/* Last name */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Familya</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[17px] h-[17px] text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Familyangizni kiriting"
                    value={lastName}
                    onChange={(e) => { setLastName(e.target.value); setErrors((p) => ({...p, lastName: ""})); }}
                    className={cn(
                      "w-full pl-10 pr-4 h-12 glass-input rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all",
                      errors.lastName && "ring-2 ring-destructive/40"
                    )}
                  />
                </div>
                {errors.lastName && <p className="text-destructive text-[11px] mt-1 ml-1">{errors.lastName}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Telefon raqam</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[17px] h-[17px] text-muted-foreground pointer-events-none" />
                  <input
                    type="tel"
                    placeholder="+998 90 123 45 67"
                    value={phone}
                    onChange={(e) => { handlePhoneChange(e.target.value); setErrors((p) => ({...p, phone: ""})); }}
                    className={cn(
                      "w-full pl-10 pr-4 h-12 glass-input rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all",
                      errors.phone && "ring-2 ring-destructive/40"
                    )}
                  />
                </div>
                {errors.phone && <p className="text-destructive text-[11px] mt-1 ml-1">{errors.phone}</p>}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={cn(
                "w-full mt-5 h-13 rounded-2xl font-display font-bold text-white text-base flex items-center justify-center gap-2 press transition-all",
                loading
                  ? "bg-primary/60"
                  : "bg-gradient-to-r from-primary to-violet-500 shadow-ios-lg shadow-primary/40"
              )}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserCheck className="w-5 h-5" />
                  Ro'yxatdan o'tish
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-muted-foreground mt-3">
              Ro'yxatdan o'tish orqali siz{" "}
              <span className="text-primary font-semibold">foydalanish shartlarimizga</span>{" "}
              rozilik bildirasiz
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main profile page ─────────────────────────────────────────
export default function Profile() {
  const [user, setUser]             = useState<UserProfile | null>(null);
  const [showSheet, setShowSheet]   = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    setUser(loadProfile());
  }, []);

  const handleLogout = () => {
    hapticFeedback("impact");
    clearProfile();
    setUser(null);
    setShowLogout(false);
  };

  const menuItems = [
    { icon: Package,    label: "Buyurtmalarim",     path: "/orders" },
    { icon: Heart,      label: "Sevimli mahsulotlar", path: "/favorites" },
    { icon: MapPin,     label: "Manzillarim",        path: "/addresses" },
    { icon: CreditCard, label: "To'lov usullari",    path: "/payments" },
  ];

  const sellerItems = [
    { icon: Store,    label: "Mening do'konim", path: "/store/s1" },
    { icon: BarChart2, label: "Analitika",      path: "/analytics" },
  ];

  const settingsItems = [
    { icon: Settings,   label: "Sozlamalar",    path: "/settings" },
    { icon: HelpCircle, label: "Yordam markazi", path: "/help" },
    { icon: Bell,       label: "Bildirishnomalar", path: "/notifications" },
  ];

  return (
    <MobileLayout hideNav={false} title="Profil">

      {/* ────────────────────────────────────────────────────
          NOT REGISTERED state
      ─────────────────────────────────────────────────── */}
      {!user ? (
        <div className="flex flex-col items-center px-6 pt-8 pb-10">

          {/* Hero illustration */}
          <div className="relative mb-6">
            <div className="w-28 h-28 bg-gradient-to-br from-primary to-violet-400 rounded-[36px] flex items-center justify-center shadow-ios-lg shadow-primary/30">
              <User className="w-14 h-14 text-white" />
            </div>
            {/* Decorative blobs */}
            <div className="absolute -top-3 -right-3 w-10 h-10 bg-violet-200 dark:bg-violet-900/40 rounded-full blur-sm" />
            <div className="absolute -bottom-2 -left-3 w-8 h-8 bg-purple-200 dark:bg-purple-900/40 rounded-full blur-sm" />
          </div>

          <h2 className="font-display font-extrabold text-2xl text-center mb-2">
            Kirish yoki ro'yxatdan o'ting
          </h2>
          <p className="text-muted-foreground text-sm text-center mb-8 leading-relaxed">
            Buyurtmalaringizni kuzating, sevimli mahsulotlarni saqlang va maxsus takliflardan foydalaning.
          </p>

          {/* Benefits */}
          <div className="w-full space-y-3 mb-8">
            {[
              { icon: ShoppingBag, text: "Buyurtmalaringiz tarixini kuzating" },
              { icon: Heart,       text: "Sevimli mahsulotlarni saqlang"      },
              { icon: Star,        text: "Maxsus chegirmalar va takliflar"     },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 glass-card rounded-2xl px-4 py-3 shadow-ios-sm">
                <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>

          {/* Register button */}
          <button
            onClick={() => { hapticFeedback("impact"); setShowSheet(true); }}
            className="w-full h-14 bg-gradient-to-r from-primary to-violet-500 text-white font-display font-bold text-base rounded-2xl flex items-center justify-center gap-2 shadow-ios-lg shadow-primary/40 press mb-3"
          >
            <UserCheck className="w-5 h-5" />
            Ro'yxatdan o'tish
          </button>

          <p className="text-xs text-muted-foreground text-center">
            Allaqachon ro'yxatdansizmi?{" "}
            <button
              onClick={() => { hapticFeedback("selection"); setShowSheet(true); }}
              className="text-primary font-semibold"
            >
              Kirish
            </button>
          </p>
        </div>

      ) : (
        /* ──────────────────────────────────────────────────
           REGISTERED state
        ─────────────────────────────────────────────────── */
        <>
          {/* Profile header card */}
          <div className="px-4 pt-4 pb-3">
            <div className="bg-gradient-to-br from-primary via-violet-600 to-purple-700 rounded-3xl p-4 relative overflow-hidden shadow-ios-lg shadow-primary/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-sm" />
              <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/5 rounded-full blur-sm" />
              <div className="relative flex items-center gap-4">
                <div className="w-16 h-16 rounded-[22px] bg-white/20 backdrop-blur-sm flex items-center justify-center font-display font-extrabold text-xl text-white border border-white/30">
                  {getInitials(user).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-display font-bold text-white text-lg leading-tight">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-white/70 text-sm mt-0.5">{user.phone}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-white/80 text-xs font-semibold">Faol foydalanuvchi</span>
                  </div>
                </div>
                <button
                  onClick={() => { hapticFeedback("selection"); }}
                  className="w-9 h-9 bg-white/15 rounded-2xl flex items-center justify-center shrink-0"
                >
                  <Settings className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="px-4 mb-5">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Buyurtmalar", value: "12" },
                { label: "Sevimli",     value: "8"  },
                { label: "Ball",        value: "340" },
              ].map(({ label, value }) => (
                <div key={label} className="glass-card rounded-2xl p-3 text-center shadow-ios-sm">
                  <div className="font-display font-extrabold text-xl text-primary">{value}</div>
                  <div className="text-[11px] text-muted-foreground font-medium mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Menu sections */}
          <MenuSection items={menuItems}   title="Asosiy" />
          <MenuSection items={sellerItems} title="Sotuvchi paneli" />
          <MenuSection items={settingsItems} title="Qo'shimcha" />

          {/* Logout */}
          <div className="px-4 mt-2 mb-8">
            <button
              onClick={() => { hapticFeedback("selection"); setShowLogout(true); }}
              className="w-full h-12 glass-card rounded-2xl flex items-center justify-center gap-2 text-destructive font-semibold text-sm press shadow-ios-sm"
            >
              <LogOut className="w-4 h-4" />
              Tizimdan chiqish
            </button>
          </div>
        </>
      )}

      {/* ── Registration bottom sheet ── */}
      <RegisterSheet
        open={showSheet}
        onClose={() => setShowSheet(false)}
        onSuccess={(p) => setUser(p)}
      />

      {/* ── Logout confirmation ── */}
      {showLogout && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end max-w-[430px] mx-auto" onClick={() => setShowLogout(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
          <div
            className="relative glass rounded-t-[32px] px-5 pt-4 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-foreground/15 rounded-full mx-auto mb-5" />
            <h3 className="font-display font-bold text-lg mb-1">Tizimdan chiqish</h3>
            <p className="text-muted-foreground text-sm mb-5">Rostdan ham tizimdan chiqmoqchimisiz?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogout(false)}
                className="flex-1 h-12 glass-card rounded-2xl text-sm font-semibold press"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 h-12 bg-destructive text-white rounded-2xl text-sm font-bold press shadow-ios-sm"
              >
                Chiqish
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
