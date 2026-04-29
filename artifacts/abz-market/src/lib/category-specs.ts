// Kategoriya spec ma'lumotlari — my-store.tsx dan ajratildi
// Barcha spec fields va helper funksiyalar shu yerda

export interface Category { id: string; name: string; icon: string | null; subcategories?: Category[]; }

// ── Category-specific spec fields ─────────────────────────────
export interface SpecField {
  key: string; label: string;
  type: "text" | "number" | "select" | "toggle";
  unit?: string; options?: string[]; placeholder?: string;
}
export interface CategorySpec { names: string[]; emoji: string; fields: SpecField[]; }

export const KORPUS_OPTIONS = ["LDSP Laminat","MDF","Eman massiv","Sosna massiv","Metall","Plastik","Kombinatsiya (LDSP+MDF)"];
export const FASAD_OPTIONS  = ["MDF bo'yalgan (emal)","Akril","Eman furnir","Matt laminat","PVC plyonka","Shisha (tempered)","Plastik ABS","Alyuminiy profil","Kombinatsiya"];


export const CATEGORY_SPECS: CategorySpec[] = [
  // ══════════════════ MEBEL ══════════════════
  {
    names: ["Shkaflar", "Shkaflar va javonlar"],
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
    names: ["Oshxonalar", "Oshxona mebellar"],
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
    names: ["Yotoqona", "Yotoqxona", "Yotoq xonasi to'plam"],
    emoji: "🛏️",
    fields: [
      { key: "corpusMat",  label: "Korpus materiali (karkasi)",        type: "select", options: KORPUS_OPTIONS },
      { key: "facadeMat",  label: "Fasad materiali (ko'rinadigan yuz)", type: "select", options: FASAD_OPTIONS },
      { key: "setType",    label: "Garnitur turi",        type: "select", options: ["To'liq garnitur","Faqat karavot","Karavot + shkaf","Karavot + shkaf + komod"] },
      { key: "color",      label: "Rangi",                type: "text",   placeholder: "masalan: Oq, Wenge, Marra" },
      { key: "bedSize",    label: "Karavot o'lchami",     type: "select", options: ["90×200","160×220","180×220","170×210"] },
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
      { key: "size",       label: "O'lcham (uzun × keng)", type: "select", options: ["90×200","160×220","180×220","170×210"] },
      { key: "height",     label: "Poldan to'shak yuzasigacha", type: "number", unit: "sm", placeholder: "masalan: 45" },
      { key: "headboard",  label: "Bosh to'ri turi",      type: "select", options: ["Yumshoq qoplama","Qattiq yog'och","Metaldan","Kamarli","Boshi yo'q"] },
      { key: "storage",    label: "Qutilar bilan (pastda)", type: "toggle" },
      { key: "mattress",   label: "Matras bilan birga",   type: "toggle" },
      { key: "slats",      label: "Reykalar (latylar) bilan", type: "toggle" },
    ],
  },
  {
    names: ["Divonlar", "Divan va kreslolar"],
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
    names: ["Stollar", "Stol va stullar"],
    emoji: "🍽️",
    fields: [
      { key: "corpusMat",  label: "Oyoqlar / tayanch materiali", type: "select", options: ["Metall profil","Eman massiv","MDF","Plastik","Chrome metall","Kombinatsiya (metall+yog'och)"] },
      { key: "facadeMat",  label: "Stol yuzasi materiali",       type: "select", options: ["Eman massiv","MDF + laminat","Shisha (tempered)","Mramor (tabiiy)","Granit","Keramika","LDSP","Kvarts (kompozit)"] },
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
      { key: "corpusMat",  label: "Karkas / oyoqlar materiali", type: "select", options: ["Eman massiv","Qayın massiv","Metall xrom","Metall qora","Plastik","Kombinatsiya (yog'och+metall)"] },
      { key: "facadeMat",  label: "O'tirgich qoplamasi",        type: "select", options: ["Haqiqiy teri","Eko-teri","Mato (trikotaj)","Velur","Plastik (monolit)","Yog'och (tabiiy)","Shenil"] },
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
      { key: "facadeMat",  label: "Fasad / qoplama materiali",          type: "select", options: [...FASAD_OPTIONS, "Metall to'r","Ochiq (fasadsiz)"] },
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
    names: ["Vannaxona mebellar", "Vannaxona mebeli"],
    emoji: "🚿",
    fields: [
      { key: "corpusMat",  label: "Korpus materiali",     type: "select", options: ["MDF (suv o'tkazmaydigan)","PVC plastik","Alyuminiy","Eman massiv (lakli)","Kombinatsiya"] },
      { key: "color",      label: "Rangi",                type: "text",   placeholder: "masalan: Oq, Kulrang, Jigarrang" },
      { key: "setType",    label: "To'plam turi",         type: "select", options: ["To'liq garnitur","Faqat shkaf (tumba)","Mirror shkaf","Lavabo + tumba","Hammom shkafi (stoyak)"] },
      { key: "width",      label: "Eni",                  type: "number", unit: "sm",  placeholder: "masalan: 80" },
      { key: "height",     label: "Balandligi",           type: "number", unit: "sm",  placeholder: "masalan: 55" },
      { key: "depth",      label: "Chuqurligi",           type: "number", unit: "sm",  placeholder: "masalan: 45" },
      { key: "sink",       label: "Lavabo bilan",         type: "toggle" },
      { key: "mirror",     label: "Ko'zgu bilan",         type: "toggle" },
      { key: "light",      label: "Chiroq bilan",         type: "toggle" },
      { key: "waterproof", label: "Suv o'tkazmaydigan qoplama", type: "toggle" },
    ],
  },
  {
    names: ["Ofis mebeli", "Ofis mebellar"],
    emoji: "🖥️",
    fields: [
      { key: "corpusMat",  label: "Korpus materiali (karkasi)",        type: "select", options: KORPUS_OPTIONS },
      { key: "facadeMat",  label: "Fasad materiali (ko'rinadigan yuz)", type: "select", options: FASAD_OPTIONS },
      { key: "officeType", label: "Mebelning turi",       type: "select", options: ["Ish stoli","Ofis kreslo","Kitob javoni","Yig'ma to'plam (garnitur)","Qabul stoli","Kutish xonasi divani"] },
      { key: "color",      label: "Rangi",                type: "text",   placeholder: "masalan: Kulrang, Qora, Yong'oq" },
      { key: "deskW",      label: "Stol eni",             type: "number", unit: "sm",  placeholder: "masalan: 160" },
      { key: "deskD",      label: "Stol chuqurligi",      type: "number", unit: "sm",  placeholder: "masalan: 70" },
      { key: "deskH",      label: "Stol balandligi",      type: "number", unit: "sm",  placeholder: "masalan: 76" },
      { key: "pedestal",   label: "Pedestal (tortma qutilar) bilan", type: "toggle" },
      { key: "cable",      label: "Sim boshqaruv tizimi", type: "toggle" },
    ],
  },
  {
    names: ["Bola xonasi", "Bolalar mebellar"],
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

  // ══════════════════ YOTOQ TO'SHAKLARI ══════════════════
  {
    names: ["Matraslar"],
    emoji: "💤",
    fields: [
      { key: "corpusMat",  label: "Ichki to'ldirma materiali", type: "select", options: ["Memory foam (viskoeластik)","Lateks (tabiiy)","Lateks (sintetik)","Kokonut qatlam","Yay: Bonnel (bog'liq)","Yay: Pocket (mustaqil)","Poliuretan köpük","Gibrid (yay+foam)"] },
      { key: "facadeMat",  label: "Qoplama (chehol) materiali",   type: "select", options: ["Jacquard (to'qilgan)","Trikotaj mato","Aloe vera qoplama","Bambuk qatlam","Eurotop (qo'shimcha yumshoq qatlam)","3D mesh (havo o'tkazuvchi)"] },
      { key: "matType",    label: "Matras turi",          type: "select", options: ["Yay (prujina) bilan","Prujinasiz (bespruzhinniy)","Ortopedik","Memory foam","Lateks","Kokonut qatlam","Gibrid"] },
      { key: "size",       label: "O'lcham",              type: "select", options: ["90×200","160×220","180×220","170×210"] },
      { key: "thickness",  label: "Qalinligi",            type: "number", unit: "sm",  placeholder: "masalan: 20" },
      { key: "firmness",   label: "Qattiqlik darajasi",   type: "select", options: ["Juda yumshoq","Yumshoq","O'rta-yumshoq","O'rta","O'rta-qattiq","Qattiq","Juda qattiq"] },
      { key: "removeCover", label: "Qoplama yechish mumkin", type: "toggle" },
      { key: "twoSides",   label: "Ikki tomonlama (turnover)", type: "toggle" },
    ],
  },
  {
    names: ["Ko'rpalar va yostiqlar"],
    emoji: "🛏️",
    fields: [
      { key: "itemType",   label: "Mahsulot turi",        type: "select", options: ["Ko'rpa (odeyalo)","Yostiq","Ko'rpa-yostiq to'plami","Uyqu yostiq","Dekorativ yostiq"] },
      { key: "filling",    label: "To'ldirma materiali",  type: "select", options: ["Paxta (natura)","Sintepon","Hollofayber","Bambuk","Lateks","Memory foam","Gus pati","O'rdak pati","Mikrofiber"] },
      { key: "cover",      label: "Qoplama materiali",    type: "select", options: ["100% paxta","Satin","Mikrofibra","Baxmal (velur)","Bambuk","Keng qatlamli (tik)","Flannel"] },
      { key: "size",       label: "O'lcham",              type: "select", options: ["50×70 (yostiq)","60×60 (yostiq)","70×70","140×200 (1.5 sp)","175×210 (2 sp)","200×220 (evro)","220×240 (king)"] },
      { key: "warmth",     label: "Iliqlik darajasi",     type: "select", options: ["Yozgi (yengil)","Bahor/Kuz (o'rtacha)","Qishki (issiq)","Juda issiq (extra)"] },
      { key: "washable",   label: "Mashinada yuviladi",   type: "toggle" },
      { key: "antiAllergy",label: "Gipoallergen",         type: "toggle" },
    ],
  },
  {
    names: ["Choyshab to'plamlar"],
    emoji: "🛏️",
    fields: [
      { key: "material",   label: "Mato materiali",       type: "select", options: ["100% paxta","Ranforce (zichroq paxta)","Satin","Baxmal","Bambuk","Mikrofibra","Flannel (qishki)","Perkal"] },
      { key: "size",       label: "O'lcham",              type: "select", options: ["1.5 sp (140×200)","2 sp (175×210)","Evro (200×220)","King (220×240)","Bola (110×140)"] },
      { key: "pieces",     label: "To'plamdagi qismlar",  type: "select", options: ["3 ta (1 choyshab + 1 yostiq + 1 odeyalo)","4 ta","5 ta","6 ta","8 ta"] },
      { key: "color",      label: "Rang / Naqsh",         type: "text",   placeholder: "masalan: Oq, Ko'k chiziqli, Gul naqshli" },
      { key: "washTemp",   label: "Yuvish harorati",      type: "select", options: ["30°C","40°C","60°C","90°C"] },
      { key: "fade",       label: "Rang tushmaydigan",    type: "toggle" },
      { key: "wrinkle",    label: "Tirishmaydigan (anti-wrinkle)", type: "toggle" },
    ],
  },
  {
    names: ["Uy pardalar", "Pardalar"],
    emoji: "🪟",
    fields: [
      { key: "curtainType",label: "Parda turi",           type: "select", options: ["Klassik (to'r)","Portyer (og'ir qatlam)","Rimlyan (rollo)","Zhalyuzi (lamelli)","Plisse","Blakaut (tunda)","Organza"] },
      { key: "material",   label: "Mato materiali",       type: "select", options: ["Paxta","Poliester","Linen (zig'ir)","Velur","Organza","Blakaut qatlam","Tül (to'r)","Gibrid (paxta+poliester)"] },
      { key: "color",      label: "Rangi / Naqshi",       type: "text",   placeholder: "masalan: Kulrang, Bej, Oq geometrik" },
      { key: "width",      label: "Eni (1 kanat)",        type: "number", unit: "sm",  placeholder: "masalan: 140" },
      { key: "height",     label: "Balandligi",           type: "number", unit: "sm",  placeholder: "masalan: 260" },
      { key: "mounting",   label: "O'rnatish turi",       type: "select", options: ["Karniz (koltsolar bilan)","Lenta (tasm bilan)","Istekar / Dekor karniz","Rimlyan mexanizm","Zhalyuzi mexanizm"] },
      { key: "blackout",   label: "To'liq qoraytiradigan (blakaut)", type: "toggle" },
      { key: "washable",   label: "Mashinada yuviladi",   type: "toggle" },
    ],
  },
  {
    names: ["Dekorativ yostiqlar"],
    emoji: "🛋️",
    fields: [
      { key: "cover",      label: "Qoplama materiali",    type: "select", options: ["Baxmal (velur)","Paxta","Linen (zig'ir)","Shenil","Brokart","Mikrofibra","Ipak ko'rinishi","Knit (to'r)"] },
      { key: "filling",    label: "To'ldirma",            type: "select", options: ["Hollofayber","Sintepon","Gus pati","Lateks","Memory foam","Bo'sh (faqat qoplama)"] },
      { key: "size",       label: "O'lcham",              type: "select", options: ["30×30","40×40","45×45","50×50","60×60","40×60 (to'g'ri burchak)","50×30 (rollik)"] },
      { key: "color",      label: "Rangi / Naqshi",       type: "text",   placeholder: "masalan: Kulrang geometrik, Sariq abstrakt" },
      { key: "removeCover",label: "Qoplama yechadigan",   type: "toggle" },
      { key: "washable",   label: "Mashinada yuviladi",   type: "toggle" },
    ],
  },

  // ══════════════════ MAISHIY TEXNIKA ══════════════════
  {
    names: ["Muzlatgichlar"],
    emoji: "🧊",
    fields: [
      { key: "brand",      label: "Brend",                type: "text",   placeholder: "masalan: Samsung, LG, Artel" },
      { key: "fridgeType", label: "Muzlatgich turi",      type: "select", options: ["Ikki kamerali","Bir kamerali","Side-by-Side","French Door","Mini (stol osti)","No Frost (FROST FREE)"] },
      { key: "totalVol",   label: "Umumiy hajm",          type: "number", unit: "litr", placeholder: "masalan: 360" },
      { key: "freezerVol", label: "Muzlatgich kamerasi hajmi", type: "number", unit: "litr", placeholder: "masalan: 90" },
      { key: "color",      label: "Rangi",                type: "select", options: ["Oq","Kumush (inox)","Qora","Kulrang","Boshqa"] },
      { key: "height",     label: "Balandligi",           type: "number", unit: "sm",  placeholder: "masalan: 185" },
      { key: "width",      label: "Eni",                  type: "number", unit: "sm",  placeholder: "masalan: 60" },
      { key: "energyClass",label: "Energiya sinfi",       type: "select", options: ["A+++","A++","A+","A","B","C"] },
      { key: "nofrost",    label: "No Frost (muzlanmaydi)", type: "toggle" },
      { key: "inverter",   label: "Inverter kompressor",  type: "toggle" },
      { key: "dispenser",  label: "Suv / Muz dispenseri", type: "toggle" },
      { key: "warranty",   label: "Kafolat muddati",      type: "select", options: ["1 yil","2 yil","3 yil","5 yil"] },
    ],
  },
  {
    names: ["Kir yuvish mashinalari"],
    emoji: "🫧",
    fields: [
      { key: "brand",      label: "Brend",                type: "text",   placeholder: "masalan: Samsung, LG, Bosch" },
      { key: "washType",   label: "Yuklash turi",         type: "select", options: ["Old tomondan yuklash (frontal)","Yuqoridan yuklash (vertikal)"] },
      { key: "capacity",   label: "Yuvish sig'imi",       type: "select", options: ["3.5 kg","4 kg","5 kg","6 kg","7 kg","8 kg","9 kg","10 kg","12 kg"] },
      { key: "rpm",        label: "Centrifuga aylanish tezligi", type: "select", options: ["800 ayl/min","1000 ayl/min","1200 ayl/min","1400 ayl/min","1600 ayl/min"] },
      { key: "color",      label: "Rangi",                type: "select", options: ["Oq","Kumush","Qora","Antrasit"] },
      { key: "width",      label: "Eni",                  type: "number", unit: "sm",  placeholder: "masalan: 60" },
      { key: "depth",      label: "Chuqurligi",           type: "number", unit: "sm",  placeholder: "masalan: 45" },
      { key: "energyClass",label: "Energiya sinfi",       type: "select", options: ["A+++","A++","A+","A","B"] },
      { key: "programs",   label: "Dasturlar soni",       type: "select", options: ["8–10","12–15","16–20","21+"] },
      { key: "steam",      label: "Bug' (steam) funksiyasi", type: "toggle" },
      { key: "inverter",   label: "Inverter motor",       type: "toggle" },
      { key: "dryer",      label: "Quritish funksiyasi",  type: "toggle" },
      { key: "warranty",   label: "Kafolat muddati",      type: "select", options: ["1 yil","2 yil","3 yil","5 yil"] },
    ],
  },
  {
    names: ["Televizorlar"],
    emoji: "📺",
    fields: [
      { key: "brand",      label: "Brend",                type: "text",   placeholder: "masalan: Samsung, LG, Sony, TCL" },
      { key: "screenSize", label: "Ekran o'lchami",       type: "select", options: ["24\"","32\"","40\"","43\"","50\"","55\"","65\"","75\"","85\"","100\"+"] },
      { key: "resolution", label: "Ruxsat (rezolutsiya)", type: "select", options: ["HD (1366×768)","Full HD (1920×1080)","4K UHD (3840×2160)","8K (7680×4320)","QLED 4K","OLED 4K"] },
      { key: "panelType",  label: "Panel texnologiyasi",  type: "select", options: ["LED/LCD","QLED","OLED","AMOLED","Mini LED","NanoCell"] },
      { key: "os",         label: "Operatsion tizim",     type: "select", options: ["Smart TV (Android)","Smart TV (Tizen/Samsung)","Smart TV (webOS/LG)","Smart TV (Google TV)","Oddiy (Smart emas)"] },
      { key: "hz",         label: "Yangilanish tezligi",  type: "select", options: ["50 Hz","60 Hz","100 Hz","120 Hz","144 Hz","240 Hz"] },
      { key: "hdmi",       label: "HDMI portlari soni",   type: "select", options: ["1","2","3","4+"] },
      { key: "wifi",       label: "Wi-Fi va Bluetooth",   type: "toggle" },
      { key: "voiceCtrl",  label: "Ovoz bilan boshqarish", type: "toggle" },
      { key: "warranty",   label: "Kafolat muddati",      type: "select", options: ["1 yil","2 yil","3 yil"] },
    ],
  },
  {
    names: ["Konditsionerlar"],
    emoji: "❄️",
    fields: [
      { key: "brand",      label: "Brend",                type: "text",   placeholder: "masalan: Midea, Haier, Samsung, Daikin" },
      { key: "acType",     label: "Konditsioner turi",    type: "select", options: ["Split tizim (standart)","Inverter Split","Mobil konditsioner","Kaset turi","Kanal turi","Multi-Split"] },
      { key: "btu",        label: "Quvvat (BTU)",         type: "select", options: ["7000 BTU (20 m²)","9000 BTU (25 m²)","12000 BTU (35 m²)","18000 BTU (50 m²)","24000 BTU (70 m²)","36000 BTU (100 m²)"] },
      { key: "energyClass",label: "Energiya sinfi",       type: "select", options: ["A+++","A++","A+","A","B","C"] },
      { key: "color",      label: "Rangi",                type: "select", options: ["Oq","Kulrang","Qora","Oltin"] },
      { key: "noise",      label: "Shovqin darajasi",     type: "select", options: ["Juda past (<20 dB)","Past (20–35 dB)","O'rtacha (35–45 dB)","Yuqori (45+ dB)"] },
      { key: "inverter",   label: "Inverter texnologiya", type: "toggle" },
      { key: "heat",       label: "Isitish funksiyasi",   type: "toggle" },
      { key: "wifi",       label: "Wi-Fi boshqaruv",      type: "toggle" },
      { key: "ionizer",    label: "Ionizator (havo tozalash)", type: "toggle" },
      { key: "warranty",   label: "Kafolat muddati",      type: "select", options: ["1 yil","2 yil","3 yil","5 yil"] },
    ],
  },
  {
    names: ["Oshxona texnikasi"],
    emoji: "🍽️",
    fields: [
      { key: "brand",      label: "Brend",                type: "text",   placeholder: "masalan: Bosch, Tefal, Philips" },
      { key: "appType",    label: "Texnika turi",         type: "select", options: ["Gaz plita","Elektr plita","Induktsiyon plita","Pechka (duxovka)","Mikroto'lqinli pech","Blender","Miksyer","Qovurg'ich (fryur)","Non pishirgich","Qahva mashina","Toaster"] },
      { key: "color",      label: "Rangi",                type: "select", options: ["Oq","Kumush/Inox","Qora","Kulrang"] },
      { key: "power",      label: "Quvvati",              type: "number", unit: "W",   placeholder: "masalan: 2000" },
      { key: "capacity",   label: "Hajmi / sig'imi",      type: "text",   placeholder: "masalan: 5 litr, 4 kameyrali" },
      { key: "energyClass",label: "Energiya sinfi",       type: "select", options: ["A+++","A++","A+","A","B","C"] },
      { key: "timer",      label: "Taymer funksiyasi",    type: "toggle" },
      { key: "wifi",       label: "Smart / Wi-Fi boshqaruv", type: "toggle" },
      { key: "warranty",   label: "Kafolat muddati",      type: "select", options: ["1 yil","2 yil","3 yil"] },
    ],
  },
  {
    names: ["Changyutgich"],
    emoji: "🌀",
    fields: [
      { key: "brand",      label: "Brend",                type: "text",   placeholder: "masalan: Dyson, Midea, Bosch" },
      { key: "vacType",    label: "Tur",                  type: "select", options: ["Klassik (meshkli)","Meshksiz (tsiklon)","Robot changyutgich","Vertikal (shnur bilan)","Akkumulyatorli (kordless)","Suv filtri bilan"] },
      { key: "power",      label: "Quvvati",              type: "number", unit: "W",   placeholder: "masalan: 2200" },
      { key: "suctionPow", label: "So'rish kuchi",        type: "number", unit: "Pa",  placeholder: "masalan: 22000" },
      { key: "dustBag",    label: "Meshk / Konteyner sig'imi", type: "text", placeholder: "masalan: 2.5 litr" },
      { key: "color",      label: "Rangi",                type: "text",   placeholder: "masalan: Qizil-qora, Kulrang" },
      { key: "hepa",       label: "HEPA filtri bor",      type: "toggle" },
      { key: "wireless",   label: "Simsiz (akkumulyatorli)", type: "toggle" },
      { key: "robot",      label: "Robot changyutgich",   type: "toggle" },
      { key: "warranty",   label: "Kafolat muddati",      type: "select", options: ["1 yil","2 yil","3 yil"] },
    ],
  },
  {
    names: ["Isitgich va ventilyator"],
    emoji: "🌡️",
    fields: [
      { key: "brand",      label: "Brend",                type: "text",   placeholder: "masalan: Ballu, Polaris, Electrolux" },
      { key: "deviceType", label: "Qurilma turi",         type: "select", options: ["Konvekstor","Infra-qizil isitgich","Yog'li radiator","Qizitish yelkani (fan heater)","Ventilyator (sovituvchi)","Potolok ventilyatori","Turg'un ventilyator (stol/pol)","Konditsioner (portable)"] },
      { key: "power",      label: "Quvvati",              type: "number", unit: "W",   placeholder: "masalan: 2000" },
      { key: "area",       label: "Mo'ljallangan xona maydoni", type: "number", unit: "m²", placeholder: "masalan: 25" },
      { key: "color",      label: "Rangi",                type: "text",   placeholder: "masalan: Oq, Qora" },
      { key: "timer",      label: "Taymer funksiyasi",    type: "toggle" },
      { key: "remote",     label: "Pult bilan boshqaruv", type: "toggle" },
      { key: "thermostat", label: "Termostat (harorat regulyator)", type: "toggle" },
      { key: "warranty",   label: "Kafolat muddati",      type: "select", options: ["1 yil","2 yil","3 yil"] },
    ],
  },

  // ══════════════════ UY-RO'ZG'OR ══════════════════
  {
    names: ["Idish-tovoq"],
    emoji: "🍽️",
    fields: [
      { key: "material",   label: "Materiali",            type: "select", options: ["Chinni (farfor)","Keramika","Shisha (buyum)","Paslanmaz po'lat","Plastik (food-grade)","Mel'xior","Kumush qoplama"] },
      { key: "setType",    label: "To'plam turi",         type: "select", options: ["Ovqat to'plami","Choy to'plami","Qahva to'plami","Aralash to'plam","Donali (yagona buyum)"] },
      { key: "pieces",     label: "To'plamdagi dona soni",type: "select", options: ["1","2","4","6","12","18","24","36+"] },
      { key: "color",      label: "Rangi / Naqshi",       type: "text",   placeholder: "masalan: Oq tekis, Ko'k gul naqshli" },
      { key: "dishwasher", label: "Idish yuvgichga yaraqli", type: "toggle" },
      { key: "microwave",  label: "Mikroto'lqin pechka uchun", type: "toggle" },
    ],
  },
  {
    names: ["Pishirish idishlari"],
    emoji: "🥘",
    fields: [
      { key: "material",   label: "Materiali",            type: "select", options: ["Quyma temir (cho'yan)","Paslanmaz po'lat","Alyuminiy","Mis","Granitdan","Emalli temir","Keramik"] },
      { key: "coating",    label: "Ichki qoplama",        type: "select", options: ["Non-stick (yapishmaydigan)","Granit qoplama","Keramik qoplama","Emal","Qoplamasiz (po'lat)","PTFE (teflon)"] },
      { key: "setType",    label: "Tur",                  type: "select", options: ["Qozon","Katta qozon (kazan)","Tovа (skovoroda)","Sho'rva qozoni (kastryulya)","To'plam (set)","Parlovchi (parnoe)","Bosim ostida pishirgich (skороварка)"] },
      { key: "volume",     label: "Hajmi",                type: "select", options: ["0.5 L","1 L","1.5 L","2 L","2.5 L","3 L","4 L","5 L","6 L","8 L","10 L+"] },
      { key: "diameter",   label: "Diametri",             type: "number", unit: "sm",  placeholder: "masalan: 28" },
      { key: "induction",  label: "Induktsiyon pechkaga yaraqli", type: "toggle" },
      { key: "dishwasher", label: "Idish yuvgichga yaraqli",      type: "toggle" },
      { key: "lid",        label: "Qopqoq bilan",         type: "toggle" },
    ],
  },
  {
    names: ["Dasturxon bezaklari"],
    emoji: "🏺",
    fields: [
      { key: "itemType",   label: "Buyum turi",           type: "select", options: ["Dasturxon sufrasi","Sho'rva kosa","Salatnik","Lagan","Xontaxta (dasturxon)","Qoshiq-vilka to'plami","Plastik idish","To'plam"] },
      { key: "material",   label: "Materiali",            type: "select", options: ["Chinni","Keramika","Shisha","Paslanmaz po'lat","Plastik","Mis","Bambu","Yogʻoch"] },
      { key: "pieces",     label: "Dona soni",            type: "select", options: ["1","2","4","6","12","24+"] },
      { key: "color",      label: "Rangi / Dizayn",       type: "text",   placeholder: "masalan: Oq, Shakllar naqshli" },
      { key: "dishwasher", label: "Idish yuvgichga yaraqli", type: "toggle" },
    ],
  },
  {
    names: ["Tozalash buyumlari"],
    emoji: "🧹",
    fields: [
      { key: "itemType",   label: "Buyum turi",           type: "select", options: ["Supurgi (metla)","Mop (latta)","Челпак (shablon)","Idish yuvish gubkasi","Tozalash kimyosi","Drap to'plami","Kir yuvish vositasi","Sabun / gel"] },
      { key: "brand",      label: "Brend",                type: "text",   placeholder: "masalan: Domestos, Fairy, Mr.Muscle" },
      { key: "volume",     label: "Hajmi / Og'irligi",    type: "text",   placeholder: "masalan: 500 ml, 1 litr, 5 kg" },
      { key: "scent",      label: "Xushbo'y hid",         type: "select", options: ["Hidsiz","Limon","Lavanda","Yashil choy","Dengiz","Gulob","Archa"] },
      { key: "surface",    label: "Qo'llanilish yuzasi",  type: "select", options: ["Umumiy (universal)","Shisha va oynalar","Vannaxona","Hojatxona","Oshxona","Pol (parket/laminat)","Kiyim-kechak","Metal yuzalar"] },
      { key: "ecofriendly",label: "Ekologik tarkibli",    type: "toggle" },
    ],
  },
  {
    names: ["Saqlash va tartib"],
    emoji: "📦",
    fields: [
      { key: "itemType",   label: "Buyum turi",           type: "select", options: ["Plastik qutilar (saqlash)","Garderob organayzer","Javon uyali quti","Bambu organayzer","Asib qo'yish (kanchallar)","Polkalar (devorga)","Idish-tovoq organayzer","Hujjat papkalar"] },
      { key: "material",   label: "Materiali",            type: "select", options: ["Plastik (PP)","Metall","Bambu","Yog'och","Mato (kiyim uchun)","Shisha (hermetik)"] },
      { key: "size",       label: "O'lcham / Hajm",       type: "text",   placeholder: "masalan: 30×20×10 sm, 5 litr" },
      { key: "color",      label: "Rangi",                type: "text",   placeholder: "masalan: Shaffof, Oq, Kulrang" },
      { key: "stackable",  label: "Ustma-ust qo'yiladi",  type: "toggle" },
      { key: "airtight",   label: "Germetik (havo o'tmaydi)", type: "toggle" },
    ],
  },
  {
    names: ["Hammom aksessuarlar"],
    emoji: "🚿",
    fields: [
      { key: "itemType",   label: "Aksessuar turi",       type: "select", options: ["Sochiq tutgich","Tish cho'tka stendi","Sovun idish","Tualet qog'oz ushlagich","Oyna (hammom)","Dush parda","Kruchok (ilmoq)","To'plam (set)","Vannaxona gilam"] },
      { key: "material",   label: "Materiali",            type: "select", options: ["Paslanmaz po'lat","Xromlangan po'lat","Plastik ABS","Keramika","Bambu","Shisha","Bronza"] },
      { key: "color",      label: "Rangi / Tugmachari",   type: "select", options: ["Xrom (kumush)","Matli xrom","Bronza","Oltin","Qora mat","Oq"] },
      { key: "mounting",   label: "O'rnatish usuli",      type: "select", options: ["Devorga qadab (miq bilan)","Yelimlab o'rnatish","Olmaydiganla (free standing)","Shlifovka (silliq yuza)"] },
      { key: "rustproof",  label: "Zanglamaydigan",       type: "toggle" },
      { key: "set",        label: "To'plam (setda)",      type: "toggle" },
    ],
  },

  // ══════════════════ DEKOR VA BEZAK ══════════════════
  {
    names: ["Rasmlar va suratlar"],
    emoji: "🖼️",
    fields: [
      { key: "artType",    label: "Tur",                  type: "select", options: ["Kanvas (choyshabga bosma)","Foto print","Modul rasm (ko'p qismli)","Akrilik bo'yoq rasm","Yog' bo'yoq (qo'lbola)","Gravyura","3D ko'rinish","Mozaika"] },
      { key: "theme",      label: "Mavzu",                type: "select", options: ["Tabiat / Manzara","Shahar / Arxitektura","Abstrakt","Portret","Hayot manzarasi","Calligraphy (xattotlik)","Milliy naqsh","Osmon / Osmono'par"] },
      { key: "width",      label: "Eni",                  type: "number", unit: "sm",  placeholder: "masalan: 60" },
      { key: "height",     label: "Balandligi",           type: "number", unit: "sm",  placeholder: "masalan: 90" },
      { key: "color",      label: "Asosiy ranglar",       type: "text",   placeholder: "masalan: Ko'k-jigarrang, Qoʻngʻir" },
      { key: "frame",      label: "Ramka bilan",          type: "toggle" },
      { key: "mounted",    label: "Osish uchun ilgak bor", type: "toggle" },
    ],
  },
  {
    names: ["Vazalar va guldanlar"],
    emoji: "🏺",
    fields: [
      { key: "material",   label: "Materiali",            type: "select", options: ["Keramika","Chinni (farfor)","Shisha","Metall","Beton","Plastik","Bambu / Qamish","Gips"] },
      { key: "style",      label: "Uslubi",               type: "select", options: ["Zamonaviy (minimalizm)","Klassik","Skandinavcha","Industrial","Art Deco","Sharq (milliy)","Boho"] },
      { key: "height",     label: "Balandligi",           type: "number", unit: "sm",  placeholder: "masalan: 30" },
      { key: "diameter",   label: "Og'zi diametri",       type: "number", unit: "sm",  placeholder: "masalan: 12" },
      { key: "color",      label: "Rangi",                type: "text",   placeholder: "masalan: Oq, Terrakota, Ko'k" },
      { key: "waterproof", label: "Suv uchun yaraqli",    type: "toggle" },
    ],
  },
  {
    names: ["Devor soatlari"],
    emoji: "🕐",
    fields: [
      { key: "clockType",  label: "Soat turi",            type: "select", options: ["Analог (miltillovchi strelkali)","Raqamli (LED)","Qo'l yuritiladigan (mex.)" ,"Mayatnikli (grandfa)","Solishtirma (minimal)","3D raqamli"] },
      { key: "material",   label: "Ramka materiali",      type: "select", options: ["Plastik","Metall","Yog'och massiv","Shisha + metall","Alyuminiy","MDF"] },
      { key: "diameter",   label: "Diametri / O'lchami",  type: "number", unit: "sm",  placeholder: "masalan: 35" },
      { key: "color",      label: "Rangi",                type: "text",   placeholder: "masalan: Qora, Kumush, Yog'och" },
      { key: "power",      label: "Manba",                type: "select", options: ["Batareyka (AA×1)","Batareyka (AA×2)","Batareyka (AA×3)","220V rozetka","Qo'ydirma (mexanik)","Quyosh batareyasi"] },
      { key: "silent",     label: "Sekin (ticking yo'q)", type: "toggle" },
      { key: "backlight",  label: "Orqa yoritish (LED)",  type: "toggle" },
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

  // ══════════════════ YORUGʻLIK ══════════════════
  {
    names: ["Chiroqlar", "Devor chiroqlari", "Stol va pol chiroqlari", "Shiftlar (lyustra)", "Shiftlar"],
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
  {
    names: ["LED va smart chiroqlar"],
    emoji: "💡",
    fields: [
      { key: "ledType",    label: "LED chiroq turi",      type: "select", options: ["LED lenta (strip)","Smart lamp (E27)","LED panel (shiftga)","LED spotlight","RGB lenta","LED bulb to'plami","Aqlli lyustra"] },
      { key: "colorTemp",  label: "Rang harorati",        type: "select", options: ["Warm White (2700K)","Neutral White (4000K)","Cold White (6500K)","RGB (barcha ranglar)","RGBW (oq+rang)","Tunable White (sozlanuvchi)"] },
      { key: "power",      label: "Quvvati",              type: "number", unit: "W",   placeholder: "masalan: 12" },
      { key: "length",     label: "Uzunligi (lenta uchun)", type: "number", unit: "m", placeholder: "masalan: 5" },
      { key: "voltage",    label: "Kuchlanish",           type: "select", options: ["12V DC","24V DC","220V AC"] },
      { key: "wifi",       label: "Wi-Fi / Bluetooth boshqaruv", type: "toggle" },
      { key: "voiceCtrl",  label: "Alexa/Google Home bilan ishlaydi", type: "toggle" },
      { key: "dimmable",   label: "Dimmer (sozlanuvchi yorqinlik)", type: "toggle" },
      { key: "waterproof", label: "IP65 (suv o'tkazmaydigan)", type: "toggle" },
    ],
  },
  {
    names: ["Ko'cha va bog' chiroqlar"],
    emoji: "🏮",
    fields: [
      { key: "lightType",  label: "Chiroq turi",          type: "select", options: ["Ko'cha fonari (stulb)","Devor (fasad) chiroq","Zamin chiroqi (gruntoviy)","Yashil fana (gazon)","Solar chiroq","Girlyanda (dekorativ)","Panjara LED","Hovli fonari"] },
      { key: "material",   label: "Korpus materiali",     type: "select", options: ["Alyuminiy (press)","Paslanmaz po'lat","Plastik (UV chidamli)","Mis","Quyma temir","Shisha + metall"] },
      { key: "colorTemp",  label: "Rang harorati",        type: "select", options: ["Warm White (3000K)","Neutral White (4000K)","Cold White (6000K)","RGB"] },
      { key: "power",      label: "Quvvati",              type: "number", unit: "W",   placeholder: "masalan: 20" },
      { key: "height",     label: "Balandligi / O'lchami", type: "number", unit: "sm",  placeholder: "masalan: 120" },
      { key: "ipClass",    label: "Himoya sinfi (IP)",    type: "select", options: ["IP44 (yomg'ir chidata)","IP54","IP65 (suv o'tkazmaydigan)","IP67 (suv ostida)"] },
      { key: "solar",      label: "Quyosh batareyasi bilan", type: "toggle" },
      { key: "motion",     label: "Harakat sensori bilan", type: "toggle" },
      { key: "remote",     label: "Pult bilan",           type: "toggle" },
    ],
  },

  // ══════════════════ BOG' VA HOVLI ══════════════════
  {
    names: ["Hovli mebellar"],
    emoji: "🪴",
    fields: [
      { key: "material",   label: "Materiali",            type: "select", options: ["Plastik (polipropilen)","Alyuminiy (press)","Ratanga imitation","Haqiqiy ratan","Yog'och (tik / akasiya)","Paslanmaz po'lat","Textosilk (yoqimli to'qima)"] },
      { key: "itemType",   label: "Mebel turi",           type: "select", options: ["Stol-stul to'plami","Kreslo / lounger","Divan (terrace)","Burchak to'plami","Soyabon (parasol) bilan","Salınchak","Shkaf (hovli)"] },
      { key: "color",      label: "Rangi",                type: "text",   placeholder: "masalan: Qora, Jigarrang, Kulrang" },
      { key: "persons",    label: "Necha kishilik",       type: "select", options: ["1 kishi","2 kishi","4 kishi","6 kishi","8 kishi","10+ kishi"] },
      { key: "waterproof", label: "Yomg'irga chidamli",   type: "toggle" },
      { key: "foldable",   label: "Bukiladigan (skladnoy)", type: "toggle" },
      { key: "cushion",    label: "Yostiq bilan birga",   type: "toggle" },
    ],
  },
  {
    names: ["Bog' uskunalari"],
    emoji: "🌱",
    fields: [
      { key: "toolType",   label: "Asbob turi",           type: "select", options: ["Qo'l kurek","Bel kurek","Tirnoqli (grabler)","Qaychi (pruner)","Arra (jilg'a)","Belkurak","Bog' kiri uchun shlangi","Elektr gaz chimdiruvchi","Motor o'tchimdiruvchi"] },
      { key: "material",   label: "Tutqich materiali",    type: "select", options: ["Metall + yog'och","Yog'och","Fiberglass","Plastik","Alyuminiy"] },
      { key: "length",     label: "Uzunligi (dasta)",     type: "number", unit: "sm",  placeholder: "masalan: 130" },
      { key: "brand",      label: "Brend",                type: "text",   placeholder: "masalan: Fiskars, Husqvarna, Stihl" },
      { key: "electric",   label: "Elektr / akkumulyatorli", type: "toggle" },
    ],
  },
  {
    names: ["Barbeque va piknik"],
    emoji: "🍖",
    fields: [
      { key: "bbqType",    label: "Tur",                  type: "select", options: ["Mangal (klassik)","Grill (kettle)","Gas grill","Elektr grill","Qo'shimcha manzil (kamado)","Piknik to'plamlar","Shashlyk uchun shampurlar","Qo'ziqorin qovurg'ich"] },
      { key: "material",   label: "Materiali",            type: "select", options: ["Paslanmaz po'lat","Qora po'lat","Quyma temir","Alyuminiy","Sopol (keramik)"] },
      { key: "size",       label: "O'lcham (qovurish yuzasi)", type: "text",   placeholder: "masalan: 50×30 sm" },
      { key: "fuel",       label: "Yoqilg'i turi",        type: "select", options: ["Ko'mir","Gaz (ballon)","Elektr","Yog'och","Universal"] },
      { key: "persons",    label: "Necha kishilik",        type: "select", options: ["2–4","4–6","6–8","8–12","12+"] },
      { key: "foldable",   label: "Bukiladigan (portable)", type: "toggle" },
      { key: "cover",      label: "Qopqoq bilan",         type: "toggle" },
    ],
  },
  {
    names: ["Suv ta'minoti"],
    emoji: "💧",
    fields: [
      { key: "itemType",   label: "Buyum turi",           type: "select", options: ["Suv shlangi","Sug'orish tizimi (damlama)","Sprinkler","Nasos (suv)","Rezervuar (bochka)","Akvaduk (quvur birlashtirish)","Kapel'niy sug'orish to'plami"] },
      { key: "material",   label: "Materiali",            type: "select", options: ["PVC (elastik)","Armaturali shlangi","Polipropilen","Paslanmaz po'lat","Mis"] },
      { key: "length",     label: "Uzunligi (shlangi uchun)", type: "number", unit: "m",  placeholder: "masalan: 25" },
      { key: "pressure",   label: "Bosim (bar)",          type: "text",   placeholder: "masalan: 10 bar" },
    ],
  },
  {
    names: ["Hovli va bog' bezak"],
    emoji: "🪴",
    fields: [
      { key: "itemType",   label: "Bezak turi",           type: "select", options: ["Guldasta uchun qozon (kubik)","Dekorativ chiroqlar","Hovuz (mini)","Tosh naqsh","Qiyin yo'l taxtasi","Gulzor bordyur","Dekorativ qozon (katta)","Figuralar (hayvon va h.k.)"] },
      { key: "material",   label: "Materiali",            type: "select", options: ["Keramika","Beton","Plastik","Quyma temir","Shisha","Tosh (granit)","Yog'och"] },
      { key: "color",      label: "Rangi",                type: "text",   placeholder: "masalan: Terrakota, Kulrang, Yashil" },
      { key: "outdoor",    label: "Ko'cha sharoiti uchun (frost-proof)", type: "toggle" },
      { key: "drainage",   label: "Suv quydirish teshiği (drenaj)", type: "toggle" },
    ],
  },

  // ══════════════════ QURILISH VA TA'MIRLASH ══════════════════
  {
    names: ["Pol qoplamalar"],
    emoji: "🏠",
    fields: [
      { key: "floorType",  label: "Pol qoplama turi",     type: "select", options: ["Laminat","Parket (massiv)","Parket taxtasi (engineered)","Linoleum","Keramik plitka","Vinil (SPC/LVT)","Epoksi qoplama","Karpet","Taxta"] },
      { key: "material",   label: "Materiali / Asosi",    type: "select", options: ["HDF (laminat asosi)","Eman massiv","Bambuk","Plastik (PVC)","Keramika","Porselen (gres)","Epoksi smola","Polipropilen (karpet)"] },
      { key: "thickness",  label: "Qalinligi",            type: "number", unit: "mm",  placeholder: "masalan: 12" },
      { key: "size",       label: "Taxta o'lchami",       type: "text",   placeholder: "masalan: 1380×195 mm" },
      { key: "color",      label: "Rangi / Faktura",      type: "text",   placeholder: "masalan: Eman tabiiy, Beton kulrang" },
      { key: "acClass",    label: "Eskirishga chidamlilik (AC sinfi)", type: "select", options: ["AC1 (yotoqxona)","AC3 (yashash xona)","AC4 (ofis)","AC5 (savdo zali)","AC6 (sanoat)"] },
      { key: "waterproof", label: "Suv o'tkazmaydigan",   type: "toggle" },
      { key: "underfloor", label: "Isitgichli pol uchun yaraqli", type: "toggle" },
    ],
  },
  {
    names: ["Devor qoplamalar"],
    emoji: "🧱",
    fields: [
      { key: "wallType",   label: "Devor qoplama turi",   type: "select", options: ["Gilam (fototapeta)","Vinil tapeta","Fleece tapeta","Yog'och panel","3D panel","Gips bezaklar","Dekorativ tosh","Keramik plitka","Klinker g'isht"] },
      { key: "material",   label: "Materiali",            type: "select", options: ["Qog'oz (oddiy)","Vinil (suv o'tkazmaydigan)","Fleece (fliselinli)","MDF panel","Gips","Plastik PVC","Keramika","Tosh (sun'iy)"] },
      { key: "width",      label: "Rul eni",              type: "number", unit: "sm",  placeholder: "masalan: 53" },
      { key: "height",     label: "Rul uzunligi",         type: "number", unit: "m",   placeholder: "masalan: 10" },
      { key: "color",      label: "Rangi / Naqshi",       type: "text",   placeholder: "masalan: Kulrang zolot naqsh, Beton effekt" },
      { key: "washable",   label: "Yuviladigan sirt",     type: "toggle" },
      { key: "heatResist", label: "Issiqlikka chidamli",  type: "toggle" },
    ],
  },
  {
    names: ["Bo'yoqlar va laklar"],
    emoji: "🎨",
    fields: [
      { key: "paintType",  label: "Bo'yoq / Lak turi",    type: "select", options: ["Akril (suv asosidagi)","Lateks","Emal bo'yoq","Yog' asosidagi","Fасад bo'yoq","Kraska (gruntovka)","Shpatlyovka","Antiseptik","Parket laki","Mebel laki","Avtomobil bo'yoq"] },
      { key: "surface",    label: "Qo'llanish yuzasi",    type: "select", options: ["Devor (ichki)","Fasad (tashqi)","Yog'och","Metall","Beton","Plastik","Koshel / gips","Universal"] },
      { key: "volume",     label: "Hajmi",                type: "select", options: ["0.5 kg/L","1 kg/L","2.5 kg/L","4 kg/L","5 kg/L","10 kg/L","20 kg/L","25 kg/L"] },
      { key: "color",      label: "Rangi",                type: "text",   placeholder: "masalan: RAL 9016 Oq, #F5F5DC Bej" },
      { key: "finish",     label: "Yuzasi ko'rinishi",    type: "select", options: ["Mat (silingan)","Yarimmat","Satin","Yarimpardoz","Pardoz (gloss)","To'la pardoz (mirror)"] },
      { key: "waterproof", label: "Suv o'tkazmaydigan",   type: "toggle" },
      { key: "ecofriendly",label: "Ekologik tarkibli (VOC yo'q)", type: "toggle" },
    ],
  },
  {
    names: ["Santexnika"],
    emoji: "🚰",
    fields: [
      { key: "itemType",   label: "Santexnika turi",      type: "select", options: ["Hammom (vanna)","Dush kabinasi","Unitaz","Qozon lavabo","Oshxona lavabo","Kran (mixer)","Suv isitgich (boiler)","Nasoslar","Quvur fitingleri"] },
      { key: "material",   label: "Materiali",            type: "select", options: ["Akrilik","Quyma polimer (kompozit)","Mis (kran uchun)","Chinni (farfor)","Paslanmaz po'lat","Shisha (kabina uchun)"] },
      { key: "color",      label: "Rangi / Qoplama",      type: "select", options: ["Oq","Kulrang","Qora mat","Xrom","Oltin","Bronza"] },
      { key: "size",       label: "O'lchami",             type: "text",   placeholder: "masalan: 170×75 sm (vanna), 50×45 sm (lavabo)" },
      { key: "guarantee",  label: "Kafolat",              type: "select", options: ["1 yil","2 yil","3 yil","5 yil","10 yil"] },
    ],
  },
  {
    names: ["Elektr materiallari"],
    emoji: "⚡",
    fields: [
      { key: "itemType",   label: "Buyum turi",           type: "select", options: ["Kabel (provod)","Rozetka","Kallit (выключатель)","Quvvat kaltitgich (avtomat)","Elektr qutisi (schetchik)","Удлинитель (uzatgich)","Izlaychi (qidiruvchi)","LED tasmalar","Transformator"] },
      { key: "brand",      label: "Brend",                type: "text",   placeholder: "masalan: Legrand, Schneider, ABB" },
      { key: "voltage",    label: "Kuchlanish",           type: "select", options: ["12V","24V","36V","220V","380V"] },
      { key: "current",    label: "Tok kuchi",            type: "text",   placeholder: "masalan: 16A, 25A, 32A" },
      { key: "ipClass",    label: "Himoya sinfi (IP)",    type: "select", options: ["IP20 (ichki)","IP44 (suvga chidamli)","IP65 (suv o'tkazmaydigan)","IP67 (suv ostida)"] },
      { key: "standard",   label: "Standart sertifikati", type: "toggle" },
    ],
  },
  {
    names: ["Eshik va derazalar"],
    emoji: "🚪",
    fields: [
      { key: "itemType",   label: "Mahsulot turi",        type: "select", options: ["Ichki eshik","Kirish eshik (metal)","Plastik deraza (PVC)","Alyuminiy deraza","Balkon bloki","Eshik burchak va asboblar","Naushnik to'plami (eshik)"] },
      { key: "material",   label: "Asosiy materiali",     type: "select", options: ["MDF (plitka qoplama)","Eman massiv","Sosna massiv","PVC plastik","Alyuminiy","Po'lat (metal)","Shisha + metall"] },
      { key: "width",      label: "Eni",                  type: "number", unit: "mm",  placeholder: "masalan: 900" },
      { key: "height",     label: "Balandligi",           type: "number", unit: "mm",  placeholder: "masalan: 2000" },
      { key: "color",      label: "Rangi / Qaplamai",     type: "text",   placeholder: "masalan: Oq, Wenge, Yong'oq" },
      { key: "glass",      label: "Shisha mavjud",        type: "toggle" },
      { key: "lock",       label: "Qulf to'plami bilan",  type: "toggle" },
      { key: "soundproof", label: "Tovush o'tkazmaydigan", type: "toggle" },
      { key: "heatInsul",  label: "Issiqlik izolyatsiyasi", type: "toggle" },
    ],
  },

  // ── ELEKTRONIKA ──────────────────────────────────────────────────────────────
  {
    names: ["Smartfonlar"], emoji: "📱",
    fields: [
      { key: "brend",     label: "Brend",              type: "text",   placeholder: "Samsung, Apple, Xiaomi, Huawei" },
      { key: "model",     label: "Model",              type: "text",   placeholder: "Galaxy S24, iPhone 15..." },
      { key: "storage",   label: "Xotira",             type: "select", options: ["32 GB", "64 GB", "128 GB", "256 GB", "512 GB", "1 TB"] },
      { key: "ram",       label: "RAM",                type: "select", options: ["2 GB", "4 GB", "6 GB", "8 GB", "12 GB", "16 GB"] },
      { key: "screen",    label: "Ekran o'lchami",     type: "number", unit: "inch", placeholder: "6.1" },
      { key: "color",     label: "Rangi",              type: "text",   placeholder: "Qora, Oq, Ko'k, Qizil" },
      { key: "condition", label: "Holati",             type: "select", options: ["Yangi (muhr yopiq)", "Yangi (ochirilgan)", "Ishlatilgan (A+)", "Ishlatilgan (A)"] },
      { key: "simCount",  label: "SIM karta soni",     type: "select", options: ["1 SIM", "2 SIM", "eSIM"] },
    ],
  },
  {
    names: ["Noutbuklar"], emoji: "💻",
    fields: [
      { key: "brend",     label: "Brend",              type: "text",   placeholder: "Lenovo, HP, Dell, Apple, Asus" },
      { key: "cpu",       label: "Protsessor",         type: "text",   placeholder: "Intel Core i5-12500H, AMD Ryzen 5..." },
      { key: "ram",       label: "RAM",                type: "select", options: ["4 GB", "8 GB", "16 GB", "32 GB", "64 GB"] },
      { key: "storage",   label: "Qattiq disk",        type: "text",   placeholder: "512 GB SSD, 1 TB HDD..." },
      { key: "screen",    label: "Ekran",              type: "number", unit: "inch", placeholder: "15.6" },
      { key: "gpu",       label: "Grafik karta",       type: "text",   placeholder: "NVIDIA RTX 3050, Intel UHD..." },
      { key: "os",        label: "Operatsion tizim",   type: "select", options: ["Windows 11", "Windows 10", "macOS", "Ubuntu/Linux", "FreeDOS"] },
      { key: "color",     label: "Rangi",              type: "text",   placeholder: "Kulrang, Qora, Kumush" },
      { key: "condition", label: "Holati",             type: "select", options: ["Yangi", "Ishlatilgan (A+)", "Ishlatilgan (A)"] },
    ],
  },
  {
    names: ["Planshetlar"], emoji: "📲",
    fields: [
      { key: "brend",     label: "Brend",              type: "text",   placeholder: "Apple, Samsung, Huawei, Xiaomi" },
      { key: "model",     label: "Model",              type: "text",   placeholder: "iPad 10, Galaxy Tab S9..." },
      { key: "storage",   label: "Xotira",             type: "select", options: ["32 GB", "64 GB", "128 GB", "256 GB", "512 GB"] },
      { key: "ram",       label: "RAM",                type: "select", options: ["2 GB", "3 GB", "4 GB", "6 GB", "8 GB", "12 GB"] },
      { key: "screen",    label: "Ekran o'lchami",     type: "number", unit: "inch", placeholder: "10.9" },
      { key: "sim",       label: "SIM karta",          type: "select", options: ["Yo'q (Wi-Fi only)", "1 SIM + Wi-Fi"] },
      { key: "color",     label: "Rangi",              type: "text",   placeholder: "Kumush, Kulrang, Qora" },
      { key: "condition", label: "Holati",             type: "select", options: ["Yangi", "Ishlatilgan (A+)", "Ishlatilgan (A)"] },
    ],
  },
  {
    names: ["Televizorlar"], emoji: "📺",
    fields: [
      { key: "brend",      label: "Brend",             type: "text",   placeholder: "Samsung, LG, Sony, Hisense, Artel" },
      { key: "diagonal",   label: "Diagonal",          type: "select", options: ['32"', '43"', '50"', '55"', '65"', '75"', '85"'] },
      { key: "tech",       label: "Texnologiya",       type: "select", options: ["LED", "QLED", "OLED", "Mini LED", "AMOLED"] },
      { key: "resolution", label: "Razreshenie",       type: "select", options: ["HD (1366x768)", "Full HD (1920x1080)", "4K Ultra HD", "8K"] },
      { key: "smart",      label: "Smart TV",          type: "toggle" },
      { key: "refresh",    label: "Yangilanish tezligi", type: "select", options: ["50 Hz", "60 Hz", "100 Hz", "120 Hz"] },
    ],
  },
  {
    names: ["Audio texnika"], emoji: "🎧",
    fields: [
      { key: "brend",       label: "Brend",            type: "text",   placeholder: "JBL, Sony, Samsung, Bose, Xiaomi" },
      { key: "type",        label: "Tur",              type: "select", options: ["Simsiz quloqchin (TWS)", "Simli quloqchin", "Bluetooth kolonka", "Uy kino tizimi", "Pleyar"] },
      { key: "connection",  label: "Ulanish",          type: "select", options: ["Bluetooth 5.0+", "Bluetooth 4.2", "Simli (3.5mm)", "Simli (USB-C)", "Wi-Fi"] },
      { key: "power",       label: "Quvvati",          type: "number", unit: "W", placeholder: "20" },
      { key: "battery",     label: "Batareya muddati", type: "text",   placeholder: "masalan: 30 soat" },
      { key: "noiseCancel", label: "Shovqin bloklash (ANC)", type: "toggle" },
    ],
  },
  {
    names: ["Kamera va foto"], emoji: "📷",
    fields: [
      { key: "brend",     label: "Brend",              type: "text",   placeholder: "Canon, Nikon, Sony, GoPro, DJI" },
      { key: "type",      label: "Tur",                type: "select", options: ["DSLR kamera", "Sizsiz (mirrorless)", "Kompakt kamera", "Aksiyon kamera", "Dron kamera", "Veb-kamera"] },
      { key: "mp",        label: "Megapiksel",         type: "number", unit: "MP", placeholder: "24" },
      { key: "zoom",      label: "Optik zoom",         type: "text",   placeholder: "masalan: 10x, 20x" },
      { key: "stabiliz",  label: "Tasvirni barqarorlashtirish (OIS)", type: "toggle" },
      { key: "video",     label: "Video sifati",       type: "select", options: ["Full HD (1080p)", "4K", "4K 60fps", "8K"] },
      { key: "condition", label: "Holati",             type: "select", options: ["Yangi", "Ishlatilgan (A+)", "Ishlatilgan (A)"] },
    ],
  },
  {
    names: ["Smartwatch va tracker"], emoji: "⌚",
    fields: [
      { key: "brend",   label: "Brend",                type: "text",   placeholder: "Apple, Samsung, Xiaomi, Huawei, Amazfit" },
      { key: "type",    label: "Tur",                  type: "select", options: ["Smart soat", "Fitness tracker", "Sport soat", "Bolalar soati"] },
      { key: "compat",  label: "Moslik",               type: "select", options: ["Android", "iOS (Apple)", "Android va iOS", "Universal"] },
      { key: "screen",  label: "Ekran diagonali",      type: "number", unit: "mm", placeholder: "44" },
      { key: "water",   label: "Suv himoyasi",         type: "select", options: ["Yo'q", "IP67", "IP68", "5ATM", "10ATM"] },
      { key: "battery", label: "Batareya muddati",     type: "text",   placeholder: "masalan: 7 kun, 14 kun" },
      { key: "color",   label: "Rangi",                type: "text",   placeholder: "Qora, Kumush, Oltin" },
    ],
  },
  {
    names: ["Kompyuter va aksessuarlar"], emoji: "🖥️",
    fields: [
      { key: "type",     label: "Mahsulot turi",   type: "select", options: ["Stol kompyuteri (ПК)","Monitor","Klaviatura","Sichqoncha","Klaviatura+sichqoncha to'plam","USB-hub","Printer/skaner","Tashqi HDD/SSD","Videokarta","Protsessor","RAM","Korpus","Quvvat bloki","Boshqa aksessuarlar"] },
      { key: "color",    label: "Rangi",           type: "text",   placeholder: "masalan: qora, oq, kulrang" },
      { key: "brend",    label: "Brend",           type: "text",   placeholder: "masalan: Logitech, HP, Dell, ASUS, Acer" },
      { key: "connect",  label: "Ulanish turi",    type: "select", options: ["USB-A","USB-C","Bluetooth","Wi-Fi","Jack 3.5mm","HDMI","DisplayPort","Simsiz (2.4GHz)","Kombinatsiya"] },
      { key: "os",       label: "Mos OS",          type: "select", options: ["Windows","macOS","Linux","Hammasi bilan mos"] },
      { key: "warranty", label: "Kafolat",         type: "select", options: ["6 oy","12 oy","24 oy","36 oy","Kafolatsiz"] },
    ],
  },

  // ── KIYIMLAR ─────────────────────────────────────────────────────────────────
  {
    names: ["Erkaklar kiyimlari"], emoji: "👔",
    fields: [
      { key: "type",     label: "Kiyim turi",          type: "select", options: ["Ko'ylak", "Futbolka", "Polo", "Trening", "Shim (jins)", "Shim (klassik)", "Kurtka", "Palto", "Kostyum", "Sviter", "Hoodie", "Jaket", "Shorts"] },
      { key: "size",     label: "O'lchami",            type: "select", options: ["XS (44)", "S (46)", "M (48)", "L (50)", "XL (52)", "2XL (54)", "3XL (56)", "4XL (58)"] },
      { key: "color",    label: "Rangi",               type: "text",   placeholder: "Qora, Oq, Ko'k, Kulrang" },
      { key: "material", label: "Matosi",              type: "select", options: ["Paxta (100%)", "Poliester", "Paxta + Poliester", "Zig'ir (linen)", "Junli", "Jins (denim)", "Charm", "Ekologik charm"] },
      { key: "season",   label: "Mavsumi",             type: "select", options: ["Bahor-Kuz", "Yoz", "Qish", "Universal (barcha mavsum)"] },
      { key: "brend",    label: "Brend",               type: "text",   placeholder: "masalan: Zara, H&M, Mango, Adidas" },
    ],
  },
  {
    names: ["Ayollar kiyimlari"], emoji: "👗",
    fields: [
      { key: "type",     label: "Kiyim turi",          type: "select", options: ["Ko'ylak", "Bluzka", "Futbolka", "Yubka", "Shim", "Jins", "Platye", "Tashqi kiyim (kurtka)", "Palto", "Sviter", "Hoodie", "Shorts", "Kombinezon"] },
      { key: "size",     label: "O'lchami",            type: "select", options: ["XS (42)", "S (44)", "M (46)", "L (48)", "XL (50)", "2XL (52)", "3XL (54)"] },
      { key: "color",    label: "Rangi",               type: "text",   placeholder: "Qora, Oq, Pushti, Ko'k" },
      { key: "material", label: "Matosi",              type: "select", options: ["Paxta (100%)", "Poliester", "Viscoza", "Shifon", "Jins (denim)", "Junli", "Charm"] },
      { key: "season",   label: "Mavsumi",             type: "select", options: ["Bahor-Kuz", "Yoz", "Qish", "Universal"] },
      { key: "brend",    label: "Brend",               type: "text",   placeholder: "masalan: Zara, H&M, Mango" },
    ],
  },
  {
    names: ["Bolalar kiyimlari"], emoji: "👶",
    fields: [
      { key: "type",     label: "Kiyim turi",          type: "select", options: ["Futbolka", "Ko'ylak", "Shim", "Kurtka", "Palto", "Pijama", "Kombinezon", "Trening", "Platye", "Sviter"] },
      { key: "age",      label: "Yoshi (yil)",         type: "select", options: ["0-1 yosh", "1-2 yosh", "2-3 yosh", "3-4 yosh", "4-5 yosh", "5-6 yosh", "6-7 yosh", "7-8 yosh", "8-10 yosh", "10-12 yosh", "12-14 yosh", "14-16 yosh"] },
      { key: "size",     label: "O'lchami (sm)",       type: "text",   placeholder: "masalan: 92, 104, 116..." },
      { key: "color",    label: "Rangi",               type: "text",   placeholder: "Qizil, Ko'k, Yashil" },
      { key: "material", label: "Matosi",              type: "select", options: ["Paxta (100%)", "Fleece", "Poliester", "Jersey"] },
      { key: "gender",   label: "Jinsi",               type: "select", options: ["O'g'il bola", "Qiz bola", "Universal"] },
    ],
  },
  {
    names: ["Sport kiyimlari"], emoji: "🏋️",
    fields: [
      { key: "type",      label: "Kiyim turi",         type: "select", options: ["Sport shim", "Sport futbolka", "Sport kurtka", "Sport to'plam", "Yoga kiyimi", "Suzish kiyimi"] },
      { key: "size",      label: "O'lchami",           type: "select", options: ["XS", "S", "M", "L", "XL", "2XL", "3XL"] },
      { key: "color",     label: "Rangi",              type: "text",   placeholder: "Qora, Ko'k, Yashil, Qizil" },
      { key: "material",  label: "Matosi",             type: "select", options: ["Dryfit (Poliester)", "Paxta", "Elastan mix", "Nylon", "Lycra"] },
      { key: "sportType", label: "Sport turi",         type: "select", options: ["Fitnes / Sport zali", "Yugurish", "Futbol", "Basketbol", "Tennis", "Yoga", "Universal"] },
      { key: "gender",    label: "Jinsi",              type: "select", options: ["Erkaklar", "Ayollar", "Universal"] },
      { key: "brend",     label: "Brend",              type: "text",   placeholder: "Adidas, Nike, Puma, Under Armour" },
    ],
  },
  {
    names: ["Ichki kiyim"], emoji: "🩱",
    fields: [
      { key: "type",      label: "Tur",                type: "select", options: ["Kalson", "Ko'ylakcha", "Jillik / termoichki", "Sutyen", "Yubka ichki", "Kolgramka", "Pijama"] },
      { key: "size",      label: "O'lchami",           type: "select", options: ["XS", "S", "M", "L", "XL", "2XL", "3XL"] },
      { key: "color",     label: "Rangi",              type: "text",   placeholder: "Oq, Qora, Kulrang, Ko'k" },
      { key: "material",  label: "Matosi",             type: "select", options: ["Paxta", "Modalni", "Bambuk", "Poliester", "Termomaterial"] },
      { key: "gender",    label: "Jinsi",              type: "select", options: ["Erkaklar", "Ayollar", "Bolalar"] },
      { key: "packCount", label: "To'plam soni",       type: "select", options: ["1 dona", "2 dona", "3 dona", "5 dona"] },
    ],
  },

  // ── POYABZAL ─────────────────────────────────────────────────────────────────
  {
    names: ["Erkaklar poyabzali"], emoji: "👞",
    fields: [
      { key: "type",     label: "Tur",                 type: "select", options: ["Tufli (klassik)", "Botinki", "Krossovki", "Loafer", "Sandal", "Boot (qo'njli)", "Mokassin"] },
      { key: "size",     label: "O'lchami (EU)",       type: "select", options: ["39", "40", "41", "42", "43", "44", "45", "46", "47"] },
      { key: "color",    label: "Rangi",               type: "text",   placeholder: "Qora, Jigarrang, Oq" },
      { key: "material", label: "Materiali",           type: "select", options: ["Tabiiy charm", "Ekologik charm", "Zamsha", "Tekstil", "Mesh (to'r)", "Kombinatsiya"] },
      { key: "season",   label: "Mavsumi",             type: "select", options: ["Bahor-Kuz", "Yoz (yengil)", "Qish (issiq)", "Universal"] },
      { key: "brend",    label: "Brend",               type: "text",   placeholder: "Adidas, Nike, Clarks, Ecco" },
      { key: "sole",     label: "Tagkavar",            type: "select", options: ["Rezina", "Poliuretan (PU)", "TPR", "Charm", "EVA"] },
    ],
  },
  {
    names: ["Ayollar poyabzali"], emoji: "👠",
    fields: [
      { key: "type",       label: "Tur",               type: "select", options: ["Tufli (klassik)", "Krossovki", "Baletka", "Sandal", "Boot", "Botilyon", "Sabo", "Slippers"] },
      { key: "size",       label: "O'lchami (EU)",     type: "select", options: ["35", "36", "37", "38", "39", "40", "41", "42"] },
      { key: "color",      label: "Rangi",             type: "text",   placeholder: "Qora, Qizil, Pushti, Oq" },
      { key: "material",   label: "Materiali",         type: "select", options: ["Tabiiy charm", "Ekologik charm", "Zamsha", "Tekstil", "Kombinatsiya"] },
      { key: "heelHeight", label: "Poshnasi balandligi", type: "select", options: ["Tekis (0-2 sm)", "Kichik (2-4 sm)", "O'rta (4-7 sm)", "Baland (7+ sm)", "Platforma"] },
      { key: "season",     label: "Mavsumi",           type: "select", options: ["Bahor-Kuz", "Yoz", "Qish", "Universal"] },
      { key: "brend",      label: "Brend",             type: "text",   placeholder: "Zara, H&M, Steve Madden, Ecco" },
    ],
  },
  {
    names: ["Bolalar poyabzali"], emoji: "👟",
    fields: [
      { key: "type",     label: "Tur",                 type: "select", options: ["Krossovki", "Sandal", "Boshmoq", "Botinki", "Boot", "Slippers"] },
      { key: "size",     label: "O'lchami (EU)",       type: "select", options: ["20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36"] },
      { key: "color",    label: "Rangi",               type: "text",   placeholder: "Ko'k, Qizil, Pushti, Yashil" },
      { key: "material", label: "Materiali",           type: "select", options: ["Tekstil", "Ekologik charm", "Mesh (to'r)", "Rezina", "Kombinatsiya"] },
      { key: "age",      label: "Yoshi (yil)",         type: "select", options: ["0-1 yosh", "1-3 yosh", "3-6 yosh", "6-9 yosh", "9-12 yosh", "12+ yosh"] },
      { key: "gender",   label: "Jinsi",               type: "select", options: ["O'g'il bola", "Qiz bola", "Universal"] },
      { key: "closure",  label: "Mahkamlash",          type: "select", options: ["Ip bilan", "Velcro (lipuchka)", "Fermuarli", "Elastik"] },
    ],
  },
  {
    names: ["Sport poyabzali"], emoji: "🏃",
    fields: [
      { key: "type",     label: "Tur",                 type: "select", options: ["Yugurish uchun", "Fitnes / Sport zali", "Futbol bosmachi", "Basketbol", "Tennis", "Yurish"] },
      { key: "size",     label: "O'lchami (EU)",       type: "select", options: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"] },
      { key: "color",    label: "Rangi",               type: "text",   placeholder: "Qora, Oq, Ko'k, Qizil" },
      { key: "material", label: "Materiali",           type: "select", options: ["Mesh (to'r)", "Tekstil", "Ekologik charm", "Kombinatsiya"] },
      { key: "sole",     label: "Tagkavar",            type: "select", options: ["Rezina (outdoor)", "Gum (indoor)", "Studs (futbol)", "Boshqa"] },
      { key: "gender",   label: "Jinsi",               type: "select", options: ["Erkaklar", "Ayollar", "Universal"] },
      { key: "brend",    label: "Brend",               type: "text",   placeholder: "Nike, Adidas, Puma, Asics, New Balance" },
    ],
  },

  // ── GO'ZALLIK VA PARVARISH ────────────────────────────────────────────────────
  {
    names: ["Parfyumeriya"], emoji: "🌸",
    fields: [
      { key: "brend",       label: "Brend",            type: "text",   placeholder: "Hugo Boss, Chanel, Dior, Lacoste" },
      { key: "type",        label: "Tur",              type: "select", options: ["Parfyum (EDP)", "Tualetlik suv (EDT)", "Cologne (EDC)", "Dezodorant", "Body mist", "Roll-on parfyum"] },
      { key: "volume",      label: "Hajmi",            type: "select", options: ["30 ml", "50 ml", "75 ml", "100 ml", "125 ml", "150 ml", "200 ml"] },
      { key: "gender",      label: "Jins",             type: "select", options: ["Erkaklar uchun", "Ayollar uchun", "Uniseks"] },
      { key: "scentFamily", label: "Hid oilasi",       type: "select", options: ["Gulsiz (floral)", "Yog'ochli (woody)", "O'tkir (oriental)", "Yangi (fresh/aqua)", "Mevali (fruity)", "Spicy"] },
      { key: "season",      label: "Mavsum",           type: "select", options: ["Bahor-Yoz", "Kuz-Qish", "Universal"] },
    ],
  },
  {
    names: ["Makiyaj"], emoji: "💄",
    fields: [
      { key: "brend",    label: "Brend",               type: "text",   placeholder: "L'Oreal, Maybelline, MAC, NYX" },
      { key: "type",     label: "Tur",                 type: "select", options: ["Lablar (pomada)", "Ko'z (tush/soya)", "Yuzga asos (foundation)", "Pudra", "Blush", "Highlighter", "Qosh bo'yog'i", "Mascara", "Bronzer", "Primer", "Kontur"] },
      { key: "shade",    label: "Rang / Ton",          type: "text",   placeholder: "masalan: Nude, Red, Coral, 01" },
      { key: "spf",      label: "SPF himoya",          type: "select", options: ["Yo'q", "SPF 15", "SPF 20", "SPF 30", "SPF 50+"] },
      { key: "coverage", label: "Qoplamliligi",        type: "select", options: ["Yengil (sheer)", "O'rtacha (medium)", "To'liq (full coverage)"] },
      { key: "skinType", label: "Teri turi",           type: "select", options: ["Barcha terlar", "Yog'li teri", "Quruq teri", "Kombinatsiya"] },
    ],
  },
  {
    names: ["Soch mahsulotlari"], emoji: "💇",
    fields: [
      { key: "brend",    label: "Brend",               type: "text",   placeholder: "Pantene, Garnier, Schwarzkopf, Loreal" },
      { key: "type",     label: "Tur",                 type: "select", options: ["Shampun", "Konditsioner", "Soch maskasi", "Soch yog'i", "Styling gel", "Lak", "Musse", "Soch bo'yog'i", "Termal himoya"] },
      { key: "volume",   label: "Hajmi",               type: "select", options: ["100 ml", "150 ml", "200 ml", "250 ml", "300 ml", "400 ml", "500 ml", "1 litr"] },
      { key: "hairType", label: "Soch turi",           type: "select", options: ["Barcha sochlar", "Quruq soch", "Yog'li soch", "Rangdor soch", "Shikastlangan soch", "Burmali soch"] },
    ],
  },
  {
    names: ["Teri parvarishi"], emoji: "🧴",
    fields: [
      { key: "brend",    label: "Brend",               type: "text",   placeholder: "CeraVe, Nivea, Garnier, The Ordinary" },
      { key: "type",     label: "Tur",                 type: "select", options: ["Yuz kremi", "Tana losyoni", "Teri tozalash", "Tonik", "Serum", "Ko'z atrofi kremi", "Quyosh himoya (SPF)", "Yuz niqobi", "Qo'l kremi", "Lip balm"] },
      { key: "volume",   label: "Hajmi",               type: "select", options: ["30 ml", "50 ml", "75 ml", "100 ml", "150 ml", "200 ml", "250 ml"] },
      { key: "skinType", label: "Teri turi",           type: "select", options: ["Barcha terlar", "Quruq teri", "Yog'li teri", "Kombinatsiya", "Sezgir teri"] },
      { key: "concern",  label: "Maqsad",              type: "select", options: ["Namlilik", "Anti-aging", "Yorqinlashtirish", "Tinchlantirish", "Akne va toshma"] },
      { key: "spf",      label: "SPF",                 type: "select", options: ["Yo'q", "SPF 15", "SPF 30", "SPF 50+"] },
    ],
  },
  {
    names: ["Erkaklar parvarishi"], emoji: "🪒",
    fields: [
      { key: "brend",    label: "Brend",               type: "text",   placeholder: "Gillette, Nivea Men, Braun, Philips" },
      { key: "type",     label: "Tur",                 type: "select", options: ["Soqol olish kremi/geli", "Soqol yog'i", "Dush geli", "Dezodorant", "Soch mahsuloti", "Qirgich (manual)", "Elektr qirgich"] },
      { key: "volume",   label: "Hajmi",               type: "text",   placeholder: "100 ml, 200 ml, 1 dona" },
      { key: "skinType", label: "Teri turi",           type: "select", options: ["Normal", "Quruq", "Yog'li", "Sezgir"] },
    ],
  },

  // ── AVTOTOVARLAR ─────────────────────────────────────────────────────────────
  {
    names: ["Avto aksessuarlar"], emoji: "🔧",
    fields: [
      { key: "type",     label: "Aksessuar turi",      type: "select", options: ["Avto gilamchalar", "Avto qoplamalar (chehol)", "Boshqaruv qoplami", "Sun vizor", "Avto parfyum", "Avto kamera", "Parking sensor", "GPS navigatsiya", "Signalizatsiya", "Boshqa"] },
      { key: "compat",   label: "Moslik (mashina turi)", type: "text", placeholder: "masalan: Chevrolet Cobalt, Nexia, Universal" },
      { key: "material", label: "Materiali",           type: "select", options: ["Tabiiy charm", "Ekologik charm", "Plastik", "Rezina", "Tekstil", "Alyuminiy"] },
      { key: "color",    label: "Rangi",               type: "text",   placeholder: "Qora, Kulrang, Jigarrang" },
    ],
  },
  {
    names: ["Moy va suyuqliklar"], emoji: "🛢️",
    fields: [
      { key: "brend",     label: "Brend",              type: "text",   placeholder: "Castrol, Mobil, Shell, Lukoil, ZIC" },
      { key: "type",      label: "Tur",                type: "select", options: ["Dvigatel moyi", "Transmissiya moyi", "Anti-friz (tosol)", "Tormoz suyuqligi", "Gidravlik suyuqlik", "Veter oynasi suyuqligi"] },
      { key: "volume",    label: "Hajmi",              type: "select", options: ["500 ml", "1 litr", "2 litr", "3 litr", "4 litr", "5 litr", "10 litr", "20 litr"] },
      { key: "viscosity", label: "Viskozitet (SAE)",   type: "select", options: ["0W-20", "5W-30", "5W-40", "10W-30", "10W-40", "15W-40", "20W-50", "75W-90"] },
      { key: "oilType",   label: "Moy turi",           type: "select", options: ["Sintetik (to'liq)", "Yarim sintetik", "Mineral"] },
    ],
  },
  {
    names: ["Shinalar va disklar"], emoji: "🔩",
    fields: [
      { key: "brend",     label: "Brend",              type: "text",   placeholder: "Michelin, Bridgestone, Pirelli, Continental" },
      { key: "type",      label: "Tur",                type: "select", options: ["Shina (tyre)", "Disk (rim)", "Disk + Shina to'plam"] },
      { key: "size",      label: "O'lchami",           type: "select", options: ["R13", "R14", "R15", "R16", "R17", "R18", "R19", "R20", "R21"] },
      { key: "profile",   label: "Profil / Kenglik",   type: "text",   placeholder: "masalan: 205/55, 195/65, 175/70" },
      { key: "season",    label: "Mavsumi",            type: "select", options: ["Yozgi", "Qishki", "Barcha mavsum (all season)"] },
      { key: "year",      label: "Ishlab chiqqan yil", type: "text",   placeholder: "masalan: 2023, 2024" },
      { key: "condition", label: "Holati",             type: "select", options: ["Yangi", "Ishlatilgan (yaxshi)", "Ishlatilgan (o'rtacha)"] },
    ],
  },
  {
    names: ["Avto elektronika"], emoji: "📟",
    fields: [
      { key: "brend",   label: "Brend",                type: "text",   placeholder: "Viper, Pandora, Pioneer, Sony, Xiaomi" },
      { key: "type",    label: "Tur",                  type: "select", options: ["Videoregistrator (DVR)", "Signalizatsiya", "Magnitola / Avto stereo", "Orqa kamera", "PDC sensor", "USB zaryadlagich", "Avto TV", "GPS tracker"] },
      { key: "compat",  label: "Moslik",               type: "text",   placeholder: "masalan: Chevrolet Cobalt, Universal" },
      { key: "voltage", label: "Kuchlanish",           type: "select", options: ["12V", "24V", "12/24V"] },
    ],
  },
  {
    names: ["Tozalash va kimyo"], emoji: "🧹",
    fields: [
      { key: "brend",  label: "Brend",                 type: "text",   placeholder: "Turtle Wax, Meguiar's, Grass, Liqui Moly" },
      { key: "type",   label: "Tur",                   type: "select", options: ["Kuzov poliroli", "Shina parvarishi", "Salon tozalagich", "Oyna tozalagich", "Avto shampun", "Konditsioner tozalagich", "Motorni tozalagich"] },
      { key: "volume", label: "Hajmi",                 type: "select", options: ["250 ml", "500 ml", "750 ml", "1 litr", "2 litr", "5 litr"] },
      { key: "form",   label: "Ko'rinishi",            type: "select", options: ["Suyuqlik", "Aerozol (spray)", "Gel", "Pasta", "Salfetkalar"] },
    ],
  },

  // ── BOLALAR TOVARLARI ─────────────────────────────────────────────────────────
  {
    names: ["O'yinchoqlar"], emoji: "🧸",
    fields: [
      { key: "brend",    label: "Brend",               type: "text",   placeholder: "Lego, Barbie, Hot Wheels, Fisher-Price" },
      { key: "type",     label: "O'yinchoq turi",      type: "select", options: ["Konstruktor", "Yumshoq o'yinchoq", "Mashina va transport", "Qo'g'irchoq", "Boshqaruv (radio-controlled)", "Mozaika / Puzzl", "Musiqali o'yinchoq", "Interaktiv o'yinchoq", "Askar va figurkalar"] },
      { key: "age",      label: "Yosh (yillar)",       type: "select", options: ["0-1 yosh", "1-3 yosh", "3-5 yosh", "5-7 yosh", "7-9 yosh", "9-12 yosh", "12+ yosh"] },
      { key: "material", label: "Materiali",           type: "select", options: ["Plastik", "Yog'och", "To'qima (mato)", "Rezina", "Metall", "Elektron"] },
      { key: "color",    label: "Rangi",               type: "text",   placeholder: "Qizil, Ko'k, Yashil, Ko'p rang" },
      { key: "gender",   label: "Jinsi",               type: "select", options: ["O'g'il bolalar uchun", "Qiz bolalar uchun", "Universal"] },
      { key: "safety",   label: "Xavfsizlik sertifikati", type: "toggle" },
    ],
  },
  {
    names: ["Bolalar aravachalari"], emoji: "🍼",
    fields: [
      { key: "brend",     label: "Brend",              type: "text",   placeholder: "Chicco, Maxi-Cosi, Kinderkraft, Britax" },
      { key: "type",      label: "Tur",                type: "select", options: ["Klassik aravachamcha", "Progulochnya (sport)", "3-in-1 to'plam", "2-in-1", "Kolyaska + avtokreslo"] },
      { key: "maxAge",    label: "Yoshgacha",          type: "select", options: ["Yangi tug'ilganlardan", "3 yoshgacha", "4 yoshgacha"] },
      { key: "weight",    label: "Maksimal yuklanma",  type: "number", unit: "kg", placeholder: "15" },
      { key: "foldable",  label: "Yig'iladigan",       type: "toggle" },
      { key: "color",     label: "Rangi",              type: "text",   placeholder: "Qora, Kulrang, Qizil, Ko'k" },
      { key: "wheelType", label: "G'ildirak turi",     type: "select", options: ["Plastik", "Rezina (nafosatli)", "EVA ko'pik", "Combo"] },
    ],
  },
  {
    names: ["Bolalar mebeli"], emoji: "🛏️",
    fields: [
      { key: "type",     label: "Tur",                 type: "select", options: ["Bolalar karavoti", "Manezh", "Bolalar stuli", "Partalik stol", "Saqlash shkafi", "Beshik"] },
      { key: "brend",    label: "Brend",               type: "text",   placeholder: "IKEA, Happy Baby, Micuna" },
      { key: "ageGroup", label: "Yosh guruh",          type: "select", options: ["0-1 yosh (go'daklar)", "1-3 yosh", "3-6 yosh", "6-10 yosh", "10+ yosh"] },
      { key: "material", label: "Materiali",           type: "select", options: ["Massiv yog'och", "LDSP", "MDF", "Metall", "Plastik", "Kombinatsiya"] },
      { key: "color",    label: "Rangi",               type: "text",   placeholder: "Oq, Yashil, Pushti, Natural yog'och" },
      { key: "size",     label: "O'lchami",            type: "text",   placeholder: "masalan: 120x60, 140x70 sm" },
      { key: "safe",     label: "Ekologik xavfsiz",    type: "toggle" },
    ],
  },
  {
    names: ["Ta'lim va rivojlanish"], emoji: "📚",
    fields: [
      { key: "brend",    label: "Brend",               type: "text",   placeholder: "Lego Education, Leapfrog, Vtech" },
      { key: "type",     label: "Tur",                 type: "select", options: ["Konstruktor (STEM)", "Rasm chizish to'plami", "Musiqiy asbob (bolalar)", "Logical o'yin / Boshqotin", "Bolalar kitobi", "Interaktiv plakat/ABC", "Matematik o'yinlar", "Ilmiy tajriba to'plami"] },
      { key: "ageGroup", label: "Yosh (yil)",          type: "select", options: ["0-1 yosh", "1-3 yosh", "3-5 yosh", "5-7 yosh", "7-10 yosh", "10-12 yosh", "12+ yosh"] },
      { key: "lang",     label: "Tili",                type: "select", options: ["O'zbek", "Rus", "Ingliz", "O'zbek + Rus", "O'zbek + Ingliz", "Ko'p til"] },
      { key: "subject",  label: "Yo'nalish",           type: "select", options: ["Matematika", "Til va savodxonlik", "Tabiat / Biologiya", "Texnologiya", "Ijodiy san'at", "Universal"] },
    ],
  },
  {
    names: ["Bolalar oziq-ovqati"], emoji: "🍼",
    fields: [
      { key: "brend",   label: "Brend",                type: "text",   placeholder: "Gerber, Nutrilon, Heinz, Nestle, Humana" },
      { key: "type",    label: "Tur",                  type: "select", options: ["Bolalar formulasi / sut", "Pyure (meva, sabzavot)", "Kasha", "Bolalar pechenye", "Ichimlik / shira", "Snack"] },
      { key: "minAge",  label: "Minimal yosh",         type: "select", options: ["0+ oy", "4+ oy", "6+ oy", "8+ oy", "10+ oy", "12+ oy (1 yosh)", "18+ oy", "2+ yosh", "3+ yosh"] },
      { key: "weight",  label: "Og'irligi / Hajmi",    type: "text",   placeholder: "masalan: 400 g, 500 ml, 250 g" },
      { key: "allergen", label: "Asosiy allergeni",    type: "select", options: ["Yo'q (allergen free)", "Sut mahsuloti", "Gluten", "Meva", "Yer yong'oq"] },
      { key: "organic", label: "Organik / BIO",        type: "toggle" },
    ],
  },
  // ── Aksessuarlar ──────────────────────────────────────────────
  {
    names: ["Sumkalar"], emoji: "👜",
    fields: [
      { key: "brend",    label: "Brend",          type: "text",   placeholder: "Gucci, Zara, H&M, Adidas, mahalliy brend" },
      { key: "type",     label: "Tur",            type: "select", options: ["Elka sumkasi (handbag)", "Yelka sumkasi (shoulder bag)", "Ryukzak", "Portfel", "Bel sumkasi (belt bag)", "Krossbodi sumka", "Kechki sumka (clutch)", "Sport sumkasi", "Sayohat sumkasi"] },
      { key: "material", label: "Material",       type: "select", options: ["Charm", "Sun'iy charm (PU)", "Nylon", "Kanvas", "Poliester", "Zamsha", "Kombinatsiya"] },
      { key: "color",    label: "Rang",           type: "text",   placeholder: "masalan: qora, jigarrang, bej" },
      { key: "size",     label: "O'lcham (sm)",   type: "text",   placeholder: "masalan: 30x20x10 sm" },
      { key: "gender",   label: "Jins",           type: "select", options: ["Ayollar", "Erkaklar", "Unisex", "Bolalar"] },
      { key: "closure",  label: "Yopilish turi",  type: "select", options: ["Fermuar", "Tugma", "Magnit tokcha", "Tovoqcha (buckle)", "Ochiq"] },
    ],
  },
  {
    names: ["Hamyonlar"], emoji: "👛",
    fields: [
      { key: "brend",     label: "Brend",             type: "text",   placeholder: "Louis Vuitton, Zara, H&M, mahalliy brend" },
      { key: "type",      label: "Tur",               type: "select", options: ["Bifold hamyon", "Trifold hamyon", "Kartochkalar egasi (card holder)", "Ko'p bo'limli hamyon", "Telefon-hamyon (phone wallet)", "Bel hamyon"] },
      { key: "material",  label: "Material",          type: "select", options: ["Charm", "Sun'iy charm (PU)", "Nylon", "Kanvas", "Metall", "Zamsha"] },
      { key: "color",     label: "Rang",              type: "text",   placeholder: "masalan: qora, jigarrang, qo'ng'ir" },
      { key: "gender",    label: "Jins",              type: "select", options: ["Erkaklar", "Ayollar", "Unisex"] },
      { key: "cardSlots", label: "Karta uyalari",     type: "select", options: ["1-4 ta", "5-8 ta", "9-12 ta", "12+ ta"] },
    ],
  },
  {
    names: ["Zargarlik va bijuteriya"], emoji: "💍",
    fields: [
      { key: "brend",    label: "Brend",           type: "text",   placeholder: "masalan: Pandora, Sokolov, mahalliy zargar" },
      { key: "type",     label: "Tur",             type: "select", options: ["Uzuk", "Bilakuzuk (braslet)", "Marjon / gavhar / zanjir", "Zirg'oq / sirg'a", "Broş", "Ko'krak zanjiri (necklace)", "To'plam (komplekt)", "Engil zargarlik (bijuteriya)"] },
      { key: "material", label: "Material",        type: "select", options: ["Oltin 585 (14K)", "Oltin 750 (18K)", "Kumush 925", "Platina", "Zanglamaydigan po'lat (316L)", "Mis asosli bijuteriya", "Kristal / shisha", "Kombinatsiya"] },
      { key: "stone",    label: "Tosh",            type: "select", options: ["Yo'q (tashtoshsiz)", "Olmos", "Brilyant", "Zumrad (emerald)", "Yoqut (ruby)", "Ko'k tosh (sapfir)", "Yarim qimmatbaho tosh", "Sintetik / CZ tosh", "Kristal"] },
      { key: "color",    label: "Rang / Ton",      type: "text",   placeholder: "masalan: sariq oltin, oq oltin, kumush" },
      { key: "size",     label: "O'lcham",         type: "text",   placeholder: "masalan: 17 mm (uzuk), 18 sm (bilakuzuk)" },
      { key: "gender",   label: "Jins",            type: "select", options: ["Ayollar", "Erkaklar", "Unisex", "Bolalar"] },
    ],
  },
  {
    names: ["Soatlar"], emoji: "⌚",
    fields: [
      { key: "brend",         label: "Brend",                  type: "text",   placeholder: "Casio, Orient, Tissot, Samsung, Apple, Citizen" },
      { key: "type",          label: "Tur",                    type: "select", options: ["Qo'l soati (analog)", "Qo'l soati (raqamli)", "Smart soat", "Sport soat", "Klassik soat", "Bolalar soati", "Cho'ntak soati"] },
      { key: "mechanism",     label: "Mexanizm",               type: "select", options: ["Kvarts (batareya)", "Mexanik (qo'lda o'rash)", "Avtomatik (o'z-o'zidan o'rash)", "Solar (quyosh energiyasi)", "Smart / Hybrid"] },
      { key: "caseMaterial",  label: "Qo'ng'iroq materiali",   type: "select", options: ["Zanglamaydigan po'lat", "Titan", "Plastik / polikarbonat", "Keramika", "Oltin qoplama", "Alyuminiy", "Kombinatsiya"] },
      { key: "strapMaterial", label: "Qayish materiali",       type: "select", options: ["Charm", "Metall zanjir (bracelet)", "Silikon", "Nylon / kanvas", "Rezin", "Keramika", "Kombinatsiya"] },
      { key: "waterResist",   label: "Suv o'tkazmasligi",      type: "select", options: ["Yo'q", "3 ATM (yomg'ir / sochilish)", "5 ATM (oddiy suzish)", "10 ATM (sho'ng'ish)", "20+ ATM (professional sho'ng'ish)"] },
      { key: "color",         label: "Rang",                   type: "text",   placeholder: "masalan: qora, kumush, oltin" },
      { key: "gender",        label: "Jins",                   type: "select", options: ["Erkaklar", "Ayollar", "Unisex", "Bolalar"] },
      { key: "warranty",      label: "Kafolat",                type: "select", options: ["6 oy", "12 oy", "18 oy", "24 oy", "Kafolatsiz"] },
    ],
  },
  {
    names: ["Ko'zoynak"], emoji: "🕶️",
    fields: [
      { key: "brend",         label: "Brend",             type: "text",   placeholder: "Ray-Ban, Oakley, Gucci, Dolce, mahalliy" },
      { key: "type",          label: "Tur",               type: "select", options: ["Quyosh ko'zoynagi", "Optik ko'zoynak (minus/plus)", "Kompyuter ko'zoynagi (antiblik)", "Sport ko'zoynagi", "Bolalar ko'zoynagi", "O'qish uchun ko'zoynak"] },
      { key: "frameType",     label: "Ramka turi",        type: "select", options: ["To'liq ramka (full-rim)", "Yarim ramka (semi-rim)", "Ramsiz (rimless)", "Nozik ramka (thin-rim)"] },
      { key: "frameMaterial", label: "Ramka materiali",   type: "select", options: ["Plastik / Atsetat", "Metall", "Titan", "TR90 (elastik plastik)", "Kombinatsiya"] },
      { key: "lensMaterial",  label: "Linza materiali",   type: "select", options: ["Polimer / CR-39", "Polikarbonat", "Shisha", "Trivex", "Progressiv (ko'p fokusli)"] },
      { key: "color",         label: "Ramka rangi",       type: "text",   placeholder: "masalan: qora, shaffof, qo'ng'ir" },
      { key: "gender",        label: "Jins",              type: "select", options: ["Erkaklar", "Ayollar", "Unisex", "Bolalar"] },
      { key: "uvProtection",  label: "UV himoya",         type: "toggle" },
    ],
  },
  {
    names: ["Kamarlar"], emoji: "🪢",
    fields: [
      { key: "brend",      label: "Brend",         type: "text",   placeholder: "masalan: Gucci, H&M, Zara, mahalliy" },
      { key: "type",       label: "Tur",           type: "select", options: ["Klassik charm kamar", "Jins kamar", "Keng kamar (fashion belt)", "Sport kamar", "Taktik / harbiy kamar"] },
      { key: "material",   label: "Material",      type: "select", options: ["Charm", "Sun'iy charm (PU)", "Kanvas", "Nylon", "Rezin / elastik", "Kombinatsiya"] },
      { key: "width",      label: "Kenglik",       type: "select", options: ["2 sm", "3 sm", "3.5 sm", "4 sm", "5 sm", "6+ sm"] },
      { key: "buckle",     label: "Tokcha turi",   type: "select", options: ["Pin tokcha (klassik)", "Plastinka tokcha (plate)", "Avtomatik tokcha", "Taktik tokcha", "Teshiksiz (ratchet)"] },
      { key: "color",      label: "Rang",          type: "text",   placeholder: "masalan: qora, jigarrang, bej" },
      { key: "gender",     label: "Jins",          type: "select", options: ["Erkaklar", "Ayollar", "Unisex"] },
      { key: "adjustable", label: "Regulyatsiya",  type: "toggle" },
    ],
  },
  {
    names: ["Shlyapalar va qalpoqlar"], emoji: "🧢",
    fields: [
      { key: "brend",      label: "Brend",         type: "text",   placeholder: "New Era, Nike, Adidas, mahalliy" },
      { key: "type",       label: "Tur",           type: "select", options: ["Baseball kepka", "Snapback", "Dad hat (low-profile)", "Qishki shapka (beanie)", "Panama shlyapa", "Fedora shlyapa", "Yozgi saman shlyapa", "Beret", "Bolalar kepkasi"] },
      { key: "material",   label: "Material",      type: "select", options: ["Paxta", "Akril", "Yun / kashmir", "Polyester", "Charm", "Kanvas / denim", "Nylon"] },
      { key: "size",       label: "O'lcham",       type: "text",   placeholder: "masalan: S/M, L/XL yoki 56-58 sm" },
      { key: "season",     label: "Mavsum",        type: "select", options: ["Yozgi", "Qishki", "Bahori-kuzgi", "Barcha fasllar"] },
      { key: "color",      label: "Rang",          type: "text",   placeholder: "masalan: qora, oq, ko'k" },
      { key: "gender",     label: "Jins",          type: "select", options: ["Erkaklar", "Ayollar", "Unisex", "Bolalar"] },
      { key: "adjustable", label: "Regulyatsiya",  type: "toggle" },
    ],
  },
  {
    names: ["Telefon aksessuarlari"], emoji: "📱",
    fields: [
      { key: "type",          label: "Tur",              type: "select", options: ["Telefon chexoli / qopqoq", "Ekran himoyachisi (shisha / plyonka)", "Zaryadlovchi / kabel", "Simsiz zaryadlovchi (wireless)", "Quloqchin / naushnik", "Bluetooth kalonka", "Telefon tutgich (holder / stand)", "Quvvat banki (power bank)", "Kamera linzasi (lens kit)", "Halqa / grip / popsocket"] },
      { key: "compatibility", label: "Mos model",        type: "text",   placeholder: "masalan: iPhone 15 Pro, Samsung Galaxy S24" },
      { key: "material",      label: "Material",         type: "select", options: ["Silikon", "Plastik / polikarbonat", "Charm / charm o'xshash", "Metall / alyuminiy", "Shisha (tempered glass)", "Kombinatsiya"] },
      { key: "color",         label: "Rang",             type: "text",   placeholder: "masalan: qora, shaffof, ko'k" },
      { key: "brend",         label: "Brend",            type: "text",   placeholder: "Apple, Samsung, Baseus, Ugreen, mahalliy" },
      { key: "warranty",      label: "Kafolat",          type: "select", options: ["6 oy", "12 oy", "Kafolatsiz"] },
    ],
  },
];

// ── Find spec for a given category name ────────────────────────
export function getSpecForCategory(catName: string | null): CategorySpec | null {
  if (!catName) return null;
  return CATEGORY_SPECS.find((s) =>
    s.names.some((n) => n.toLowerCase() === catName.toLowerCase())
  ) ?? null;
}

// ── Auto-detect category from product name ─────────────────────
export const KW_MAP: [string[], string[]][] = [
  [["shkaf","wardrobe","garderob","kupe"],                        ["Shkaflar"]],
  [["komod","dresser","chest","kommodik"],                        ["Komodlar"]],
  [["oshxona mebel","mutfak","kitchen garnitur"],                 ["Oshxonalar"]],
  [["divan","sofa","диван","uglovoy divan"],                      ["Divonlar"]],
  [["kreslo","armchair","fotel","кресло"],                        ["Kreslo"]],
  [["ovqat stoli","yozuv stoli","kofe stoli","jurnal stoli"],     ["Stollar"]],
  [["stul","chair","taburet","bar stul"],                         ["Stullar"]],
  [["javon","shelf","polka","kitob","bookcase","stellaj"],         ["Javonlar"]],
  [["karavot","kravat","bed","кровать"],                          ["Karavotlar"]],
  [["matras","mattress"],                                         ["Matraslar"]],
  [["bola","kids","детская","bolalar xona"],                      ["Bola xonasi"]],
  [["ofis mebel","office furniture"],                             ["Ofis mebeli"]],
  [["vannaxona mebel","hammom shkaf"],                            ["Vannaxona mebellar"]],
  [["gilam","carpet","kovyor","kilim"],                           ["Gilamlar"]],
  [["lyustra","chiroq","lampa","lamp","bra","torshyer"],          ["Chiroqlar"]],
  [["led ","smart chiroq","rgb lenta"],                           ["LED va smart chiroqlar"]],
  [["ko'cha chiroq","bog' chiroq","solar lamp"],                  ["Ko'cha va bog' chiroqlar"]],
  [["yotoq garnitur","bedroom set"],                              ["Yotoqona"]],
  [["muzlatgich","refrigerator","холодильник"],                   ["Muzlatgichlar"]],
  [["kir yuvish","washing machine","стиральная"],                 ["Kir yuvish mashinalari"]],
  [["televizor","tv ","телевизор","smart tv"],                    ["Televizorlar"]],
  [["konditsioner","air condition","кондиционер"],                ["Konditsionerlar"]],
  [["changyutgich","vacuum","пылесос"],                           ["Changyutgich"]],
  [["isitgich","ventilyator","heater","fan "],                    ["Isitgich va ventilyator"]],
  [["idish-tovoq","service","посуда"],                            ["Idish-tovoq"]],
  [["qozon","toва","skovoroda","kastrulya"],                      ["Pishirish idishlari"]],
  [["choyshab","ko'rpa","bedding","yostiq"],                      ["Ko'rpalar va yostiqlar"]],
  [["parda","curtain","штора"],                                   ["Uy pardalar"]],
  [["rasm","surat","painting","kartina"],                         ["Rasmlar va suratlar"]],
  [["gildon","guldон","vaza","flowerpot"],                        ["Vazalar va guldanlar"]],
  [["soat","clock","часы devor"],                                 ["Devor soatlari"]],
  [["laminat","parket","linoleum","plitka pol"],                  ["Pol qoplamalar"]],
  [["bo'yoq","kraska","lak","грунт"],                             ["Bo'yoqlar va laklar"]],
  [["tapeta","devor qoplama","обои"],                             ["Devor qoplamalar"]],
  [["santexnika","unitaz","lavabo","kran"],                       ["Santexnika"]],
  [["eshik","deraza","door","window"],                            ["Eshik va derazalar"]],
  // ── Elektronika
  [["smartfon","telefon","iphone","samsung galaxy","xiaomi","redmi","realme"],  ["Smartfonlar"]],
  [["noutbuk","laptop","macbook","notebook"],                     ["Noutbuklar"]],
  [["planshet","tablet","ipad"],                                  ["Planshetlar"]],
  [["quloqchin","naushnik","kolonka","speaker","earbuds","airpods"],["Audio texnika"]],
  [["kamera","foto","dslr","mirrorless","gopro"],                 ["Kamera va foto"]],
  [["kompyuter aksessuar","monit","klaviatur","sichqoncha","USB hub","printer","skaner"], ["Kompyuter va aksessuarlar"]],
  // ── Kiyimlar
  [["erkak ko'ylak","erkak futbolka","erkak shim","erkak kurtka","erkak kostyum"], ["Erkaklar kiyimlari"]],
  [["ayol ko'ylak","ayol platye","ayol yubka","ayol bluzka","xotin-qiz"],        ["Ayollar kiyimlari"]],
  [["sport kiyim","trening","sport forma","sportiv"],             ["Sport kiyimlari"]],
  [["ichki kiyim","tashvish","bra","korset","pijama"],            ["Ichki kiyim"]],
  // ── Poyabzal
  [["erkak poyabzal","erkakботинки","erkak tufli","erkak krossovka"],    ["Erkaklar poyabzali"]],
  [["ayol poyabzal","ayol tufli","ayol balet","ayol boots"],              ["Ayollar poyabzali"]],
  [["sport krossovka","running","беговые","sneaker"],             ["Sport poyabzali"]],
  // ── Go'zallik va parvarish
  [["atir","parfyum","perfume","дух"],                            ["Parfyumeriya"]],
  [["makiyaj","pomada","tush","ko'z soyasi","foundation","blush"],["Makiyaj"]],
  [["soch shampun","konditsioner soch","soch boyoq","soch mask"],["Soch mahsulotlari"]],
  [["krem","yuz parvarish","serum","tonik","moisturizer"],        ["Teri parvarishi"]],
  [["erkak dori","arзон oldirg","tish cho'tkasi","mushtlash"],    ["Erkaklar parvarishi"]],
  // ── Avtotovarlar
  [["avto aksessuar","avtomobil aksessuar","car accessories"],    ["Avto aksessuarlar"]],
  [["moy","motor oil","transmis","антифриз","coolant"],           ["Moy va suyuqliklar"]],
  [["shina","rezina","disk avto","колесо"],                       ["Shinalar va disklar"]],
  [["avto elektronika","registrator","radar detektor","parktronik"],["Avto elektronika"]],
  [["avto tozalash","salon kimyo","polir","антикор"],             ["Tozalash va kimyo"]],
  // ── Bolalar tovarlari
  [["o'yinchoq","lego","konstruktor","qo'g'irchoq","mashina o'yin"],["O'yinchoqlar"]],
  [["aravachа","kolyaska","stroller","beshik"],                   ["Bolalar aravachalari"]],
  [["bolalar mebel","bolalar karavot","bolalar stol","bolalar stul"],["Bolalar mebeli"]],
  [["ta'lim o'yinchoq","educational","montessori","daftar"],      ["Ta'lim va rivojlanish"]],
  [["bolalar oziq","sut aralash","boby food","pampers"],          ["Bolalar oziq-ovqati"]],
  // ── Aksessuarlar
  [["sumka","bag","çanta","рюкзак","ryukzak","portfel"],          ["Sumkalar"]],
  [["hamyon","кошелёк","wallet","purse"],                         ["Hamyonlar"]],
  [["zargarlik","bijuteriya","uzuk","sirg'a","marjon","браслет"], ["Zargarlik va bijuteriya"]],
  [["soat","часы","watch","qo'l soat"],                           ["Soatlar"]],
  [["ko'zoynak","очки","glasses","sunglasses"],                   ["Ko'zoynak"]],
  [["kamar","belbog","пояс","belt"],                              ["Kamarlar"]],
  [["shlyapa","qalpoq","kepka","hat","кепка","бейсболка"],        ["Shlyapalar va qalpoqlar"]],
  [["telefon chexol","chexol","чехол","case","zaryad kabel","kabel","zaryadka"], ["Telefon aksessuarlari"]],
];

export function detectCategory(name: string, cats: Category[]): string {
  if (!name.trim() || !cats.length) return "";
  const lower = name.toLowerCase();

  // Barcha categoriyalarni tekis ro'yxatga chiqarish (parent + sub)
  const allCats: Category[] = [];
  for (const c of cats) {
    if (c.subcategories?.length) allCats.push(...c.subcategories);
    else allCats.push(c);
  }

  for (const c of allCats) {
    if (lower.includes(c.name.toLowerCase())) return c.id;
  }
  for (const [words, targetNames] of KW_MAP) {
    if (words.some((w) => lower.includes(w))) {
      for (const tName of targetNames) {
        const found = allCats.find((c) => c.name.toLowerCase() === tName.toLowerCase());
        if (found) return found.id;
      }
    }
  }
  return "";
}

