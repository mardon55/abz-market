import { useState, useEffect, useRef } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Link, useLocation } from "wouter";
import {
  Settings, Package, Heart, MapPin,
  HelpCircle, LogOut, ChevronRight, Store, BarChart2,
  User, Phone, UserCheck, X, ChevronDown, CheckCircle2,
  ShoppingBag, Star, Bell, Clock, CheckCircle, XCircle,
  Plus, Camera, Save, AlertCircle, ImageIcon, Pencil,
} from "lucide-react";
import { hapticFeedback, useTelegram } from "@/hooks/use-telegram";
import { cn } from "@/lib/utils";

// ── Seller store helpers ──────────────────────────────────────
interface SellerInfo { storeId: string; storeName: string; }
function loadSellerInfo(): SellerInfo | null {
  try {
    const raw = localStorage.getItem("abz_seller");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

const ADMIN_TG_ID = 259875997;
const ADMIN_TOKEN = "abz_admin_tg_" + ADMIN_TG_ID;

// ── Storage helpers ───────────────────────────────────────────
interface UserProfile {
  firstName: string;
  lastName: string;
  phone: string;
  avatar?: string;
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

// ── Image compression helper ──────────────────────────────────
async function compressImage(file: File, maxSize = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > height) { if (width > maxSize) { height = (height * maxSize) / width; width = maxSize; } }
      else { if (height > maxSize) { width = (width * maxSize) / height; height = maxSize; } }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No canvas context"));
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
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

  const { user: tgUser } = useTelegram();

  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) { hapticFeedback("error"); return; }
    hapticFeedback("impact");
    setLoading(true);
    try {
      const profile: UserProfile = {
        firstName: firstName.trim(),
        lastName:  lastName.trim(),
        phone,
      };
      saveProfile(profile);
      if (tgUser?.id) {
        await fetch("/api/users/me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telegramId: String(tgUser.id),
            firstName: profile.firstName,
            lastName: profile.lastName,
            phone: profile.phone,
          }),
        }).catch(() => {});
      }
      setDone(true);
      hapticFeedback("success");
      setTimeout(() => { onSuccess(profile); onClose(); }, 1200);
    } catch {
      hapticFeedback("error");
    } finally {
      setLoading(false);
    }
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

// ── Edit Profile Modal ────────────────────────────────────────
function EditProfileModal({
  user,
  tgId,
  onClose,
  onSaved,
}: {
  user: UserProfile;
  tgId?: number;
  onClose: () => void;
  onSaved: (p: UserProfile) => void;
}) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName,  setLastName]  = useState(user.lastName ?? "");
  const [phone,     setPhone]     = useState(user.phone ?? "");
  const [avatar,    setAvatar]    = useState<string | undefined>(user.avatar);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");
  const [done,      setDone]      = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length <= 12) setPhone(formatPhone(digits));
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("Rasm 10MB dan katta bo'lmasin"); return; }
    try {
      const compressed = await compressImage(file, 400);
      setAvatar(compressed);
      setError("");
    } catch { setError("Rasmni yuklab bo'lmadi"); }
  };

  const handleSave = async () => {
    if (!firstName.trim()) { setError("Ism kiritilsin"); return; }
    setSaving(true); setError("");
    try {
      const updated: UserProfile = {
        firstName: firstName.trim(),
        lastName: lastName.trim() || "",
        phone,
        avatar,
      };
      saveProfile(updated);
      if (tgId) {
        await fetch("/api/users/me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telegramId: String(tgId),
            firstName: updated.firstName,
            lastName: updated.lastName,
            phone: updated.phone,
            avatar: updated.avatar ?? null,
          }),
        });
      }
      hapticFeedback("success");
      setDone(true);
      setTimeout(() => { onSaved(updated); onClose(); }, 900);
    } catch {
      setError("Saqlashda xatolik yuz berdi");
      hapticFeedback("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end max-w-[430px] mx-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-background rounded-t-3xl shadow-2xl flex flex-col"
        style={{ height: "80vh" }}
        onClick={(e) => e.stopPropagation()}>

        <div className="shrink-0">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mt-3" />
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60">
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <X className="w-4 h-4" />
            </button>
            <h2 className="font-display font-bold text-sm flex-1 text-center">Profilni tahrirlash</h2>
            {!done && (
              <button onClick={handleSave} disabled={saving}
                className="shrink-0 h-8 px-4 bg-primary text-white font-bold text-sm rounded-xl flex items-center gap-1.5 disabled:opacity-60 active:scale-95 transition-transform">
                {saving
                  ? <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : <><Save className="w-3.5 h-3.5" /> Saqlash</>}
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 pb-6 space-y-4">
          {done ? (
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <p className="font-display font-bold text-lg">Saqlandi!</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />{error}
                </div>
              )}

              {/* Avatar upload */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="w-24 h-24 rounded-[28px] bg-primary/10 overflow-hidden flex items-center justify-center border-2 border-primary/20">
                    {avatar
                      ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                      : <span className="font-display font-extrabold text-2xl text-primary">
                          {getInitials({ firstName, lastName, phone })}
                        </span>
                    }
                  </div>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="text-primary text-sm font-semibold"
                >
                  Rasm yuklash
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </div>

              {/* First name */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Ism *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ismingizni kiriting"
                    className="w-full pl-10 pr-4 h-11 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              {/* Last name */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Familya</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)}
                    placeholder="Familyangizni kiriting"
                    className="w-full pl-10 pr-4 h-11 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Telefon raqam</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={phone} onChange={(e) => handlePhoneChange(e.target.value)}
                    type="tel" placeholder="+998 90 123 45 67"
                    className="w-full pl-10 pr-4 h-11 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

            </>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Edit Store Modal ──────────────────────────────────────────
function EditStoreModal({
  storeId,
  storeName: initialName,
  onClose,
  onSaved,
}: {
  storeId: string;
  storeName: string;
  onClose: () => void;
  onSaved: (name: string) => void;
}) {
  const [store, setStore] = useState<Record<string, string> | null>(null);
  const [name,        setName]       = useState(initialName);
  const [phone,       setPhone]      = useState("");
  const [location,    setLocation]   = useState("");
  const [description, setDescription] = useState("");
  const [logo,        setLogo]       = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");
  const [done,   setDone]   = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/stores/${storeId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((s) => {
        if (!s) return;
        setStore(s);
        setName(s.name ?? initialName);
        setPhone(s.phone ?? "");
        setLocation(s.location ?? "");
        setDescription(s.description ?? "");
        setLogo(s.logo ?? undefined);
      }).catch(() => {});
  }, [storeId]);

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 600);
      setLogo(compressed);
      setError("");
    } catch { setError("Rasmni yuklab bo'lmadi"); }
  };

  const handleSave = async () => {
    if (!name.trim()) { setError("Do'kon nomi kiritilsin"); return; }
    setSaving(true); setError("");
    try {
      const body: Record<string, string | undefined> = {
        name: name.trim(),
        phone,
        location,
        description,
      };
      if (logo !== undefined) body.logo = logo;
      await fetch(`/api/stores/${storeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      try {
        const raw = localStorage.getItem("abz_seller");
        if (raw) {
          const s = JSON.parse(raw);
          s.storeName = name.trim();
          localStorage.setItem("abz_seller", JSON.stringify(s));
        }
      } catch {}
      hapticFeedback("success");
      setDone(true);
      setTimeout(() => { onSaved(name.trim()); onClose(); }, 900);
    } catch {
      setError("Saqlashda xatolik");
      hapticFeedback("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end max-w-[430px] mx-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-background rounded-t-3xl shadow-2xl flex flex-col"
        style={{ height: "80vh" }}
        onClick={(e) => e.stopPropagation()}>

        <div className="shrink-0">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mt-3" />
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60">
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <X className="w-4 h-4" />
            </button>
            <h2 className="font-display font-bold text-sm flex-1 text-center">Do'konni tahrirlash</h2>
            {!done && store !== null && (
              <button onClick={handleSave} disabled={saving}
                className="shrink-0 h-8 px-4 bg-primary text-white font-bold text-sm rounded-xl flex items-center gap-1.5 disabled:opacity-60 active:scale-95 transition-transform">
                {saving
                  ? <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : <><Save className="w-3.5 h-3.5" /> Saqlash</>}
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 pb-6 space-y-4">
          {done ? (
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <p className="font-display font-bold text-lg">Saqlandi!</p>
            </div>
          ) : store === null ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />{error}
                </div>
              )}

              {/* Logo upload */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="w-24 h-24 rounded-[28px] bg-muted overflow-hidden flex items-center justify-center border-2 border-border/60">
                    {logo
                      ? <img src={logo} alt="logo" className="w-full h-full object-cover" />
                      : <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                    }
                  </div>
                  <button type="button" onClick={() => logoRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <button type="button" onClick={() => logoRef.current?.click()}
                  className="text-primary text-sm font-semibold">
                  Logo yuklash
                </button>
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Do'kon nomi *</label>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Telefon</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)}
                  type="tel" placeholder="+998 90 123 45 67"
                  className="w-full h-11 px-4 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Location */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Manzil</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)}
                  placeholder="Toshkent, Chilonzor tumani"
                  className="w-full h-11 px-4 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Tavsif</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                  placeholder="Do'kon haqida qisqacha ma'lumot..."
                  className="w-full px-4 py-3 bg-muted/50 border border-border/60 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

            </>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Multiple stores section ───────────────────────────────────
interface StoreItem {
  id: string;
  name: string;
  type: string;
  isVerified: boolean;
  logo: string | null;
  productCount: number | null;
}

function MultipleStoresSection({ telegramId, onEditStore }: {
  telegramId: string | null;
  onEditStore: (storeId: string, storeName: string) => void;
}) {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!telegramId) return;
    setLoading(true);
    fetch(`/api/stores?telegramId=${telegramId}`)
      .then((r) => r.ok ? r.json() : { stores: [] })
      .then((data) => setStores(data.stores ?? []))
      .catch(() => setStores([]))
      .finally(() => setLoading(false));
  }, [telegramId]);

  const activateStore = (store: StoreItem) => {
    hapticFeedback("selection");
    try {
      const entry = { storeId: store.id, storeName: store.name };
      localStorage.setItem("abz_seller", JSON.stringify(entry));
      const raw = localStorage.getItem("abz_stores");
      const existing: typeof entry[] = raw ? JSON.parse(raw) : [];
      const updated = [...existing.filter(s => s.storeId !== store.id), entry];
      localStorage.setItem("abz_stores", JSON.stringify(updated));
    } catch {}
    navigate("/my-store");
  };

  const getStatusBadge = (store: StoreItem) => {
    if (store.type === "rejected") {
      return (
        <span className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
          <XCircle className="w-3 h-3" /> Rad etildi
        </span>
      );
    }
    if (store.type === "pending") {
      return (
        <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
          <Clock className="w-3 h-3" /> Tasdiqlash kutilmoqda
        </span>
      );
    }
    if (store.isVerified || store.type === "partner") {
      return (
        <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Tasdiqlangan
        </span>
      );
    }
    return null;
  };

  if (loading) return null;

  return (
    <div className="mx-4 mb-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Sotuvchi paneli</h3>
        {stores.length > 0 && (
          <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {stores.length} ta do'kon
          </span>
        )}
      </div>

      {stores.length === 0 ? (
        <Link
          href="/register-store"
          className="glass-card rounded-3xl px-4 py-3.5 flex items-center gap-3 shadow-ios-sm active:bg-black/5 transition-colors"
          onClick={() => hapticFeedback("impact")}
        >
          <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Store className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">Do'kon ochish</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">ABZ Market'da sotuvchi bo'ling</div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Link>
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden shadow-ios-sm">
          {stores.map((store, idx) => {
            const isApproved = store.isVerified || store.type === "partner";
            const isRejected = store.type === "rejected";
            const isPending = store.type === "pending";
            return (
              <div key={store.id}>
                {idx > 0 && <div className="h-px bg-border/50 mx-4" />}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className={cn(
                    "w-9 h-9 rounded-2xl flex items-center justify-center shrink-0",
                    isApproved ? "bg-emerald-100" : isPending ? "bg-amber-50" : "bg-red-50"
                  )}>
                    {store.logo ? (
                      <img src={store.logo} alt={store.name} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <Store className={cn("w-4 h-4", isApproved ? "text-emerald-600" : isPending ? "text-amber-500" : "text-red-500")} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{store.name}</div>
                    {getStatusBadge(store)}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isApproved && (
                      <button
                        onClick={() => activateStore(store)}
                        className="h-7 px-3 bg-primary/10 text-primary rounded-lg text-xs font-bold active:scale-95 transition-transform"
                      >
                        Boshqarish
                      </button>
                    )}
                    {isPending && (
                      <span className="h-7 px-3 bg-amber-50 text-amber-600 rounded-lg text-xs font-semibold flex items-center">
                        Kutilmoqda
                      </span>
                    )}
                    {isRejected && (
                      <Link
                        href="/register-store"
                        onClick={() => hapticFeedback("impact")}
                        className="h-7 px-3 bg-red-50 text-red-600 rounded-lg text-xs font-bold"
                      >
                        Qayta ariza
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Analytics row for approved stores */}
          {stores.some(s => s.isVerified || s.type === "partner") && (
            <>
              <div className="h-px bg-border/50 mx-4" />
              <Link
                href="/analytics"
                className="flex items-center gap-3 px-4 py-3 active:bg-black/5 transition-colors"
                onClick={() => hapticFeedback("selection")}
              >
                <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <BarChart2 className="w-4 h-4 text-primary" />
                </div>
                <span className="flex-1 font-medium text-sm">Analitika</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </>
          )}

          {/* Add new store row */}
          <div className="h-px bg-border/50 mx-4" />
          <Link
            href="/register-store"
            className="flex items-center gap-3 px-4 py-3 active:bg-black/5 transition-colors"
            onClick={() => hapticFeedback("impact")}
          >
            <div className="w-9 h-9 rounded-2xl bg-violet-100 flex items-center justify-center">
              <Plus className="w-4 h-4 text-violet-600" />
            </div>
            <span className="flex-1 font-medium text-sm text-violet-700">Yangi do'kon qo'shish</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Main profile page ─────────────────────────────────────────
export default function Profile() {
  const [user, setUser]                 = useState<UserProfile | null>(null);
  const [showSheet, setShowSheet]       = useState(false);
  const [showLogout, setShowLogout]     = useState(false);
  const [showEdit, setShowEdit]         = useState(false);
  const [showStoreEdit, setShowStoreEdit] = useState(false);
  const [sellerInfo, setSellerInfo]     = useState<SellerInfo | null>(null);
  const { user: tgUser } = useTelegram();

  const isAdmin = tgUser?.id === ADMIN_TG_ID;

  const openAdminPanel = () => {
    hapticFeedback("impact");
    try { localStorage.setItem("abz_admin_tg_token", ADMIN_TOKEN); } catch {}
    window.open("/admin/", "_blank");
  };

  useEffect(() => {
    setUser(loadProfile());
    setSellerInfo(loadSellerInfo());
  }, []);

  const handleLogout = () => {
    hapticFeedback("impact");
    clearProfile();
    setUser(null);
    setSellerInfo(null);
    setShowLogout(false);
  };

  const menuItems = [
    { icon: Package,    label: "Buyurtmalarim",       path: "/orders" },
    { icon: Heart,  label: "Sevimli mahsulotlar", path: "/favorites" },
    { icon: MapPin, label: "Manzillarim",         path: "/addresses" },
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

          {/* Admin Panel button — unregistered admin */}
          {isAdmin && (
            <button
              onClick={openAdminPanel}
              className="mt-5 w-full h-12 bg-gradient-to-r from-violet-700 to-purple-600 text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-sm press shadow-ios-sm shadow-violet-500/30"
            >
              <Store className="w-4 h-4" />
              Admin Panel
              <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-md text-[10px] font-bold">ADMIN</span>
            </button>
          )}
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
                <div className="relative">
                  <div className="w-16 h-16 rounded-[22px] bg-white/20 backdrop-blur-sm flex items-center justify-center font-display font-extrabold text-xl text-white border border-white/30 overflow-hidden">
                    {user.avatar
                      ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                      : getInitials(user).toUpperCase()
                    }
                  </div>
                  <button
                    onClick={() => { hapticFeedback("selection"); setShowEdit(true); }}
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md"
                  >
                    <Pencil className="w-3 h-3 text-primary" />
                  </button>
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
                  onClick={() => { hapticFeedback("selection"); setShowEdit(true); }}
                  className="w-9 h-9 bg-white/15 rounded-2xl flex items-center justify-center shrink-0"
                >
                  <Settings className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="px-4 mb-5">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Buyurtmalar", value: "12" },
                { label: "Sevimli",     value: "8"  },
              ].map(({ label, value }) => (
                <div key={label} className="glass-card rounded-2xl p-3 text-center shadow-ios-sm">
                  <div className="font-display font-extrabold text-xl text-primary">{value}</div>
                  <div className="text-[11px] text-muted-foreground font-medium mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Menu sections */}
          <MenuSection items={menuItems} title="Asosiy" />

          {/* Seller section — shows all stores by telegramId */}
          <MultipleStoresSection
            telegramId={tgUser?.id ? String(tgUser.id) : null}
            onEditStore={(storeId, storeName) => {
              setSellerInfo({ storeId, storeName });
              setShowStoreEdit(true);
            }}
          />

          <MenuSection items={settingsItems} title="Qo'shimcha" />

          {/* Admin Panel button — only for admin */}
          {isAdmin && (
            <div className="px-4 mb-3">
              <button
                onClick={openAdminPanel}
                className="w-full h-12 bg-gradient-to-r from-violet-700 to-purple-600 text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-sm press shadow-ios-sm shadow-violet-500/30"
              >
                <Store className="w-4 h-4" />
                Admin Panel
                <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-md text-[10px] font-bold">ADMIN</span>
              </button>
            </div>
          )}

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

      {/* ── Edit profile modal ── */}
      {showEdit && user && (
        <EditProfileModal
          user={user}
          tgId={tgUser?.id}
          onClose={() => setShowEdit(false)}
          onSaved={(p) => { setUser(p); setShowEdit(false); }}
        />
      )}

      {/* ── Edit store modal ── */}
      {showStoreEdit && sellerInfo && (
        <EditStoreModal
          storeId={sellerInfo.storeId}
          storeName={sellerInfo.storeName}
          onClose={() => setShowStoreEdit(false)}
          onSaved={(newName) => {
            setSellerInfo((prev) => prev ? { ...prev, storeName: newName } : prev);
            setShowStoreEdit(false);
          }}
        />
      )}

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
