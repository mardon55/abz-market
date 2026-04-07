import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { MobileLayout } from "@/components/layout/MobileLayout";
import {
  Plus, Package, Clock, CheckCircle, XCircle,
  Trash2, X, ChevronDown, ImageIcon,
  AlertCircle, RefreshCw, Star, Send,
  Pencil, RotateCcw, Tag, Palette, Ruler,
  ToggleLeft, ToggleRight, Settings, Camera, Save,
  MapPin, Phone,
} from "lucide-react";
import { hapticFeedback } from "@/hooks/use-telegram";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────
interface SellerInfo { storeId: string; storeName: string; }
interface StoreData {
  id: string; name: string; isVerified: boolean; type: string;
  phone: string | null; location: string | null; productCount: number;
  logo: string | null; description: string | null;
}
interface Product {
  id: string; name: string; price: string; oldPrice: string | null;
  images: string[] | null; categoryId: string | null; categoryName: string | null;
  status: string; isFeatured: boolean; discount: number | null;
  description: string | null; rating: string; reviewCount: number;
  salesCount: number; rejectionReason: string | null;
  colors: string[] | null; sizes: string[] | null; dimensions: string | null;
  deliveryDays: number | null; quantity: number | null;
  warranty: string | null;
}
interface Category { id: string; name: string; icon: string | null; }

function loadSeller(): SellerInfo | null {
  try { const r = localStorage.getItem("abz_seller"); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
function formatPrice(n: number) { return n.toLocaleString("ru-RU") + " so'm"; }

const STATUS_MAP = {
  pending:  { label: "Kutilmoqda",   cls: "bg-amber-100 text-amber-700",    icon: Clock },
  approved: { label: "Tasdiqlangan", cls: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  rejected: { label: "Rad etilgan",  cls: "bg-red-100 text-red-600",        icon: XCircle },
};

// ── Image compression ─────────────────────────────────────────
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX = 1200;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width >= height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ── Category-specific spec fields ─────────────────────────────
interface SpecField {
  key: string; label: string;
  type: "text" | "number" | "select" | "toggle";
  unit?: string; options?: string[]; placeholder?: string;
}
interface CategorySpec { names: string[]; emoji: string; fields: SpecField[]; }

const KORPUS_OPTIONS = ["LDSP Laminat","MDF","Eman massiv","Sosna massiv","Metall","Plastik","Kombinatsiya (LDSP+MDF)"];
const FASAD_OPTIONS  = ["MDF bo'yalgan (emal)","Akril","Eman furnir","Matt laminat","PVC plyonka","Shisha (tempered)","Plastik ABS","Alyuminiy profil","Kombinatsiya"];

const CATEGORY_SPECS: CategorySpec[] = [
  {
    names: ["Shkaflar"],
    emoji: "🚪",
    fields: [
      { key: "corpusMat",  label: "Korpus materiali (karkasi)",        type: "select", options: KORPUS_OPTIONS },
      { key: "facadeMat",  label: "Fasad materiali (ko'rinadigan yuz)", type: "select", options: FASAD_OPTIONS },
      { key: "color",      label: "Asosiy rangi",         type: "text",   placeholder: "masalan: Oq, Wenge, Yong'oq" },
      { key: "width",      label: "Eni",                  type: "number", unit: "sm",  placeholder: "masalan: 150" },
      { key: "height",     label: "Balandligi",           type: "number", unit: "sm",  placeholder: "masalan: 200" },
      { key: "depth",      label: "Chuqurligi",           type: "number", unit: "sm",  placeholder: "masalan: 60" },
      { key: "doors",      label: "Eshiklar soni",        type: "select", options: ["1","2","3","4","Kupe (slayder)","Akkordeon"] },
      { key: "drawers",    label: "Tortmachalar soni",    type: "select", options: ["0","1","2","3","4","5+"] },
      { key: "mirror",     label: "Ko'zgu mavjud",        type: "toggle" },
      { key: "assembly",   label: "Yig'ilgan holda yetkazish", type: "toggle" },
    ],
  },
  {
    names: ["Komodlar"],
    emoji: "🗄️",
    fields: [
      { key: "corpusMat",  label: "Korpus materiali (karkasi)",        type: "select", options: KORPUS_OPTIONS },
      { key: "facadeMat",  label: "Fasad materiali (ko'rinadigan yuz)", type: "select", options: FASAD_OPTIONS },
      { key: "color",      label: "Rangi",                type: "text",   placeholder: "masalan: Oq, Jigarrang" },
      { key: "width",      label: "Eni",                  type: "number", unit: "sm",  placeholder: "masalan: 80" },
      { key: "height",     label: "Balandligi",           type: "number", unit: "sm",  placeholder: "masalan: 100" },
      { key: "depth",      label: "Chuqurligi",           type: "number", unit: "sm",  placeholder: "masalan: 45" },
      { key: "drawers",    label: "Tortmachalar soni",    type: "select", options: ["2","3","4","5","6","7+"] },
      { key: "topGlass",   label: "Shisha ustlik",        type: "toggle" },
      { key: "mirror",     label: "Ko'zgu bilan",         type: "toggle" },
    ],
  },
  {
    names: ["Oshxonalar"],
    emoji: "🍳",
    fields: [
      { key: "corpusMat",    label: "Korpus materiali (karkasi)",          type: "select", options: KORPUS_OPTIONS },
      { key: "facadeMat",    label: "Fasad materiali (eshik va dekorlar)", type: "select", options: ["MDF bo'yalgan (emal)","Akril","Plastik PVC","Eman furnir","Matt laminat","Ekran (reklam. plyonka)","Shisha (tempered)","Alyuminiy profil"] },
      { key: "color",        label: "Asosiy rangi",        type: "text",   placeholder: "masalan: Oq, Kulrang, Yashil" },
      { key: "shape",        label: "Rejasi (shakli)",     type: "select", options: ["To'g'ri (lineynyy)","L-shakl","U-shakl","P-shakl","Orolcha bilan"] },
      { key: "totalLen",     label: "Umumiy uzunlik",      type: "number", unit: "sm",  placeholder: "masalan: 300" },
      { key: "upperH",       label: "Yuqori shkaf balandligi", type: "number", unit: "sm", placeholder: "masalan: 72" },
      { key: "countertop",   label: "Ish yuzasi (stoleshnitsa)", type: "select", options: ["LDSP","Granit","Sun'iy tosh","Eman massiv","Kompozit","Kvarts"] },
      { key: "sink",         label: "Lavabo bilan",        type: "toggle" },
      { key: "appliances",   label: "Texnika kiritilgan",  type: "toggle" },
      { key: "hood",         label: "Degaz (vытяжка) bilan", type: "toggle" },
    ],
  },
  {
    names: ["Yotoqona", "Yotoqxona"],
    emoji: "🛏️",
    fields: [
      { key: "corpusMat",  label: "Korpus materiali (karkasi)",        type: "select", options: KORPUS_OPTIONS },
      { key: "facadeMat",  label: "Fasad materiali (ko'rinadigan yuz)", type: "select", options: FASAD_OPTIONS },
      { key: "setType",    label: "Garnitur turi",        type: "select", options: ["To'liq garnitur","Faqat karavot","Karavot + shkaf","Karavot + shkaf + komod"] },
      { key: "color",      label: "Rangi",                type: "text",   placeholder: "masalan: Oq, Wenge, Marra" },
      { key: "bedSize",    label: "Karavot o'lchami",     type: "select", options: ["90×200","160×220","180×220","170×210","120×200","140×200","200×200"] },
      { key: "headboard",  label: "Bosh to'ri (izgolov'e)", type: "select", options: ["Yumshoq to'r","Qattiq to'r","Kamarli","Yog'ochdan","Maxsus dizayn"] },
      { key: "storage",    label: "Qutilar bilan (yotoq ostida)", type: "toggle" },
      { key: "mattress",   label: "Matras bilan birga",   type: "toggle" },
      { key: "nightstand", label: "Tungi stol bilan",     type: "toggle" },
    ],
  },
  {
    names: ["Karavotlar"],
    emoji: "🛌",
    fields: [
      { key: "corpusMat",  label: "Korpus materiali (asosiy karkasi)",  type: "select", options: KORPUS_OPTIONS },
      { key: "facadeMat",  label: "Fasad materiali (ko'rinadigan qism)", type: "select", options: ["MDF bo'yalgan","Eko-teri qoplama","Mato qoplama","Yog'och massiv (eman/sosna)","Metall profil","Laminat"] },
      { key: "color",      label: "Rangi",                type: "text",   placeholder: "masalan: Oq, Jigarrang, Qora" },
      { key: "size",       label: "O'lcham (uzun × keng)", type: "select", options: ["90×200","160×220","180×220","170×210","120×200","140×200","200×200"] },
      { key: "height",     label: "Poldan to'shak yuzasigacha", type: "number", unit: "sm", placeholder: "masalan: 45" },
      { key: "headboard",  label: "Bosh to'ri turi",      type: "select", options: ["Yumshoq qoplama","Qattiq yog'och","Metaldan","Kamarli","Boshi yo'q"] },
      { key: "storage",    label: "Qutilar bilan (pastda)", type: "toggle" },
      { key: "mattress",   label: "Matras bilan birga",   type: "toggle" },
      { key: "slats",      label: "Reykalar (latylar) bilan", type: "toggle" },
    ],
  },
  {
    names: ["Divonlar"],
    emoji: "🛋️",
    fields: [
      { key: "corpusMat",  label: "Korpus materiali (karkas)",          type: "select", options: ["Yog'och (qayın/eman)","Metall","Plastik tayanch","Kombinatsiya (yog'och+metall)"] },
      { key: "facadeMat",  label: "Fasad materiali (qoplama — obivka)", type: "select", options: ["Haqiqiy teri","Eko-teri","Mato (trikotaj)","Velur","Mikrofiber","Bukle","Shenil","Chenille"] },
      { key: "color",      label: "Rangi",                type: "text",   placeholder: "masalan: Kulrang, Bej, To'q jigarrang" },
      { key: "shape",      label: "Shakli",               type: "select", options: ["To'g'ri (klassik)","L-shakl (uglovoy)","U-shakl","Modul","Ottoman bilan"] },
      { key: "length",     label: "Uzunligi (eni)",        type: "number", unit: "sm",  placeholder: "masalan: 220" },
      { key: "depth",      label: "Chuqurligi (o'tirilganda)", type: "number", unit: "sm", placeholder: "masalan: 90" },
      { key: "seats",      label: "O'tirish joylari",     type: "select", options: ["2","3","4","5","6+","Modul"] },
      { key: "foldable",   label: "Yotiladigan (razkladnoy)", type: "toggle" },
      { key: "storage",    label: "Qutilar bilan (ichida)", type: "toggle" },
      { key: "pillows",    label: "Dekorativ yostiqlar bilan", type: "toggle" },
    ],
  },
  {
    names: ["Kreslo"],
    emoji: "🪑",
    fields: [
      { key: "corpusMat",  label: "Korpus materiali (karkas)",          type: "select", options: ["Yog'och (qayın/eman)","Metall","Plastik tayanch","Kombinatsiya (yog'och+metall)"] },
      { key: "facadeMat",  label: "Fasad materiali (qoplama — obivka)", type: "select", options: ["Haqiqiy teri","Eko-teri","Mato","Velur","Bukle","Shenil","Mikrofiber"] },
      { key: "color",      label: "Rangi",                type: "text",   placeholder: "masalan: Jigarrang, Bej, Yashil" },
      { key: "type",       label: "Kreslo turi",          type: "select", options: ["Klassik","Bergere (katta)","Ofis","Aylanadigan","Teri massaj","Salona"] },
      { key: "width",      label: "Eni",                  type: "number", unit: "sm",  placeholder: "masalan: 80" },
      { key: "depth",      label: "Chuqurligi",           type: "number", unit: "sm",  placeholder: "masalan: 85" },
      { key: "height",     label: "Balandligi",           type: "number", unit: "sm",  placeholder: "masalan: 95" },
      { key: "foldable",   label: "Yotiladigan",          type: "toggle" },
      { key: "armrests",   label: "Qo'ltiqchalar bilan",  type: "toggle" },
      { key: "swivel",     label: "Aylanadigan (360°)",   type: "toggle" },
    ],
  },
  {
    names: ["Stollar"],
    emoji: "🍽️",
    fields: [
      { key: "corpusMat",  label: "Korpus materiali (oyoqlar / tayanch)", type: "select", options: ["Metall profil","Eman massiv","MDF","Plastik","Chrome metall","Kombinatsiya (metall+yog'och)"] },
      { key: "facadeMat",  label: "Fasad materiali (stol yuzasi)",       type: "select", options: ["Eman massiv","MDF + laminat","Shisha (tempered)","Mramor (tabiiy)","Granit","Keramika","LDSP","Kvarts (kompozit)"] },
      { key: "tableType",  label: "Stol turi",            type: "select", options: ["Ovqat stoli","Kofe stoli","Yozuv stoli","Jurnal stoli","Konsolka","Burchak stoli","Transformerli"] },
      { key: "color",      label: "Rangi",                type: "text",   placeholder: "masalan: Qora, Oq, Yog'och" },
      { key: "length",     label: "Uzunligi",             type: "number", unit: "sm",  placeholder: "masalan: 160" },
      { key: "width",      label: "Eni",                  type: "number", unit: "sm",  placeholder: "masalan: 90" },
      { key: "height",     label: "Balandligi",           type: "number", unit: "sm",  placeholder: "masalan: 76" },
      { key: "shape",      label: "Shakli",               type: "select", options: ["To'rtburchak","Kvadrat","Doira","Oval","Noodatiy"] },
      { key: "extendable", label: "Kengaytiriladigan (razdvizhnoy)", type: "toggle" },
      { key: "chairs",     label: "Stullar bilan birga",  type: "toggle" },
      { key: "chairCount", label: "Stullar soni",         type: "select", options: ["2","4","6","8","10+"] },
    ],
  },
  {
    names: ["Stullar"],
    emoji: "💺",
    fields: [
      { key: "corpusMat",  label: "Korpus materiali (karkas / oyoqlar)", type: "select", options: ["Eman massiv","Qayın massiv","Metall xrom","Metall qora","Plastik","Kombinatsiya (yog'och+metall)"] },
      { key: "facadeMat",  label: "Fasad materiali (o'tirgich qoplamasi)", type: "select", options: ["Haqiqiy teri","Eko-teri","Mato (trikotaj)","Velur","Plastik (monolit)","Yog'och (tabiiy)","Shenil"] },
      { key: "chairType",  label: "Stul turi",            type: "select", options: ["Oshxona stuli","Ofis kreslo","Bar stuli","Mulyazh (dekorativ)","Bolalar stuli"] },
      { key: "color",      label: "Rangi",                type: "text",   placeholder: "masalan: Qora, Bej, Kulrang" },
      { key: "height",     label: "O'tirgich balandligi", type: "number", unit: "sm",  placeholder: "masalan: 46" },
      { key: "armrests",   label: "Qo'ltiqchalar bilan",  type: "toggle" },
      { key: "adjustable", label: "Balandlik sozlanadi",  type: "toggle" },
      { key: "wheels",     label: "G'ildiraklar bilan",   type: "toggle" },
      { key: "foldable",   label: "Bukiladigan (skladnoy)", type: "toggle" },
    ],
  },
  {
    names: ["Javonlar"],
    emoji: "📚",
    fields: [
      { key: "corpusMat",  label: "Korpus materiali (karkasi)",        type: "select", options: KORPUS_OPTIONS },
      { key: "facadeMat",  label: "Fasad materiali (ko'rinadigan yuz)", type: "select", options: [...FASAD_OPTIONS, "Metall to'r","Ochiq (fasadsiz)"] },
      { key: "shelfType",  label: "Javon turi",           type: "select", options: ["Kitob javoni","Dekorativ javon","Garderob tizimi","Oshxona javoni","Ofis javoni","Devorga mahkamlanadigan"] },
      { key: "color",      label: "Rangi",                type: "text",   placeholder: "masalan: Oq, Wenge, Qora" },
      { key: "width",      label: "Eni",                  type: "number", unit: "sm",  placeholder: "masalan: 80" },
      { key: "height",     label: "Balandligi",           type: "number", unit: "sm",  placeholder: "masalan: 200" },
      { key: "depth",      label: "Chuqurligi",           type: "number", unit: "sm",  placeholder: "masalan: 30" },
      { key: "shelves",    label: "Javonlar soni",        type: "select", options: ["2","3","4","5","6","7","8","9+"] },
      { key: "doors",      label: "Eshiklar bilan",       type: "toggle" },
      { key: "wallMount",  label: "Devorga o'rnatiladi",  type: "toggle" },
      { key: "glass",      label: "Shisha eshiklar",      type: "toggle" },
    ],
  },
  {
    names: ["Matraslar"],
    emoji: "💤",
    fields: [
      { key: "corpusMat",  label: "Korpus (ichki to'ldirma) materiali", type: "select", options: ["Memory foam (viskoeластik)","Lateks (tabiiy)","Lateks (sintetik)","Kokonut qatlam","Yay: Bonnel (bog'liq)","Yay: Pocket (mustaqil)","Poliuretan köpük","Gibrid (yay+foam)"] },
      { key: "facadeMat",  label: "Fasad (qoplama chehlа) materiali",   type: "select", options: ["Jacquard (to'qilgan)","Trikotaj mato","Aloe vera qoplama","Bambuk qatlam","Eurotop (qo'shimcha yumshoq qatlam)","3D mesh (havo o'tkazuvchi)"] },
      { key: "matType",    label: "Matras turi",          type: "select", options: ["Yay (prujina) bilan","Prujinasiz (bespruzhinniy)","Ortopedik","Memory foam","Lateks","Kokonut qatlam","Gibrid"] },
      { key: "size",       label: "O'lcham",              type: "select", options: ["60×120 (bola)","70×140","80×190","90×200","120×200","140×200","160×200","180×200","200×200"] },
      { key: "thickness",  label: "Qalinligi",            type: "number", unit: "sm",  placeholder: "masalan: 20" },
      { key: "firmness",   label: "Qattiqlik darajasi",   type: "select", options: ["Juda yumshoq","Yumshoq","O'rta-yumshoq","O'rta","O'rta-qattiq","Qattiq","Juda qattiq"] },
      { key: "warranty",   label: "Kafolat",              type: "select", options: ["1 yil","2 yil","3 yil","5 yil","7 yil","10 yil","15 yil","20 yil"] },
      { key: "removeCover", label: "Qoplama yechish mumkin", type: "toggle" },
      { key: "twoSides",   label: "Ikki tomonlama (turnover)", type: "toggle" },
    ],
  },
  {
    names: ["Bola xonasi"],
    emoji: "🧸",
    fields: [
      { key: "corpusMat",  label: "Korpus materiali (karkasi)",        type: "select", options: ["LDSP Laminat (xavfsiz)","MDF (xavfsiz)","Eman massiv","Sosna massiv","Plastik (sertifikatlangan)","Kombinatsiya"] },
      { key: "facadeMat",  label: "Fasad materiali (ko'rinadigan yuz)", type: "select", options: ["MDF bo'yalgan (xavfsiz emal)","Akril","Eman furnir","Matt laminat","PVC plyonka","Mato qoplama (dekorativ)"] },
      { key: "setType",    label: "Garnitur turi",        type: "select", options: ["To'liq garnitur","Faqat karavot","Burchak (uglovoy) karavot","Stol + stul","Shkaf","Ikki qavatli karavot"] },
      { key: "ageGroup",   label: "Yosh guruh",           type: "select", options: ["0–3 yosh","3–7 yosh","7–12 yosh","12–17 yosh","Universal"] },
      { key: "color",      label: "Rangi",                type: "text",   placeholder: "masalan: Oq, Pushti, Ko'k" },
      { key: "bedSize",    label: "Karavot o'lchami",     type: "select", options: ["60×120","70×140","80×160","80×200","90×200"] },
      { key: "safeCoat",   label: "Xavfsiz ekologik lak / bo'yoq", type: "toggle" },
      { key: "storage",    label: "Yashirma tortmachalar bilan", type: "toggle" },
      { key: "study",      label: "Yozuv stoli bilan",    type: "toggle" },
      { key: "bunk",       label: "Ikki qavatli (supraloft)", type: "toggle" },
    ],
  },
  {
    names: ["Ofis mebeli"],
    emoji: "🖥️",
    fields: [
      { key: "corpusMat",  label: "Korpus materiali (karkasi)",        type: "select", options: KORPUS_OPTIONS },
      { key: "facadeMat",  label: "Fasad materiali (ko'rinadigan yuz)", type: "select", options: FASAD_OPTIONS },
      { key: "officeType", label: "Mebelning turi",       type: "select", options: ["Ish stoli","Ofis kreslo","Kitob javoni","Yig'ma to'plam (garnitur)","Qabul stoli","Kutish xonasi divani"] },
      { key: "color",      label: "Rangi",                type: "text",   placeholder: "masalan: Kulrang, Qora, Yong'oq" },
      { key: "deskW",      label: "Stol eni",             type: "number", unit: "sm",  placeholder: "masalan: 160" },
      { key: "deskD",      label: "Stol chuqurligi",      type: "number", unit: "sm",  placeholder: "masalan: 70" },
      { key: "deskH",      label: "Stol balandligi",      type: "number", unit: "sm",  placeholder: "masalan: 76" },
      { key: "pedestal",   label: "Pedestal (tirqish quti) bilan", type: "toggle" },
      { key: "cable",      label: "Sim boshqaruv tizimi", type: "toggle" },
    ],
  },
  {
    names: ["Gilamlar"],
    emoji: "🏡",
    fields: [
      { key: "rugType",    label: "Gilam turi",           type: "select", options: ["Mashinada to'qilgan","Qo'lda to'qilgan","Tafted","Kilim (yassi)","Shenil","Shaggy (uzun tuk)","Bambuk"] },
      { key: "material",   label: "Tolasi",               type: "select", options: ["Poliester","Akril","Polipropilen","Jun (wool)","Ipak","Bambuk","Viskoza","Gibrid"] },
      { key: "size",       label: "O'lcham",              type: "select", options: ["60×110","80×150","100×150","100×200","120×170","120×180","150×200","160×230","200×300","Maxsus o'lcham"] },
      { key: "pile",       label: "Tuk balandligi",       type: "select", options: ["Tuksiz (kilim)","Past (6–8 mm)","O'rta (10–15 mm)","Baland (20–30 mm)","Juda baland (shaggy 40mm+)"] },
      { key: "color",      label: "Asosiy rang / naqsh",  type: "text",   placeholder: "masalan: Bej geometrik, Kulrang abstraktsiya" },
      { key: "antislip",   label: "Pastki qismi slipmay", type: "toggle" },
      { key: "washable",   label: "Mashinada yuviladi",   type: "toggle" },
    ],
  },
  {
    names: ["Chiroqlar"],
    emoji: "💡",
    fields: [
      { key: "lightType",  label: "Chiroq turi",          type: "select", options: ["Lyustra (shiftga)","Bra (devorga)","Torshyer (polda)","Stol chiroqi","Spot (nuqtaviy)","LED panel","Track light","Arxitektura LED"] },
      { key: "style",      label: "Dizayn uslubi",        type: "select", options: ["Zamonaviy (modern)","Skandinavcha","Klassik","Loft / Industrial","Minimalizm","Art Deco","Provans"] },
      { key: "material",   label: "Korpus materiali",     type: "select", options: ["Metall xrom","Metall qora","Bronza / Oltin","Mis","Shisha + metall","Akrilik","Qog'oz / Mato"] },
      { key: "colorTemp",  label: "Rang harorati",        type: "select", options: ["2700K – Issiq oq (xona)","3000K – Iliq oq","4000K – Tabiiy oq","5000–6500K – Sovuq oq (ofis)"] },
      { key: "power",      label: "Quvvati",              type: "number", unit: "W",   placeholder: "masalan: 40" },
      { key: "diameter",   label: "Diametr / Eni",        type: "number", unit: "sm",  placeholder: "masalan: 60" },
      { key: "bulbBase",   label: "Patron (razem)",       type: "select", options: ["E27","E14","E40","GU10","GU5.3","G9","LED o'rnatilgan","G13 (lyuminessent)"] },
      { key: "dimmable",   label: "Yorqinlik boshqariladi (dimmer)", type: "toggle" },
      { key: "remote",     label: "Pult bilan",           type: "toggle" },
      { key: "bulbIncl",   label: "Lampa kiritilgan",     type: "toggle" },
    ],
  },
];

// ── Find spec for a given category name ────────────────────────
function getSpecForCategory(catName: string | null): CategorySpec | null {
  if (!catName) return null;
  return CATEGORY_SPECS.find((s) =>
    s.names.some((n) => n.toLowerCase() === catName.toLowerCase())
  ) ?? null;
}

// ── Auto-detect category from product name ─────────────────────
const KW_MAP: [string[], string[]][] = [
  [["shkaf","wardrobe","garderob","kupe"],                      ["Shkaflar"]],
  [["komod","komod","dresser","chest","kommodik"],               ["Komodlar"]],
  [["oshxona","mutfak","kitchen","garnitur oshxo"],             ["Oshxonalar"]],
  [["divan","sofa","диван","uglovoy divan"],                    ["Divonlar"]],
  [["kreslo","armchair","fotel","кресло"],                      ["Kreslo"]],
  [["stol","masa","table","jurnal stoli","coffee table"],       ["Stollar"]],
  [["stul","chair","taburet","bar stul"],                       ["Stullar"]],
  [["javon","shelf","polka","kitob","bookcase","stellaj"],       ["Javonlar"]],
  [["karavot","kravat","bed","кровать"],                        ["Karavotlar"]],
  [["matras","mattress"],                                       ["Matraslar"]],
  [["bola","kids","детская","bolalar"],                         ["Bola xonasi"]],
  [["ofis","office"],                                          ["Ofis mebeli"]],
  [["gilam","carpet","kovyor","kilim"],                         ["Gilamlar"]],
  [["chiroq","lampa","lamp","lyustra","bra","torshyer","led"],  ["Chiroqlar"]],
  [["yotoq","yotoqxona","bedroom","garnitur yotoq"],            ["Yotoqona","Yotoqxona"]],
];

function detectCategory(name: string, cats: Category[]): string {
  if (!name.trim() || !cats.length) return "";
  const lower = name.toLowerCase();
  for (const c of cats) {
    if (lower.includes(c.name.toLowerCase())) return c.id;
  }
  for (const [words, targetNames] of KW_MAP) {
    if (words.some((w) => lower.includes(w))) {
      for (const tName of targetNames) {
        const found = cats.find((c) => c.name.toLowerCase() === tName.toLowerCase());
        if (found) return found.id;
      }
    }
  }
  return "";
}

// ── Price % ────────────────────────────────────────────────────
function calcPctDiff(newP: string, oldP: string): number | null {
  const n = parseFloat(newP.replace(/[\s,]/g, ""));
  const o = parseFloat(oldP.replace(/[\s,]/g, ""));
  if (!n || !o || o === 0) return null;
  return Math.round(((n - o) / o) * 100);
}

// ── Serialize specs to dimensions string ───────────────────────
function serializeSpecs(specs: Record<string, string>, specDef: CategorySpec): string {
  const parts: string[] = [];
  for (const field of specDef.fields) {
    const val = specs[field.key];
    if (!val || val === "Yo'q") continue;
    const valStr = field.unit ? `${val} ${field.unit}` : val;
    parts.push(`${field.label}: ${valStr}`);
  }
  return parts.join(" | ");
}

// ── Preset chip options ────────────────────────────────────────
const PRESET_COLORS = ["Oq","Qora","Kulrang","Ko'k","Yashil","Qizil","Sariq","Jigarrang","Bej","Binafsha","To'q sariq","Pushti"];
const PRESET_SIZES  = ["S","M","L","XL","XXL","XXXL"];
const PRESET_SIZES_BED = ["90×200","160×220","180×220","170×210","120×200","140×200","200×200"];
// Note: Also used for Matraslar (mattress) category
const MAX_IMAGES = 6;

// ── ChipInput ─────────────────────────────────────────────────
function ChipInput({ label, icon: Icon, items, onAdd, onRemove, placeholder, presets }: {
  label: string; icon: React.ElementType; items: string[];
  onAdd: (v: string) => void; onRemove: (i: number) => void;
  placeholder: string; presets?: string[];
}) {
  const [val, setVal] = useState("");
  const add = () => { const t = val.trim(); if (t && !items.includes(t)) onAdd(t); setVal(""); };
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2">
        <Icon className="w-3.5 h-3.5" /> {label}
      </label>
      {presets && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {presets.map((p) => {
            const active = items.includes(p);
            return (
              <button key={p} type="button"
                onClick={() => active ? onRemove(items.indexOf(p)) : onAdd(p)}
                className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all",
                  active ? "bg-primary text-white border-primary" : "bg-muted/60 text-muted-foreground border-border/60"
                )}>{p}</button>
            );
          })}
        </div>
      )}
      {items.filter((i) => !presets?.includes(i)).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {items.filter((i) => !presets?.includes(i)).map((chip, _idx) => (
            <span key={chip} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-semibold">
              {chip}
              <button type="button" onClick={() => onRemove(items.indexOf(chip))} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input value={val} onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 h-9 px-3 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button type="button" onClick={add} disabled={!val.trim()}
          className="h-9 px-3 bg-primary/10 text-primary rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-primary/20 transition-colors"
        >+ Qo'sh</button>
      </div>
    </div>
  );
}

// ── Dynamic spec section ───────────────────────────────────────
function SpecSection({ specDef, specs, onChange }: {
  specDef: CategorySpec;
  specs: Record<string, string>;
  onChange: (key: string, val: string) => void;
}) {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{specDef.emoji}</span>
        <span className="text-xs font-bold text-primary">
          {specDef.names[0]} xususiyatlari
        </span>
        <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-md ml-auto">
          Majburiy
        </span>
      </div>
      {specDef.fields.map((f) => (
        <div key={f.key}>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">
            {f.label}{f.unit ? ` (${f.unit})` : ""}
          </label>
          {f.type === "select" ? (
            <div className="relative">
              <select
                value={specs[f.key] ?? ""}
                onChange={(e) => onChange(f.key, e.target.value)}
                className="w-full h-10 px-3 pr-8 bg-background border border-border/60 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">— Tanlang —</option>
                {f.options!.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          ) : f.type === "toggle" ? (
            <button
              type="button"
              onClick={() => onChange(f.key, specs[f.key] === "Bor" ? "Yo'q" : "Bor")}
              className={cn(
                "flex items-center gap-2 h-10 px-3 rounded-xl border text-sm font-semibold transition-all w-full",
                specs[f.key] === "Bor"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : "bg-muted/40 text-muted-foreground border-border/60"
              )}
            >
              {specs[f.key] === "Bor"
                ? <ToggleRight className="w-4 h-4 text-emerald-600" />
                : <ToggleLeft className="w-4 h-4" />}
              {specs[f.key] === "Bor" ? "✓ Bor" : "Yo'q"}
            </button>
          ) : (
            <div className="relative">
              <input
                type={f.type === "number" ? "number" : "text"}
                value={specs[f.key] ?? ""}
                onChange={(e) => onChange(f.key, e.target.value)}
                placeholder={f.placeholder ?? ""}
                className="w-full h-10 px-3 bg-background border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {f.unit && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                  {f.unit}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Product Modal ─────────────────────────────────────────────
function ProductModal({ storeId, categories, onClose, onSaved, editProduct }: {
  storeId: string; categories: Category[];
  onClose: () => void; onSaved: () => void;
  editProduct?: Product;
}) {
  const isEdit = !!editProduct;

  // Parse specs from dimensions string on edit
  const parseEditSpecs = (): Record<string, string> => {
    if (!editProduct?.dimensions) return {};
    const specs: Record<string, string> = {};
    editProduct.dimensions.split("|").forEach((part) => {
      const [k, ...rest] = part.split(":").map((s) => s.trim());
      if (k && rest.length) {
        // Reverse-lookup field key by label
        for (const cs of CATEGORY_SPECS) {
          const f = cs.fields.find((fd) => fd.label === k);
          if (f) { specs[f.key] = rest.join(":").trim().replace(/ (sm|W|kg)$/, ""); break; }
        }
      }
    });
    return specs;
  };

  const [name, setName]         = useState(editProduct?.name ?? "");
  const [price, setPrice]       = useState(editProduct?.price ?? "");
  const [oldPrice, setOldPrice] = useState(editProduct?.oldPrice ?? "");
  const [desc, setDesc]         = useState(editProduct?.description ?? "");
  const [images, setImages]     = useState<string[]>(editProduct?.images ?? []);
  const [catId, setCatId]       = useState(editProduct?.categoryId ?? "");
  const [colors, setColors]     = useState<string[]>(editProduct?.colors ?? []);
  const [sizes, setSizes]       = useState<string[]>(editProduct?.sizes ?? []);
  const [specs, setSpecs]       = useState<Record<string, string>>(parseEditSpecs);
  const [deliveryDays, setDeliveryDays] = useState<string>(
    editProduct?.deliveryDays ? String(editProduct.deliveryDays) : "3"
  );
  const [quantity, setQuantity] = useState<string>(
    editProduct?.quantity ? String(editProduct.quantity) : "1"
  );
  const [warranty, setWarranty] = useState<string>(
    editProduct?.warranty ?? "1 yil"
  );
  const [saving, setSaving]     = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError]       = useState("");
  const [autoDetected, setAutoDetected] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect category
  useEffect(() => {
    if (!name.trim() || catId) return;
    const detected = detectCategory(name, categories);
    if (detected) { setCatId(detected); setAutoDetected(true); }
    else setAutoDetected(false);
  }, [name]);

  const handleCatChange = (v: string) => { setCatId(v); setAutoDetected(false); setSpecs({}); };
  const updateSpec = (key: string, val: string) => setSpecs((p) => ({ ...p, [key]: val }));
  const pct = calcPctDiff(price, oldPrice);

  // Get current category name and spec def
  const currentCat = categories.find((c) => c.id === catId);
  const specDef = getSpecForCategory(currentCat?.name ?? null);

  const isKaravat = /karavot|karavat|kravat|bed|yotoq|matras/i.test(currentCat?.name ?? "");
  const sizePresets = isKaravat ? PRESET_SIZES_BED : PRESET_SIZES;

  const handleImageFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const toProcess = files.slice(0, MAX_IMAGES - images.length);
    setCompressing(true); setError("");
    try {
      const compressed = await Promise.all(toProcess.map(async (f) => {
        if (f.size > 15 * 1024 * 1024) throw new Error(`"${f.name}" 15MB dan katta`);
        return compressImage(f);
      }));
      setImages((p) => [...p, ...compressed].slice(0, MAX_IMAGES));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Rasm yuklanmadi");
    } finally {
      setCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Mahsulot nomini kiriting"); return; }
    if (!price.trim()) { setError("Narxni kiriting"); return; }
    const priceNum = parseFloat(price.replace(/[\s,]/g, ""));
    if (isNaN(priceNum) || priceNum <= 0) { setError("Narx noto'g'ri"); return; }
    const oldPriceNum = oldPrice ? parseFloat(oldPrice.replace(/[\s,]/g, "")) : null;
    const dimensionsStr = specDef ? serializeSpecs(specs, specDef) : null;

    setSaving(true); setError("");
    try {
      const body: Record<string, unknown> = {
        name: name.trim(), price: String(priceNum),
        oldPrice: oldPriceNum ? String(oldPriceNum) : null,
        description: desc.trim() || null, images,
        categoryId: catId || null, storeId,
        colors: colors.length ? colors : null,
        sizes: sizes.length ? sizes : null,
        dimensions: dimensionsStr || null,
        deliveryDays: parseInt(deliveryDays) || 3,
        quantity: parseInt(quantity) || 1,
        warranty: warranty || "1 yil",
      };

      let res: Response;
      if (isEdit && editProduct) {
        res = await fetch(`/api/products/${editProduct.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, action: "resubmit" }),
        });
      } else {
        res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, status: "pending" }),
        });
      }
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error((b as { error?: string }).error ?? "Xato yuz berdi");
      }
      hapticFeedback("success");
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Xato yuz berdi");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mt-auto bg-background rounded-t-3xl shadow-2xl flex flex-col" >

        {/* Header */}
        <div className="shrink-0">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mt-3" />
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
            <h2 className="font-display font-bold text-base">
              {isEdit ? "Mahsulotni tahrirlash" : "Mahsulot qo'shish"}
            </h2>
            <button type="button" onClick={onClose}
              className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Submit button — always visible at top */}
        <div className="shrink-0 px-5 pt-3 pb-3 border-b border-border/60 bg-background">
          <button type="button" onClick={handleSubmit} disabled={saving || compressing}
            className="w-full h-14 bg-gradient-to-r from-primary to-violet-500 text-white font-display font-bold text-base rounded-2xl flex items-center justify-center gap-2.5 disabled:opacity-60 shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform"
          >
            {saving
              ? <><span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Yuborilmoqda...</>
              : <><Send className="w-5 h-5" />{isEdit ? "Qayta tekshirishga yuborish" : "Adminga yuborish"}</>}
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-5 py-4 pb-2 space-y-4 max-h-[55vh]">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{error}</span>
            </div>
          )}
          {isEdit && editProduct?.status === "approved" && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2.5 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
              <span>⚠️ Tasdiqlangan mahsulotni tahrirlasangiz, u admin qayta tasdiqlashiga yuboriladi va vaqtincha ko'rinmay qoladi.</span>
            </div>
          )}
          {isEdit && editProduct?.status !== "approved" && (
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2.5 rounded-xl text-sm">
              <RotateCcw className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Ma'lumotlarni to'g'rilang — keyin adminga qayta yuboring</span>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Mahsulot nomi *</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="masalan: 3 eshikli kupe shkaf"
              className="w-full h-11 px-4 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Category */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Kategoriya</label>
              {autoDetected && catId && (
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md font-semibold">
                  ✓ Avtomatik aniqlandi
                </span>
              )}
            </div>
            <div className="relative">
              <select value={catId} onChange={(e) => handleCatChange(e.target.value)}
                className="w-full h-11 px-4 pr-9 bg-muted/50 border border-border/60 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">— Kategoriya tanlang —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon ? c.icon + " " : ""}{c.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            {specDef && (
              <p className="text-[11px] text-primary mt-1.5 font-semibold">
                {specDef.emoji} {specDef.names[0]} uchun qo'shimcha ma'lumotlar quyida so'raladi ↓
              </p>
            )}
          </div>

          {/* Category-specific spec fields */}
          {specDef && (
            <SpecSection specDef={specDef} specs={specs} onChange={updateSpec} />
          )}

          {/* Prices */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Narxlar</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] text-muted-foreground mb-1">Joriy narx (so'm) *</div>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                  placeholder="1200000"
                  className="w-full h-11 px-4 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground mb-1">Eski narx (chegirmadan avval)</div>
                <input type="number" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)}
                  placeholder="1500000"
                  className="w-full h-11 px-4 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            {pct !== null && (
              <div className={cn("mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold border",
                pct < 0
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-orange-50 text-orange-700 border-orange-200"
              )}>
                <Tag className="w-3.5 h-3.5" />
                {pct < 0
                  ? <><span className="text-lg font-black">−{Math.abs(pct)}%</span> ga arzonlashgan</>
                  : <><span className="text-lg font-black">+{pct}%</span> ga qimmatlashgan</>}
              </div>
            )}
          </div>

          {/* Images */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground">
                Rasmlar ({images.length}/{MAX_IMAGES})
              </span>
              {images.length > 0 && <span className="text-[10px] text-muted-foreground">Birinchi — asosiy rasm</span>}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {images.map((src, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden bg-muted border-2 border-primary/30">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <div className="absolute bottom-0 inset-x-0 bg-primary/80 text-white text-[9px] font-bold text-center py-0.5">Asosiy</div>
                  )}
                  <button type="button" onClick={() => setImages((p) => p.filter((_, i) => i !== idx))}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <label htmlFor="mi-inp" className={cn(
                  "aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all",
                  compressing ? "border-primary/40 bg-primary/5" : "border-border active:bg-muted/60"
                )}>
                  {compressing
                    ? <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    : (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-1">
                          <ImageIcon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-[10px] font-semibold text-primary text-center px-1">
                          {images.length === 0 ? "📷 Rasm qo'shish" : "+ Qo'shish"}
                        </span>
                      </>
                    )}
                  <input id="mi-inp" ref={fileInputRef} type="file" accept="image/*" multiple
                    className="hidden" onChange={handleImageFiles} />
                </label>
              )}
            </div>
            {images.length === 0 && (
              <p className="text-[11px] text-muted-foreground mt-2 text-center">1–6 ta rasm (avtomatik siqiladi, maks 15MB)</p>
            )}
          </div>

          {/* Colors */}
          <ChipInput label="Mavjud ranglar" icon={Palette} items={colors}
            onAdd={(v) => setColors((p) => [...p, v])}
            onRemove={(i) => setColors((p) => p.filter((_, j) => j !== i))}
            placeholder="Rang kiriting..." presets={PRESET_COLORS}
          />

          {/* Sizes */}
          <ChipInput
            label={isKaravat ? "Karavot o'lchamlari" : "Mavjud o'lchamlar (razmerlar)"}
            icon={Ruler} items={sizes}
            onAdd={(v) => setSizes((p) => [...p, v])}
            onRemove={(i) => setSizes((p) => p.filter((_, j) => j !== i))}
            placeholder={isKaravat ? "O'lcham tanlang yoki kiriting (masalan: 90×200)" : "O'lcham kiriting (masalan: 160×80×75 sm)"}
            presets={sizePresets}
          />

          {/* Delivery days */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              🚚 Yetkazib berish muddati *
            </label>
            <div className="relative">
              <select
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
                className="w-full h-11 px-4 pr-9 bg-muted/50 border border-border/60 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="1">1 kun ichida (ekpress)</option>
                <option value="2">2 kun ichida</option>
                <option value="3">3 kun ichida</option>
                <option value="5">3–5 kun ichida</option>
                <option value="7">5–7 kun ichida</option>
                <option value="14">7–14 kun ichida</option>
                <option value="30">14–30 kun ichida</option>
                <option value="0">Kelishiladi (aloqa orqali)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Warranty */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              🛡️ Kafolat muddati *
            </label>
            <div className="relative">
              <select
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                className="w-full h-11 px-4 pr-9 bg-muted/50 border border-border/60 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="3 oy">3 oy</option>
                <option value="6 oy">6 oy</option>
                <option value="1 yil">1 yil</option>
                <option value="1.5 yil">1.5 yil</option>
                <option value="2 yil">2 yil</option>
                <option value="3 yil">3 yil</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              📦 Ombordagi miqdor (dona) *
            </label>
            <input
              type="number"
              min="1"
              max="9999"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1"
              className="w-full h-11 px-4 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Qo'shimcha tavsif (ixtiyoriy)</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3}
              placeholder="Mahsulot haqida qo'shimcha ma'lumot: yig'ish, kafolat, maxsus xususiyatlar..."
              className="w-full px-4 py-3 bg-muted/50 border border-border/60 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-sm text-amber-800">
            <Clock className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" />
            <span>Admin tasdiqlashidan so'ng 24 soat ichida mijozlarga ko'rinadi</span>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Edit Store Modal ──────────────────────────────────────────
function EditStoreModal({
  storeId, storeName: initialName, onClose, onSaved,
}: {
  storeId: string; storeName: string; onClose: () => void; onSaved: (name: string) => void;
}) {
  const [storeData, setStoreData] = useState<Record<string, string> | null>(null);
  const [name,        setName]        = useState(initialName);
  const [phone,       setPhone]       = useState("");
  const [location,    setLocation]    = useState("");
  const [description, setDescription] = useState("");
  const [logo,        setLogo]        = useState<string | undefined>();
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [done,        setDone]        = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/stores/${storeId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((s) => {
        if (!s) return;
        setStoreData(s);
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
    try { setLogo(await compressImage(file)); setError(""); }
    catch { setError("Rasmni yuklab bo'lmadi"); }
  };

  const handleSave = async () => {
    if (!name.trim()) { setError("Do'kon nomi kiritilsin"); return; }
    setSaving(true); setError("");
    try {
      const body: Record<string, string | undefined> = { name: name.trim(), phone, location, description };
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
            <h2 className="font-display font-bold text-sm flex-1 text-center">Do'konni sozlash</h2>
            {!done && storeData !== null && (
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
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <p className="font-display font-bold text-lg">Saqlandi!</p>
            </div>
          ) : storeData === null ? (
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
              {/* Logo */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="w-24 h-24 rounded-[28px] bg-muted overflow-hidden flex items-center justify-center border-2 border-border/60">
                    {logo ? <img src={logo} alt="logo" className="w-full h-full object-cover" />
                           : <ImageIcon className="w-8 h-8 text-muted-foreground/40" />}
                  </div>
                  <button type="button" onClick={() => logoRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <button type="button" onClick={() => logoRef.current?.click()}
                  className="text-primary text-sm font-semibold">Logo yuklash</button>
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
              </div>
              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Do'kon nomi *</label>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              {/* Phone */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Telefon</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="+998 90 123 45 67"
                    className="w-full pl-10 pr-4 h-11 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              {/* Location */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Manzil</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Toshkent, Chilonzor tumani"
                    className="w-full pl-10 pr-4 h-11 bg-muted/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Tavsif</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                  placeholder="Do'kon haqida qisqacha ma'lumot..."
                  className="w-full px-4 py-3 bg-muted/50 border border-border/60 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function MyStore() {
  const [, navigate] = useLocation();
  const seller = loadSeller();

  const [store, setStore]             = useState<StoreData | null>(null);
  const [products, setProducts]       = useState<Product[]>([]);
  const [categories, setCategories]   = useState<Category[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showAdd, setShowAdd]           = useState(false);
  const [editProduct, setEditProduct]   = useState<Product | null>(null);
  const [showStoreEdit, setShowStoreEdit] = useState(false);
  const [statusFilter, setFilter]       = useState<"all"|"pending"|"approved"|"rejected">("all");

  const loadData = async () => {
    if (!seller) return;
    setLoading(true);
    try {
      const [storeRes, prodsRes, catRes] = await Promise.all([
        fetch(`/api/stores/${seller.storeId}`),
        fetch(`/api/products?storeId=${seller.storeId}&status=all`),
        fetch("/api/categories"),
      ]);
      if (storeRes.ok) setStore(await storeRes.json());
      if (prodsRes.ok) { const d = await prodsRes.json(); setProducts(d.products ?? []); }
      if (catRes.ok)   { const d = await catRes.json(); setCategories(d.categories ?? d ?? []); }
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!seller) { navigate("/register-store"); return; }
    loadData();
  }, []);

  const handleQuickResubmit = async (p: Product) => {
    if (!confirm(`"${p.name}" ni qayta tekshirishga yuborishni tasdiqlaysizmi?`)) return;
    hapticFeedback("impact");
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resubmit" }),
      });
      if (!res.ok) throw new Error();
      hapticFeedback("success"); loadData();
    } catch { alert("Xato yuz berdi"); }
  };

  if (!seller) return null;

  const filtered = products.filter((p) => statusFilter === "all" ? true : p.status === statusFilter);
  const counts = {
    all:      products.length,
    pending:  products.filter((p) => p.status === "pending").length,
    approved: products.filter((p) => p.status === "approved").length,
    rejected: products.filter((p) => p.status === "rejected").length,
  };

  return (
    <MobileLayout hideNav={false} title="Do'konim">
      <div className="px-4 pt-4 pb-24">

        {/* Store banner */}
        <div className="bg-gradient-to-br from-primary via-violet-600 to-purple-700 rounded-3xl p-4 mb-5 relative overflow-hidden shadow-ios-lg shadow-primary/30">
          <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-md" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-[18px] bg-white/20 backdrop-blur-sm flex items-center justify-center font-display font-extrabold text-2xl text-white border border-white/30 overflow-hidden">
              {store?.logo
                ? <img src={store.logo} alt="logo" className="w-full h-full object-cover" />
                : seller.storeName[0]
              }
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-bold text-white text-lg leading-tight truncate">{seller.storeName}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                <span className="text-white/80 text-xs font-semibold">Faol do'kon</span>
              </div>
              {store?.location && <p className="text-white/60 text-xs mt-0.5 truncate">{store.location}</p>}
            </div>
            <button
              onClick={() => { hapticFeedback("selection"); setShowStoreEdit(true); }}
              className="w-9 h-9 bg-white/15 rounded-2xl flex items-center justify-center shrink-0"
              title="Do'konni sozlash"
            >
              <Settings className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="relative grid grid-cols-3 gap-2 mt-4">
            {[
              { label: "Jami",         value: counts.all },
              { label: "Tasdiqlangan", value: counts.approved },
              { label: "Kutilmoqda",   value: counts.pending },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/15 rounded-2xl p-2.5 text-center backdrop-blur-sm">
                <div className="font-display font-bold text-white text-lg">{value}</div>
                <div className="text-white/70 text-[10px] font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Add button */}
        <button onClick={() => { hapticFeedback("impact"); setShowAdd(true); }}
          className="w-full h-12 bg-gradient-to-r from-primary to-violet-500 text-white font-display font-bold rounded-2xl flex items-center justify-center gap-2 shadow-ios-md shadow-primary/30 mb-5 press">
          <Plus className="w-5 h-5" /> Mahsulot qo'shish
        </button>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 mb-4 scrollbar-none">
          {(["all","pending","approved","rejected"] as const).map((s) => {
            const label = s === "all" ? "Barchasi" : STATUS_MAP[s].label;
            return (
              <button key={s} onClick={() => setFilter(s)}
                className={cn("flex-shrink-0 px-3.5 h-8 rounded-xl text-xs font-bold border transition-all",
                  statusFilter === s
                    ? "bg-primary text-white border-primary"
                    : "bg-card border-border/60 text-muted-foreground"
                )}>
                {label}{counts[s] > 0 && <span className="ml-0.5 opacity-70"> ({counts[s]})</span>}
              </button>
            );
          })}
        </div>

        {/* Product list */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" /><span className="text-sm">Yuklanmoqda...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Package className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">
              {statusFilter === "all" ? "Hali mahsulot qo'shilmagan" : STATUS_MAP[statusFilter].label + " mahsulotlar yo'q"}
            </p>
            {statusFilter === "all" && (
              <button onClick={() => { hapticFeedback("impact"); setShowAdd(true); }}
                className="mt-3 px-4 h-9 bg-primary text-white rounded-xl text-sm font-semibold flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Birinchi mahsulotni qo'shing
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => {
              const st = (p.status as keyof typeof STATUS_MAP) in STATUS_MAP
                ? p.status as keyof typeof STATUS_MAP : "pending";
              const S = STATUS_MAP[st]; const Ic = S.icon;
              const imgs = (p.images ?? []).filter(Boolean);
              const cardPct = p.oldPrice ? calcPctDiff(p.price, p.oldPrice) : null;

              return (
                <div key={p.id} className="glass-card rounded-3xl p-3.5 shadow-ios-sm">
                  <div className="flex gap-3 items-start">
                    <div className="w-16 h-16 rounded-2xl bg-muted overflow-hidden shrink-0">
                      {imgs[0]
                        ? <img src={imgs[0]} alt={p.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-5 h-5 text-muted-foreground/40" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-bold text-sm leading-tight line-clamp-2">{p.name}</div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="font-bold text-sm text-primary">{formatPrice(Number(p.price))}</span>
                        {p.oldPrice && <span className="text-xs text-muted-foreground line-through">{formatPrice(Number(p.oldPrice))}</span>}
                        {cardPct !== null && cardPct < 0 && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">−{Math.abs(cardPct)}%</span>
                        )}
                        {cardPct !== null && cardPct > 0 && (
                          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-md">+{cardPct}%</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold", S.cls)}>
                          <Ic className="w-3 h-3" />{S.label}
                        </span>
                        {p.categoryName && <span className="text-[10px] text-muted-foreground truncate">{p.categoryName}</span>}
                      </div>
                      {/* Specs preview */}
                      {p.dimensions && (
                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{p.dimensions}</p>
                      )}
                      {((p.colors?.length ?? 0) > 0 || (p.sizes?.length ?? 0) > 0) && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {p.colors?.map((c) => <span key={c} className="text-[9px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-md font-semibold">{c}</span>)}
                          {p.sizes?.map((s) => <span key={s} className="text-[9px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded-md font-semibold">{s}</span>)}
                        </div>
                      )}
                      {st === "approved" && (
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{Number(p.rating) > 0 ? Number(p.rating).toFixed(1) : "—"}</span>
                          <span>{p.salesCount} sotuv</span>
                        </div>
                      )}
                      {st === "pending" && <p className="text-[10px] text-amber-600 mt-1">⏳ Admin ko'rib chiqmoqda…</p>}
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() => { hapticFeedback("impact"); setEditProduct(p); }}
                        className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                        title="Tahrirlash"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm(`"${p.name}" o'chirilsinmi?`)) return;
                          await fetch(`/api/products/${p.id}`, { method: "DELETE" });
                          hapticFeedback("impact");
                          setProducts((prev) => prev.filter((x) => x.id !== p.id));
                        }}
                        className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-red-100 hover:text-red-500 transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {imgs.length > 1 && (
                    <div className="flex gap-2 mt-2.5 overflow-x-auto scrollbar-none">
                      {imgs.slice(1).map((src, i) => (
                        <div key={i} className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-muted">
                          <img src={src} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {st === "rejected" && (
                    <div className="mt-2.5">
                      <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-2">
                        <p className="text-[10px] font-bold text-red-600 mb-0.5">❌ Rad etildi — Sabab:</p>
                        <p className="text-[11px] text-red-500 leading-snug">
                          {p.rejectionReason ?? "Admin tomonidan rad etildi"}
                        </p>
                      </div>
                      <button onClick={() => handleQuickResubmit(p)}
                        className="w-full flex items-center justify-center gap-1.5 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                        <RotateCcw className="w-3.5 h-3.5" /> O'zgartirmasdan qayta yuborish
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAdd && seller && (
        <ProductModal storeId={seller.storeId} categories={categories}
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); hapticFeedback("success"); loadData(); }} />
      )}
      {editProduct && seller && (
        <ProductModal storeId={seller.storeId} categories={categories}
          editProduct={editProduct}
          onClose={() => setEditProduct(null)}
          onSaved={() => { setEditProduct(null); hapticFeedback("success"); loadData(); }} />
      )}
      {showStoreEdit && seller && (
        <EditStoreModal
          storeId={seller.storeId}
          storeName={seller.storeName}
          onClose={() => setShowStoreEdit(false)}
          onSaved={(newName) => {
            seller.storeName = newName;
            setShowStoreEdit(false);
            loadData();
          }}
        />
      )}
    </MobileLayout>
  );
}
