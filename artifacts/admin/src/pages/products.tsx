import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Plus, Edit2, Trash2, Eye, Star, X, Upload,
  ImageIcon, ChevronDown, Check, Package, RefreshCw, AlertCircle,
  CheckCircle, XCircle, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(n: number) { return n.toLocaleString("ru-RU") + " so'm"; }

// ── API types ─────────────────────────────────────────────────────────────────
interface ApiProduct {
  id: string;
  name: string;
  price: string;
  oldPrice: string | null;
  description: string | null;
  images: string[] | null;
  categoryId: string | null;
  categoryName: string | null;
  storeId: string;
  storeName: string | null;
  rating: string;
  reviewCount: number;
  isFeatured: boolean;
  isTopSelling: boolean;
  discount: number | null;
  salesCount: number;
  status: string;
  rejectionReason: string | null;
  createdAt: string | null;
}

interface ApiCategory { id: string; name: string; icon: string | null; }
interface ApiStore    { id: string; name: string; }

// ── Category config (for spec fields only) ────────────────────────────────────
interface FieldDef { key: string; label: string; type: "text" | "number" | "select" | "toggle"; options?: string[]; unit?: string; placeholder?: string }

const CATEGORIES: { name: string; emoji: string; fields: FieldDef[] }[] = [
  {
    name: "Shkaflar", emoji: "🚪",
    fields: [
      { key: "material",   label: "Material",               type: "select",  options: ["Eman","MDF","LDSP Laminat","Akril","Plastik","Kombinatsiya"] },
      { key: "color",      label: "Rangi",                  type: "text",    placeholder: "masalan: Oq, Wenge, Yong'oq" },
      { key: "width",      label: "Eni",                    type: "number",  unit: "sm",  placeholder: "150" },
      { key: "height",     label: "Balandligi",             type: "number",  unit: "sm",  placeholder: "200" },
      { key: "depth",      label: "Chuqurligi",             type: "number",  unit: "sm",  placeholder: "60" },
      { key: "doors",      label: "Eshiklar soni",          type: "select",  options: ["1","2","3","4","Kupe (slayder)","Akkordeon"] },
      { key: "drawers",    label: "Tortmachalar soni",      type: "select",  options: ["0","1","2","3","4","5+"] },
      { key: "mirror",     label: "Ko'zgu mavjud",          type: "toggle" },
      { key: "assembly",   label: "Yig'ilgan holda yetkazish", type: "toggle" },
    ],
  },
  {
    name: "Komodlar", emoji: "🗄️",
    fields: [
      { key: "material",   label: "Material",               type: "select",  options: ["Eman","MDF","LDSP","Akril","Plastik"] },
      { key: "color",      label: "Rangi",                  type: "text",    placeholder: "masalan: Oq, Jigarrang" },
      { key: "width",      label: "Eni",                    type: "number",  unit: "sm",  placeholder: "80" },
      { key: "height",     label: "Balandligi",             type: "number",  unit: "sm",  placeholder: "100" },
      { key: "depth",      label: "Chuqurligi",             type: "number",  unit: "sm",  placeholder: "45" },
      { key: "drawers",    label: "Tortmachalar soni",      type: "select",  options: ["2","3","4","5","6","7+"] },
      { key: "topGlass",   label: "Shisha ustlik",          type: "toggle" },
      { key: "mirror",     label: "Ko'zgu bilan",           type: "toggle" },
    ],
  },
  {
    name: "Oshxonalar", emoji: "🍳",
    fields: [
      { key: "material",   label: "Fasad materiali",        type: "select",  options: ["MDF bo'yalgan","Akril","Plastik PVC","Eman furnir","Matt laminat","Ekran"] },
      { key: "color",      label: "Asosiy rangi",           type: "text",    placeholder: "masalan: Oq, Kulrang, Yashil" },
      { key: "shape",      label: "Rejasi (shakli)",        type: "select",  options: ["To'g'ri (lineynyy)","L-shakl","U-shakl","P-shakl","Orolcha bilan"] },
      { key: "totalLen",   label: "Umumiy uzunlik",         type: "number",  unit: "sm",  placeholder: "300" },
      { key: "upperH",     label: "Yuqori shkaf balandligi", type: "number", unit: "sm",  placeholder: "72" },
      { key: "countertop", label: "Stoleshnitsa material",  type: "select",  options: ["LDSP","Granit","Sun'iy tosh","Eman massiv","Kompozit","Kvarts"] },
      { key: "sink",       label: "Lavabo bilan",           type: "toggle" },
      { key: "appliances", label: "Texnika kiritilgan",     type: "toggle" },
      { key: "hood",       label: "Degaz (vытяжка) bilan",  type: "toggle" },
    ],
  },
  {
    name: "Yotoqona", emoji: "🛏️",
    fields: [
      { key: "setType",    label: "Garnitur turi",          type: "select",  options: ["To'liq garnitur","Faqat karavot","Karavot + shkaf","Karavot + shkaf + komod"] },
      { key: "material",   label: "Material",               type: "select",  options: ["Eman massiv","MDF","LDSP Laminat","Akril","Metaldan"] },
      { key: "color",      label: "Rangi",                  type: "text",    placeholder: "masalan: Oq, Wenge, Marra" },
      { key: "bedSize",    label: "Karavot o'lchami",       type: "select",  options: ["90×200 (bir kishi)","120×200","140×200","160×200 (double)","180×200 (queen)","200×200 (king)"] },
      { key: "headboard",  label: "Bosh to'ri turi",        type: "select",  options: ["Yumshoq to'r","Qattiq to'r","Kamarli","Yog'ochdan","Maxsus dizayn"] },
      { key: "storage",    label: "Qutilar bilan (yotoq ostida)", type: "toggle" },
      { key: "mattress",   label: "Matras bilan birga",     type: "toggle" },
      { key: "nightstand", label: "Tungi stol bilan",       type: "toggle" },
    ],
  },
  {
    name: "Karavotlar", emoji: "🛌",
    fields: [
      { key: "material",   label: "Material",               type: "select",  options: ["Eman massiv","Sosna","MDF","LDSP","Metal","To'r bilan metal"] },
      { key: "color",      label: "Rangi",                  type: "text",    placeholder: "masalan: Oq, Jigarrang, Qora" },
      { key: "size",       label: "O'lcham (uzun × keng)",  type: "select",  options: ["70×160 (bola)","80×190","90×200 (bir kishi)","120×200","140×200","160×200 (double)","180×200 (queen)","200×200 (king)"] },
      { key: "height",     label: "Poldan yuzasigacha",     type: "number",  unit: "sm",  placeholder: "45" },
      { key: "headboard",  label: "Bosh to'ri turi",        type: "select",  options: ["Yumshoq qoplama","Qattiq yog'och","Metaldan","Kamarli","Boshi yo'q"] },
      { key: "storage",    label: "Qutilar bilan (pastda)", type: "toggle" },
      { key: "mattress",   label: "Matras bilan birga",     type: "toggle" },
      { key: "slats",      label: "Latylar (reykalar) bilan", type: "toggle" },
    ],
  },
  {
    name: "Divonlar", emoji: "🛋️",
    fields: [
      { key: "upholstery", label: "Qoplamasi",              type: "select",  options: ["Haqiqiy teri","Eko-teri","Mato (trikotaj)","Velur","Mikrofiber","Bukle","Shenil"] },
      { key: "color",      label: "Rangi",                  type: "text",    placeholder: "masalan: Kulrang, Bej, To'q jigarrang" },
      { key: "shape",      label: "Shakli",                 type: "select",  options: ["To'g'ri (klassik)","L-shakl (uglovoy)","U-shakl","Modul","Ottoman bilan"] },
      { key: "length",     label: "Uzunligi (eni)",          type: "number",  unit: "sm",  placeholder: "220" },
      { key: "depth",      label: "Chuqurligi (o'tirilganda)", type: "number", unit: "sm", placeholder: "90" },
      { key: "seats",      label: "O'tirish joylari",       type: "select",  options: ["2","3","4","5","6+","Modul"] },
      { key: "foldable",   label: "Yotiladigan (razkladnoy)", type: "toggle" },
      { key: "storage",    label: "Qutilar bilan (ichida)", type: "toggle" },
      { key: "pillows",    label: "Dekorativ yostiqlar bilan", type: "toggle" },
    ],
  },
  {
    name: "Kreslo", emoji: "🪑",
    fields: [
      { key: "upholstery", label: "Qoplamasi",              type: "select",  options: ["Haqiqiy teri","Eko-teri","Mato","Velur","Bukle","Shenil"] },
      { key: "color",      label: "Rangi",                  type: "text",    placeholder: "masalan: Jigarrang, Bej, Yashil" },
      { key: "type",       label: "Kreslo turi",            type: "select",  options: ["Klassik","Bergere (katta)","Ofis","Aylanadigan","Massaj","Salona"] },
      { key: "width",      label: "Eni",                    type: "number",  unit: "sm",  placeholder: "80" },
      { key: "depth",      label: "Chuqurligi",             type: "number",  unit: "sm",  placeholder: "85" },
      { key: "height",     label: "Balandligi",             type: "number",  unit: "sm",  placeholder: "95" },
      { key: "foldable",   label: "Yotiladigan",            type: "toggle" },
      { key: "armrests",   label: "Qo'ltiqchalar bilan",    type: "toggle" },
      { key: "swivel",     label: "Aylanadigan (360°)",     type: "toggle" },
    ],
  },
  {
    name: "Stollar", emoji: "🍽️",
    fields: [
      { key: "tableType",  label: "Stol turi",              type: "select",  options: ["Ovqat stoli","Kofe stoli","Yozuv stoli","Jurnal stoli","Konsolka","Burchak stoli","Transformerli"] },
      { key: "material",   label: "Tayanch + ustki material", type: "select", options: ["Eman massiv","MDF + metal","Shisha + metal","Mramor + metal","Granit","Keramika","LDSP"] },
      { key: "color",      label: "Rangi",                  type: "text",    placeholder: "masalan: Qora, Oq, Yog'och" },
      { key: "length",     label: "Uzunligi",               type: "number",  unit: "sm",  placeholder: "160" },
      { key: "width",      label: "Eni",                    type: "number",  unit: "sm",  placeholder: "90" },
      { key: "height",     label: "Balandligi",             type: "number",  unit: "sm",  placeholder: "76" },
      { key: "shape",      label: "Shakli",                 type: "select",  options: ["To'rtburchak","Kvadrat","Doira","Oval","Noodatiy"] },
      { key: "extendable", label: "Kengaytiriladigan (razdvizhnoy)", type: "toggle" },
      { key: "chairs",     label: "Stullar bilan birga",    type: "toggle" },
      { key: "chairCount", label: "Stullar soni",           type: "select",  options: ["2","4","6","8","10+"] },
    ],
  },
  {
    name: "Stullar", emoji: "💺",
    fields: [
      { key: "chairType",  label: "Stul turi",              type: "select",  options: ["Oshxona stuli","Ofis kreslo","Bar stuli","Mulyazh (dekorativ)","Bolalar stuli"] },
      { key: "upholstery", label: "O'tirgich materiali",    type: "select",  options: ["Teri","Eko-teri","Mato","Velur","Plastik","Yog'och"] },
      { key: "color",      label: "Rangi",                  type: "text",    placeholder: "masalan: Qora, Bej, Kulrang" },
      { key: "frame",      label: "Karkas (oyoqlar)",       type: "select",  options: ["Eman yog'och","Metall xrom","Metall qora","Plastik","Bulog'li metall"] },
      { key: "height",     label: "O'tirgich balandligi",   type: "number",  unit: "sm",  placeholder: "46" },
      { key: "armrests",   label: "Qo'ltiqchalar bilan",    type: "toggle" },
      { key: "adjustable", label: "Balandlik sozlanadi",    type: "toggle" },
      { key: "wheels",     label: "G'ildiraklar bilan",     type: "toggle" },
      { key: "foldable",   label: "Bukiladigan (skladnoy)", type: "toggle" },
    ],
  },
  {
    name: "Javonlar", emoji: "📚",
    fields: [
      { key: "shelfType",  label: "Javon turi",             type: "select",  options: ["Kitob javoni","Dekorativ javon","Garderob tizimi","Oshxona javoni","Ofis javoni","Devorga mahkamlanadigan"] },
      { key: "material",   label: "Material",               type: "select",  options: ["Eman massiv","MDF","LDSP","Metal + yog'och","Metal + shisha","Metal"] },
      { key: "color",      label: "Rangi",                  type: "text",    placeholder: "masalan: Oq, Wenge, Qora" },
      { key: "width",      label: "Eni",                    type: "number",  unit: "sm",  placeholder: "80" },
      { key: "height",     label: "Balandligi",             type: "number",  unit: "sm",  placeholder: "200" },
      { key: "depth",      label: "Chuqurligi",             type: "number",  unit: "sm",  placeholder: "30" },
      { key: "shelves",    label: "Javonlar soni",          type: "select",  options: ["2","3","4","5","6","7","8","9+"] },
      { key: "doors",      label: "Eshiklar bilan",         type: "toggle" },
      { key: "wallMount",  label: "Devorga o'rnatiladi",    type: "toggle" },
      { key: "glass",      label: "Shisha eshiklar",        type: "toggle" },
    ],
  },
  {
    name: "Matraslar", emoji: "💤",
    fields: [
      { key: "matType",    label: "Matras turi",            type: "select",  options: ["Yay (prujina) bilan","Prujinasiz (bespruzhinniy)","Ortopedik","Memory foam","Lateks","Kokonut qatlam","Gibrid"] },
      { key: "size",       label: "O'lcham",                type: "select",  options: ["60×120 (bola)","70×140","80×190","90×200","120×200","140×200","160×200","180×200","200×200"] },
      { key: "thickness",  label: "Qalinligi",              type: "number",  unit: "sm",  placeholder: "20" },
      { key: "firmness",   label: "Qattiqlik darajasi",     type: "select",  options: ["Juda yumshoq","Yumshoq","O'rta-yumshoq","O'rta","O'rta-qattiq","Qattiq","Juda qattiq"] },
      { key: "cover",      label: "Qoplama material",       type: "select",  options: ["Jacquard","Mato (trikotaj)","Aloe vera","Bambuk","Eurotop"] },
      { key: "warranty",   label: "Kafolat (yil)",          type: "select",  options: ["1","2","3","5","7","10","15","20"] },
      { key: "removeCover",label: "Qoplama yechish mumkin", type: "toggle" },
      { key: "twoSides",   label: "Ikki tomonlama (turnover)", type: "toggle" },
    ],
  },
  {
    name: "Bola xonasi", emoji: "🧸",
    fields: [
      { key: "setType",    label: "Garnitur turi",          type: "select",  options: ["To'liq garnitur","Faqat karavot","Burchak (uglovoy) karavot","Stol + stul","Shkaf","Ikki qavatli karavot"] },
      { key: "ageGroup",   label: "Yosh guruh",             type: "select",  options: ["0–3 yosh","3–7 yosh","7–12 yosh","12–17 yosh","Universal"] },
      { key: "material",   label: "Material",               type: "select",  options: ["MDF","Eman","LDSP","Plastik (xavfsiz)","Kombinatsiya"] },
      { key: "color",      label: "Rangi",                  type: "text",    placeholder: "masalan: Oq, Pushti, Ko'k" },
      { key: "bedSize",    label: "Karavot o'lchami",       type: "select",  options: ["60×120","70×140","80×160","80×200","90×200"] },
      { key: "safeCoat",   label: "Xavfsiz ekologik lak",   type: "toggle" },
      { key: "storage",    label: "Yashirma tortmachalar bilan", type: "toggle" },
      { key: "study",      label: "Yozuv stoli bilan",      type: "toggle" },
      { key: "bunk",       label: "Ikki qavatli (supraloft)", type: "toggle" },
    ],
  },
  {
    name: "Ofis mebeli", emoji: "🖥️",
    fields: [
      { key: "officeType", label: "Mebelning turi",         type: "select",  options: ["Ish stoli","Ofis kreslo","Kitob javoni","Yig'ma to'plam (garnitur)","Qabul stoli","Kutish xonasi divani"] },
      { key: "material",   label: "Material",               type: "select",  options: ["LDSP","MDF","Eman","Metal + shisha","Kombinatsiya"] },
      { key: "color",      label: "Rangi",                  type: "text",    placeholder: "masalan: Kulrang, Qora, Yong'oq" },
      { key: "deskW",      label: "Stol eni",               type: "number",  unit: "sm",  placeholder: "160" },
      { key: "deskD",      label: "Stol chuqurligi",        type: "number",  unit: "sm",  placeholder: "70" },
      { key: "deskH",      label: "Stol balandligi",        type: "number",  unit: "sm",  placeholder: "76" },
      { key: "pedestal",   label: "Pedestal (tirqish quti) bilan", type: "toggle" },
      { key: "cable",      label: "Sim boshqaruv tizimi",   type: "toggle" },
    ],
  },
  {
    name: "Gilamlar", emoji: "🏡",
    fields: [
      { key: "rugType",    label: "Gilam turi",             type: "select",  options: ["Mashinada to'qilgan","Qo'lda to'qilgan","Tafted","Kilim (yassi)","Shenil","Shaggy (uzun tuk)","Bambuk"] },
      { key: "material",   label: "Tolasi",                 type: "select",  options: ["Poliester","Akril","Polipropilen","Jun (wool)","Ipak","Bambuk","Viskoza","Gibrid"] },
      { key: "size",       label: "O'lcham",                type: "select",  options: ["60×110","80×150","100×150","100×200","120×170","150×200","160×230","200×300","Maxsus o'lcham"] },
      { key: "pile",       label: "Tuk balandligi",         type: "select",  options: ["Tuksiz (kilim)","Past (6–8 mm)","O'rta (10–15 mm)","Baland (20–30 mm)","Juda baland (shaggy 40mm+)"] },
      { key: "color",      label: "Asosiy rang / naqsh",    type: "text",    placeholder: "masalan: Bej geometrik, Kulrang abstraktsiya" },
      { key: "antislip",   label: "Pastki qismi slip emas", type: "toggle" },
      { key: "washable",   label: "Mashinada yuviladi",     type: "toggle" },
    ],
  },
  {
    name: "Chiroqlar", emoji: "💡",
    fields: [
      { key: "lightType",  label: "Chiroq turi",            type: "select",  options: ["Lyustra (shiftga)","Bra (devorga)","Torshyer (polda)","Stol chiroqi","Spot (nuqtaviy)","LED panel","Track light"] },
      { key: "style",      label: "Dizayn uslubi",          type: "select",  options: ["Zamonaviy (modern)","Skandinavcha","Klassik","Loft / Industrial","Minimalizm","Art Deco","Provans"] },
      { key: "material",   label: "Korpus materiali",       type: "select",  options: ["Metall xrom","Metall qora","Bronza / Oltin","Mis","Shisha + metall","Akrilik","Qog'oz / Mato"] },
      { key: "colorTemp",  label: "Rang harorati",          type: "select",  options: ["2700K – Issiq oq (xona)","3000K – Iliq oq","4000K – Tabiiy oq","5000–6500K – Sovuq oq (ofis)"] },
      { key: "power",      label: "Quvvati",                type: "number",  unit: "W",   placeholder: "40" },
      { key: "diameter",   label: "Diametr / Eni",          type: "number",  unit: "sm",  placeholder: "60" },
      { key: "bulbBase",   label: "Patron (razem)",         type: "select",  options: ["E27","E14","E40","GU10","GU5.3","G9","LED o'rnatilgan","G13 (lyuminessent)"] },
      { key: "dimmable",   label: "Dimmer bilan",           type: "toggle" },
      { key: "remote",     label: "Pult bilan",             type: "toggle" },
      { key: "bulbIncl",   label: "Lampa kiritilgan",       type: "toggle" },
    ],
  },
];

// ── API helpers ───────────────────────────────────────────────────────────────
async function fetchProducts(): Promise<ApiProduct[]> {
  const r = await fetch("/api/products?status=all&limit=200");
  if (!r.ok) throw new Error("Mahsulotlar yuklanmadi");
  const data = await r.json();
  return data.products ?? [];
}

async function approveProduct(id: string): Promise<ApiProduct> {
  const r = await fetch(`/api/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "approve" }),
  });
  if (!r.ok) throw new Error("Tasdiqlashda xato");
  return r.json();
}

async function rejectProduct({ id, reason }: { id: string; reason: string }): Promise<ApiProduct> {
  const r = await fetch(`/api/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "reject", rejectionReason: reason }),
  });
  if (!r.ok) throw new Error("Rad etishda xato");
  return r.json();
}

async function fetchCategories(): Promise<ApiCategory[]> {
  const r = await fetch("/api/categories");
  if (!r.ok) return [];
  const data = await r.json();
  return data.categories ?? [];
}

async function fetchStores(): Promise<ApiStore[]> {
  const r = await fetch("/api/stores");
  if (!r.ok) return [];
  const data = await r.json();
  return data.stores ?? [];
}

async function createProduct(body: Record<string, unknown>): Promise<ApiProduct> {
  const r = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Xato yuz berdi");
  }
  return r.json();
}

async function updateProduct(id: string, body: Record<string, unknown>): Promise<ApiProduct> {
  const r = await fetch(`/api/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("Saqlashda xato yuz berdi");
  return r.json();
}

async function deleteProduct(id: string): Promise<void> {
  const r = await fetch(`/api/products/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("O'chirishda xato");
}

// ── Image upload field ────────────────────────────────────────────────────────
function ImageUpload({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Mahsulot rasmi *</label>
      <div
        onClick={() => ref.current?.click()}
        className={cn(
          "relative w-full h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden",
          value ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/50"
        )}
      >
        {value ? (
          <>
            <img src={value} alt="preview" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
            <div className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Upload className="w-6 h-6 text-white mb-1" />
              <span className="text-white text-xs font-semibold">Rasmni almashtirish</span>
            </div>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
              <ImageIcon className="w-7 h-7 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">Rasm yuklash uchun bosing</p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP • Maks 5MB</p>
          </>
        )}
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {value && (
        <button type="button" onClick={() => onChange("")} className="mt-2 text-xs text-destructive hover:underline">
          Rasmni o'chirish
        </button>
      )}
    </div>
  );
}

// ── Spec field renderer ───────────────────────────────────────────────────────
function SpecField({ field, value, onChange }: { field: FieldDef; value: string; onChange: (v: string) => void }) {
  if (field.type === "toggle") {
    return (
      <div className="flex items-center justify-between py-2.5 px-3 bg-muted/40 rounded-xl">
        <span className="text-sm font-medium">{field.label}</span>
        <button
          type="button"
          onClick={() => onChange(value === "Ha" ? "Yo'q" : "Ha")}
          className={cn("w-11 h-6 rounded-full transition-all relative", value === "Ha" ? "bg-primary" : "bg-border")}
        >
          <span className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all", value === "Ha" ? "left-6" : "left-1")} />
        </button>
      </div>
    );
  }
  if (field.type === "select") {
    return (
      <div>
        <label className="text-xs font-semibold text-muted-foreground block mb-1">{field.label}</label>
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-10 pl-3 pr-8 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
          >
            <option value="">Tanlang...</option>
            {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>
      </div>
    );
  }
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground block mb-1">{field.label}</label>
      <input
        type={field.type === "number" ? "number" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.label}
        className="w-full h-10 px-3 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

// ── Product form modal ────────────────────────────────────────────────────────
interface ProductForm {
  name: string;
  category: string;
  price: string;
  oldPrice: string;
  storeId: string;
  isFeatured: boolean;
  description: string;
  specs: Record<string, string>;
  img: string;
}

function blankForm(): ProductForm {
  return {
    name: "", category: CATEGORIES[0].name, price: "", oldPrice: "",
    storeId: "", isFeatured: true, description: "", specs: {}, img: "",
  };
}

function ProductModal({
  product,
  onClose,
  onSaved,
}: {
  product: ApiProduct | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const qc = useQueryClient();
  const isEdit = !!product?.id;

  const { data: stores = [] } = useQuery({ queryKey: ["stores"], queryFn: fetchStores });
  const { data: apiCategories = [] } = useQuery({ queryKey: ["categories-list"], queryFn: fetchCategories });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [form, setForm] = useState<ProductForm>(() => {
    if (product) {
      const catName = CATEGORIES.find((c) => c.name === product.categoryName)?.name ?? CATEGORIES[0].name;
      return {
        name: product.name,
        category: catName,
        price: product.price,
        oldPrice: product.oldPrice ?? "",
        storeId: product.storeId ?? "",
        isFeatured: product.isFeatured,
        description: product.description ?? "",
        specs: {},
        img: product.images?.[0] ?? "",
      };
    }
    return blankForm();
  });

  // Auto-select first store if only one
  useEffect(() => {
    if (!form.storeId && stores.length === 1) {
      setForm((f) => ({ ...f, storeId: stores[0].id }));
    }
  }, [stores]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const catDef = CATEGORIES.find((c) => c.name === form.category)!;

  const setSpec = (key: string, val: string) =>
    setForm((f) => ({ ...f, specs: { ...f.specs, [key]: val } }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Mahsulot nomi kiritilsin";
    if (!form.price)       e.price = "Narx kiritilsin";
    if (!form.storeId)     e.storeId = "Do'kon tanlansin";
    if (!form.img)         e.img = "Rasm yuklash majburiy";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    // Map category name → categoryId
    const matchedCat = apiCategories.find(
      (c) => c.name.toLowerCase() === form.category.toLowerCase()
    );

    // Build description with specs appended
    const specLines = Object.entries(form.specs)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    const fullDesc = form.description.trim()
      ? form.description.trim() + (specLines ? `\n\nXususiyatlar: ${specLines}` : "")
      : specLines || null;

    const body: Record<string, unknown> = {
      name: form.name.trim(),
      price: form.price,
      oldPrice: form.oldPrice || null,
      description: fullDesc,
      images: form.img ? [form.img] : [],
      categoryId: matchedCat?.id ?? null,
      storeId: form.storeId,
      isFeatured: form.isFeatured,
      isTopSelling: false,
    };

    setSaving(true);
    setSaveError("");
    try {
      if (isEdit && product) {
        await updateProduct(product.id, body);
      } else {
        await createProduct(body);
      }
      await qc.invalidateQueries({ queryKey: ["admin-products"] });
      onSaved();
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-2xl h-full bg-background shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-card shrink-0">
          <div>
            <h2 className="font-display font-bold text-lg">{isEdit ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"}</h2>
            <p className="text-muted-foreground text-xs mt-0.5">{form.category} kategoriyasi</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-6">

            {/* 1. Kategoriya */}
            <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
              <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">1. Kategoriya</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, category: cat.name, specs: {} }))}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all",
                      form.category === cat.name
                        ? "border-primary bg-primary/8 text-primary"
                        : "border-border/40 bg-muted/30 text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <span className="text-[11px] font-semibold leading-tight text-center">{cat.name}</span>
                    {form.category === cat.name && <Check className="w-3 h-3 text-primary" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Rasm */}
            <div className="bg-card border border-border/60 rounded-2xl p-5">
              <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">2. Rasm</h3>
              <ImageUpload
                value={form.img}
                onChange={(v) => { setForm((f) => ({ ...f, img: v })); setErrors((e) => ({ ...e, img: "" })); }}
              />
              {errors.img && <p className="text-destructive text-xs mt-1">{errors.img}</p>}
            </div>

            {/* 3. Asosiy ma'lumotlar */}
            <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
              <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">3. Asosiy ma'lumotlar</h3>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Mahsulot nomi *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setErrors((er) => ({ ...er, name: "" })); }}
                  placeholder={`Masalan: ${catDef.name} Premium dizayn`}
                  className="w-full h-10 px-3 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Narx (so'm) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => { setForm((f) => ({ ...f, price: e.target.value })); setErrors((er) => ({ ...er, price: "" })); }}
                    placeholder="12 500 000"
                    className="w-full h-10 px-3 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.price && <p className="text-destructive text-xs mt-1">{errors.price}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Eski narx (ixtiyoriy)</label>
                  <input
                    type="number"
                    value={form.oldPrice}
                    onChange={(e) => setForm((f) => ({ ...f, oldPrice: e.target.value }))}
                    placeholder="15 000 000"
                    className="w-full h-10 px-3 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Store dropdown */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Do'kon *</label>
                {stores.length === 0 ? (
                  <div className="flex items-center gap-2 h-10 px-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-700">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Do'konlar topilmadi. Avval "Do'konlar" bo'limida do'kon yarating.
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={form.storeId}
                      onChange={(e) => { setForm((f) => ({ ...f, storeId: e.target.value })); setErrors((er) => ({ ...er, storeId: "" })); }}
                      className="w-full h-10 pl-3 pr-8 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                    >
                      <option value="">Do'konni tanlang...</option>
                      {stores.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                )}
                {errors.storeId && <p className="text-destructive text-xs mt-1">{errors.storeId}</p>}
              </div>

              {/* Featured toggle */}
              <div className="flex items-center justify-between py-2.5 px-3 bg-muted/40 rounded-xl">
                <div>
                  <span className="text-sm font-medium">Bosh sahifada ko'rsatish</span>
                  <p className="text-xs text-muted-foreground">Yoqilsa mahsulot bosh sahifada "Tavsiya etilgan" bo'limida chiqadi</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, isFeatured: !f.isFeatured }))}
                  className={cn("w-11 h-6 rounded-full transition-all relative shrink-0 ml-3", form.isFeatured ? "bg-primary" : "bg-border")}
                >
                  <span className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all", form.isFeatured ? "left-6" : "left-1")} />
                </button>
              </div>
            </div>

            {/* 4. Tavsif */}
            <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-3">
              <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">4. Tavsif</h3>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={4}
                placeholder={`${catDef.name} haqida to'liq ma'lumot yozing...`}
                className="w-full px-3 py-2.5 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* 5. Xususiyatlar */}
            <div className="bg-card border border-border/60 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{catDef.emoji}</span>
                <div>
                  <h3 className="font-display font-semibold text-sm">{catDef.name} xususiyatlari</h3>
                  <p className="text-xs text-muted-foreground">Bu kategoriyaga xos texnik ma'lumotlar</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {catDef.fields.map((field) => (
                  <SpecField
                    key={field.key}
                    field={field}
                    value={form.specs[field.key] ?? (field.type === "toggle" ? "Yo'q" : "")}
                    onChange={(v) => setSpec(field.key, v)}
                  />
                ))}
              </div>
            </div>

            {saveError && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {saveError}
              </div>
            )}

          </form>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border/60 bg-card px-6 py-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 bg-muted border border-border/60 rounded-xl text-sm font-semibold hover:bg-muted/80 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={saving}
            className="flex-1 h-11 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/30 disabled:opacity-60"
          >
            {saving ? "Saqlanmoqda..." : isEdit ? "Saqlash" : "Mahsulot qo'shish"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── View modal ────────────────────────────────────────────────────────────────
function ViewModal({ product, onClose, onEdit }: { product: ApiProduct; onClose: () => void; onEdit: () => void }) {
  const catDef = CATEGORIES.find((c) => c.name === product.categoryName);
  const img = product.images?.[0];
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-lg h-full bg-background shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-card shrink-0">
          <h2 className="font-display font-bold text-base">Mahsulot ma'lumotlari</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {img && <img src={img} alt={product.name} className="w-full h-52 object-cover" />}
          <div className="p-5 space-y-4">
            <div>
              {product.categoryName && <span className="badge badge-primary">{catDef?.emoji ?? "📦"} {product.categoryName}</span>}
              <h3 className="font-display font-bold text-xl mt-2">{product.name}</h3>
              <p className="text-muted-foreground text-sm mt-1">{product.storeName}</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <div className="font-bold text-lg text-primary">{fmt(Number(product.price))}</div>
                {product.oldPrice && <div className="text-xs text-muted-foreground line-through">{fmt(Number(product.oldPrice))}</div>}
              </div>
              {product.isFeatured && <span className="badge badge-info">⭐ Tavsiya etilgan</span>}
              <div className="ml-auto flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="font-semibold text-sm">{Number(product.rating).toFixed(1)}</span>
                <span className="text-muted-foreground text-xs">({product.reviewCount})</span>
              </div>
            </div>
            {product.description && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Tavsif</h4>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>
            )}
          </div>
        </div>
        <div className="shrink-0 border-t border-border/60 bg-card px-5 py-4 flex gap-3">
          <button onClick={onClose} className="flex-1 h-10 bg-muted rounded-xl text-sm font-semibold">Yopish</button>
          <button onClick={onEdit} className="flex-1 h-10 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90">Tahrirlash</button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Products() {
  const qc = useQueryClient();
  const [search, setSearch]         = useState("");
  const [catFilter, setCatFilter]   = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending" | "rejected">("all");
  const [modal, setModal]           = useState<"add" | "edit" | "view" | null>(null);
  const [active, setActive]         = useState<ApiProduct | null>(null);
  const [view, setView]             = useState<"list" | "new">("list");
  const [rejectModal, setRejectModal] = useState<ApiProduct | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: products = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-products"],
    queryFn: fetchProducts,
    refetchInterval: 15_000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  const approveMutation = useMutation({
    mutationFn: approveProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      setRejectModal(null);
      setRejectReason("");
    },
  });

  const pendingProducts = products.filter((p) => p.status === "pending");

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.storeName ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || p.categoryName === catFilter;
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const handleDelete = (id: string) => {
    if (!confirm("Mahsulotni o'chirishni tasdiqlaysizmi?")) return;
    deleteMutation.mutate(id);
  };

  const closeModal = () => { setModal(null); setActive(null); };

  const handleRejectSubmit = () => {
    if (!rejectModal) return;
    if (!rejectReason.trim()) return;
    rejectMutation.mutate({ id: rejectModal.id, reason: rejectReason.trim() });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="font-display font-bold text-2xl">Mahsulotlar</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{products.length} ta mahsulot</p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 bg-muted border border-border/60 text-foreground px-3 py-2 rounded-xl text-sm font-semibold hover:bg-muted/80 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setView(view === "new" ? "list" : "new")}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors",
              view === "new"
                ? "bg-amber-500 text-white hover:bg-amber-600"
                : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
            )}
          >
            <Clock className="w-4 h-4" />
            Yangi mahsulotlar
            {pendingProducts.length > 0 && (
              <span className={cn(
                "ml-0.5 min-w-[18px] h-[18px] rounded-full text-[11px] font-bold flex items-center justify-center px-1",
                view === "new" ? "bg-white text-amber-600" : "bg-amber-500 text-white"
              )}>
                {pendingProducts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setActive(null); setModal("add"); }}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/30"
          >
            <Plus className="w-4 h-4" /> Mahsulot qo'shish
          </button>
        </div>
      </div>

      {/* ── Yangi mahsulotlar view ─────────────────────────────────────────────── */}
      {view === "new" && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-600" />
            <h2 className="font-display font-bold text-lg">Yangi mahsulotlar</h2>
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendingProducts.length} ta kutilmoqda</span>
          </div>
          {pendingProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-card border border-border/60 rounded-2xl">
              <CheckCircle className="w-12 h-12 mb-3 text-emerald-400 opacity-60" />
              <p className="font-semibold text-sm">Barcha mahsulotlar ko'rib chiqilgan</p>
              <p className="text-xs mt-1">Hozircha tasdiqlashni kutayotgan mahsulot yo'q</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingProducts.map((p) => {
                const img = p.images?.[0];
                const catEmoji = CATEGORIES.find((c) => c.name === p.categoryName)?.emoji ?? "📦";
                return (
                  <div key={p.id} className="bg-card border border-amber-200 rounded-2xl overflow-hidden shadow-sm">
                    {/* Image */}
                    <div className="relative w-full h-48 bg-muted">
                      {img ? (
                        <img src={img} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                          <ImageIcon className="w-10 h-10 opacity-30 mb-2" />
                          <span className="text-xs">Rasm yuklanmagan</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="badge badge-warning flex items-center gap-1"><Clock className="w-3 h-3" /> Kutilmoqda</span>
                      </div>
                      {p.createdAt && (
                        <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-lg">
                          {new Date(p.createdAt).toLocaleDateString("uz-UZ")}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-display font-bold text-base leading-tight line-clamp-2">{p.name}</h3>
                        {p.categoryName && (
                          <span className="badge badge-primary shrink-0">{catEmoji} {p.categoryName}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-lg text-primary">{fmt(Number(p.price))}</span>
                        {p.oldPrice && (
                          <span className="text-sm text-muted-foreground line-through">{fmt(Number(p.oldPrice))}</span>
                        )}
                        {p.discount && (
                          <span className="badge badge-danger">-{p.discount}%</span>
                        )}
                      </div>

                      {p.storeName && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                          <Package className="w-3.5 h-3.5" />
                          <span className="font-semibold">{p.storeName}</span>
                        </div>
                      )}

                      {p.description && (
                        <p className="text-sm text-foreground/70 line-clamp-3 mb-3 bg-muted/40 rounded-xl px-3 py-2">{p.description}</p>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => setRejectModal(p)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors border border-red-200 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Rad etish
                        </button>
                        <button
                          onClick={() => approveMutation.mutate(p.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-200 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {approveMutation.isPending ? "Tasdiqlanmoqda..." : "Tasdiqlash"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="border-t border-border/40 my-6" />
          <h2 className="font-display font-bold text-lg mb-4">Barcha mahsulotlar ro'yxati</h2>
        </div>
      )}

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 hide-scrollbar">
        {([
          { val: "all",      label: "Barchasi",     count: products.length },
          { val: "approved", label: "Tasdiqlangan", count: products.filter(p => p.status === "approved").length },
          { val: "pending",  label: "Kutilmoqda",   count: pendingProducts.length },
          { val: "rejected", label: "Rad etilgan",  count: products.filter(p => p.status === "rejected").length },
        ] as const).map(({ val, label, count }) => (
          <button
            key={val}
            onClick={() => setStatusFilter(val)}
            className={cn("shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
              statusFilter === val ? "bg-primary text-white border-primary" : "bg-card border-border/60 text-muted-foreground hover:text-foreground"
            )}
          >
            {label} <span className="opacity-70">({count})</span>
          </button>
        ))}
      </div>

      {/* Category quick-filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 hide-scrollbar">
        <button
          onClick={() => setCatFilter("all")}
          className={cn("px-3 py-1.5 rounded-xl text-xs font-semibold border shrink-0 transition-all",
            catFilter === "all" ? "bg-primary text-white border-primary" : "bg-card border-border/60 text-muted-foreground hover:text-foreground"
          )}
        >
          Barchasi
        </button>
        {CATEGORIES.map((c) => {
          const count = products.filter((p) => p.categoryName === c.name).length;
          if (count === 0) return null;
          return (
            <button
              key={c.name}
              onClick={() => setCatFilter(c.name)}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border shrink-0 transition-all",
                catFilter === c.name ? "bg-primary text-white border-primary" : "bg-card border-border/60 text-muted-foreground hover:text-foreground"
              )}
            >
              {c.emoji} {c.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Mahsulot, do'kon qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 h-9 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm">Yuklanmoqda...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <AlertCircle className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">Mahsulotlarni yuklashda xato</p>
            <button onClick={() => refetch()} className="mt-3 text-xs text-primary hover:underline">Qayta urinish</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Package className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">Mahsulotlar topilmadi</p>
            <p className="text-xs mt-1">Yangi mahsulot qo'shing</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border/60">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Mahsulot</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Kategoriya</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Narx</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">Reyting</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">Ko'rinish</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((p) => {
                  const catEmoji = CATEGORIES.find((c) => c.name === p.categoryName)?.emoji ?? "📦";
                  const img = p.images?.[0];
                  return (
                    <tr key={p.id} className="table-row-hover">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {img ? (
                            <img src={img} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-muted shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl shrink-0">{catEmoji}</div>
                          )}
                          <div>
                            <div className="font-semibold line-clamp-1 max-w-[200px]">{p.name}</div>
                            <div className="text-xs text-muted-foreground">{p.storeName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {p.categoryName
                          ? <span className="badge badge-primary">{catEmoji} {p.categoryName}</span>
                          : <span className="text-muted-foreground text-xs">—</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{fmt(Number(p.price))}</div>
                        {p.oldPrice && <div className="text-xs text-muted-foreground line-through">{fmt(Number(p.oldPrice))}</div>}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="font-semibold">{Number(p.rating).toFixed(1) || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {p.status === "pending"
                          ? <span className="badge badge-warning"><Clock className="w-3 h-3" /> Kutilmoqda</span>
                          : p.status === "rejected"
                          ? <span className="badge badge-danger"><XCircle className="w-3 h-3" /> Rad etilgan</span>
                          : p.isFeatured
                          ? <span className="badge badge-info">⭐ Tavsiya</span>
                          : <span className="badge badge-success"><CheckCircle className="w-3 h-3" /> Tasdiqlangan</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {p.status === "pending" ? (
                            <>
                              <button
                                onClick={() => setRejectModal(p)}
                                title="Rad etish"
                                className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => approveMutation.mutate(p.id)}
                                disabled={approveMutation.isPending}
                                title="Tasdiqlash"
                                className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition-colors disabled:opacity-50"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => { setActive(p); setModal("view"); }}
                                className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-violet-100 hover:text-violet-700 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => { setActive(p); setModal("edit"); }}
                                className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-blue-100 hover:text-blue-700 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(p.id)}
                            disabled={deleteMutation.isPending}
                            className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
        <div className="px-4 py-3 border-t border-border/40 text-xs text-muted-foreground">
          {filtered.length} ta natija
        </div>
      </div>

      {/* Modals */}
      {(modal === "add" || modal === "edit") && (
        <ProductModal
          product={modal === "edit" ? active : null}
          onClose={closeModal}
          onSaved={closeModal}
        />
      )}
      {modal === "view" && active && (
        <ViewModal
          product={active}
          onClose={closeModal}
          onEdit={() => setModal("edit")}
        />
      )}

      {/* Reject reason modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setRejectModal(null); setRejectReason(""); }} />
          <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 border border-border/60">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base">Mahsulotni rad etish</h3>
                <p className="text-xs text-muted-foreground line-clamp-1">{rejectModal.name}</p>
              </div>
              <button onClick={() => { setRejectModal(null); setRejectReason(""); }} className="ml-auto w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Product preview */}
            {rejectModal.images?.[0] && (
              <div className="w-full h-32 rounded-xl overflow-hidden mb-4 bg-muted">
                <img src={rejectModal.images[0]} alt={rejectModal.name} className="w-full h-full object-cover" />
              </div>
            )}

            <label className="block text-sm font-semibold text-foreground mb-2">
              Rad etish sababi <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Masalan: Rasm sifati yetarli emas, narx noto'g'ri ko'rsatilgan, tavsif to'liq emas..."
              rows={4}
              className="w-full px-4 py-3 bg-muted/50 border border-border/60 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300 mb-4"
            />
            <p className="text-xs text-muted-foreground mb-4">Bu xabar sotuvchiga ko'rsatiladi</p>

            <div className="flex gap-3">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(""); }}
                className="flex-1 h-10 rounded-xl bg-muted text-foreground text-sm font-semibold hover:bg-muted/80 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectReason.trim() || rejectMutation.isPending}
                className="flex-1 h-10 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                {rejectMutation.isPending ? "Rad etilmoqda..." : "Rad etish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
