import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Edit2, Trash2, Package, RefreshCw, AlertCircle,
  ChevronDown, ChevronRight, FolderTree, Tag, X, Check,
  Upload, Link, ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiCategory {
  id: string;
  name: string;
  icon: string | null;
  image: string | null;
  productCount: number | null;
  parentId: string | null;
  sortOrder: number | null;
  subcategories?: ApiCategory[];
}

const BG_GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-600",
  "from-blue-500 to-indigo-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-sky-600",
  "from-fuchsia-500 to-violet-600",
  "from-lime-500 to-green-600",
  "from-red-500 to-rose-600",
  "from-yellow-500 to-amber-600",
];

function getBg(idx: number) { return BG_GRADIENTS[idx % BG_GRADIENTS.length]; }

async function fetchCategories(): Promise<ApiCategory[]> {
  const r = await fetch("/api/categories");
  if (!r.ok) throw new Error("Kategoriyalar yuklanmadi");
  const data = await r.json();
  return data.categories ?? [];
}

async function createCategory(body: {
  name: string; image?: string; parentId?: string | null;
}): Promise<ApiCategory> {
  const r = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("Yaratishda xato");
  return r.json();
}

async function updateCategory(id: string, body: { name: string; image?: string }): Promise<ApiCategory> {
  const r = await fetch(`/api/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("Yangilashda xato");
  return r.json();
}

async function deleteCategory(id: string): Promise<void> {
  const r = await fetch(`/api/categories/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("O'chirishda xato");
}

interface FormState {
  name: string;
  image: string;
}

interface ModalState {
  open: boolean;
  mode: "add-parent" | "add-sub" | "edit-parent" | "edit-sub";
  parentId?: string;
  editId?: string;
  parentName?: string;
  initialForm?: FormState;
}

// ── Image picker component ──────────────────────────────────────────────────
function ImagePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [tab, setTab] = useState<"url" | "upload">("url");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Fayl 5MB dan kichik bo'lishi kerak"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) onChange(ev.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground block">
        Kategoriya rasmi
      </label>

      {/* Preview */}
      <div className="w-full h-32 rounded-2xl overflow-hidden bg-muted border-2 border-dashed border-border/60 flex items-center justify-center relative">
        {value ? (
          <>
            <img src={value} alt="preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
            <p className="text-xs">Rasm tanlanmagan</p>
          </div>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex rounded-xl bg-muted p-1 gap-1">
        <button
          type="button"
          onClick={() => setTab("url")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 h-7 rounded-lg text-xs font-semibold transition-colors",
            tab === "url" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
          )}
        >
          <Link className="w-3 h-3" /> URL orqali
        </button>
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 h-7 rounded-lg text-xs font-semibold transition-colors",
            tab === "upload" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
          )}
        >
          <Upload className="w-3 h-3" /> Yuklash
        </button>
      </div>

      {tab === "url" ? (
        <input
          type="url"
          placeholder="https://example.com/image.jpg"
          value={value.startsWith("data:") ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-9 px-3 bg-muted border border-border/60 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      ) : (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full h-9 bg-muted border-2 border-dashed border-border/60 rounded-xl text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="w-3.5 h-3.5" />
            Rasm yuklash (maks. 5MB)
          </button>
        </>
      )}
    </div>
  );
}

// ── Category Form Modal ─────────────────────────────────────────────────────
function CategoryFormModal({
  modal,
  onClose,
  onSubmit,
  isBusy,
}: {
  modal: ModalState;
  onClose: () => void;
  onSubmit: (form: FormState) => void;
  isBusy: boolean;
}) {
  const [form, setForm] = useState<FormState>(
    modal.initialForm ?? { name: "", image: "" }
  );
  const [error, setError] = useState("");

  const isEdit = modal.mode.startsWith("edit");
  const isSub = modal.mode.includes("sub");

  const title = isEdit
    ? isSub ? "Subkategoriyani tahrirlash" : "Kategoriyani tahrirlash"
    : isSub ? `"${modal.parentName}" ga subkategoriya qo'shish` : "Yangi kategoriya";

  const handleSubmit = () => {
    if (!form.name.trim()) { setError("Nomini kiriting"); return; }
    setError("");
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-base">{title}</h3>
            {isSub && !isEdit && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Asosiy: <span className="text-primary font-semibold">{modal.parentName}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Image picker */}
          <ImagePicker
            value={form.image}
            onChange={(v) => setForm((f) => ({ ...f, image: v }))}
          />

          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
              Nomi (o'zbek tilida) *
            </label>
            <input
              type="text"
              autoFocus
              placeholder={isSub ? "Masalan: Divonlar" : "Masalan: Yashash xonasi"}
              value={form.name}
              onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full h-10 px-3 bg-muted border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {error && (
              <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {error}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={handleSubmit}
            disabled={isBusy}
            className="flex-1 h-9 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
          >
            {isBusy ? (
              <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saqlanmoqda...</>
            ) : (
              <><Check className="w-3.5 h-3.5" /> {isEdit ? "Saqlash" : "Qo'shish"}</>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-4 h-9 bg-muted border border-border/60 rounded-xl text-sm font-semibold hover:bg-muted/80 transition-colors"
          >
            Bekor
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Subcategory Row ──────────────────────────────────────────────────────────
function SubcategoryRow({
  sub,
  onEdit,
  onDelete,
  isDeleting,
}: {
  sub: ApiCategory;
  onEdit: (sub: ApiCategory) => void;
  onDelete: (sub: ApiCategory) => void;
  isDeleting: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted/50 transition-colors group">
      {/* Thumb */}
      <div className="w-9 h-9 rounded-xl overflow-hidden bg-muted flex-shrink-0">
        {sub.image ? (
          <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg">
            {sub.icon ?? "📦"}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{sub.name}</p>
        <p className="text-[11px] text-muted-foreground flex items-center gap-0.5">
          <Package className="w-2.5 h-2.5" />
          {sub.productCount ?? 0} ta mahsulot
        </p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(sub)}
          className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors"
        >
          <Edit2 className="w-3 h-3" />
        </button>
        <button
          onClick={() => onDelete(sub)}
          disabled={isDeleting}
          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ── Category Card ─────────────────────────────────────────────────────────────
function CategoryCard({
  cat,
  idx,
  onEdit,
  onDelete,
  onAddSub,
  onEditSub,
  onDeleteSub,
  isDeleting,
}: {
  cat: ApiCategory;
  idx: number;
  onEdit: (cat: ApiCategory) => void;
  onDelete: (cat: ApiCategory) => void;
  onAddSub: (cat: ApiCategory) => void;
  onEditSub: (sub: ApiCategory) => void;
  onDeleteSub: (sub: ApiCategory) => void;
  isDeleting: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const subs = cat.subcategories ?? [];
  const bg = getBg(idx);

  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Cover */}
      <div className={cn("relative h-28 overflow-hidden", cat.image ? "" : `bg-gradient-to-br ${bg}`)}>
        {cat.image ? (
          <>
            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent" />
            <div className="flex items-center justify-center h-full">
              <ImageIcon className="w-10 h-10 text-white/40" />
            </div>
          </>
        )}
        <div className="absolute bottom-2 left-3 text-white/70 text-[10px] font-bold">#{idx + 1}</div>
        <div className="absolute top-2 right-2 flex gap-1.5">
          <span className="bg-black/30 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
            {subs.length} sub
          </span>
        </div>
        {cat.image && (
          <div className="absolute bottom-2 right-2">
            <div className="w-6 h-6 bg-emerald-500/80 rounded-full flex items-center justify-center backdrop-blur-sm">
              <ImageIcon className="w-3 h-3 text-white" />
            </div>
          </div>
        )}
      </div>

      <div className="p-3.5">
        <h3 className="font-display font-bold text-base mb-0.5">{cat.name}</h3>
        <div className="flex items-center gap-1 text-muted-foreground text-xs mb-3">
          <Package className="w-3 h-3" />
          {cat.productCount ?? 0} ta mahsulot
        </div>

        <div className="flex gap-1.5 mb-3">
          <button
            onClick={() => onEdit(cat)}
            className="flex-1 h-7 bg-muted hover:bg-blue-50 hover:text-blue-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            <Edit2 className="w-3 h-3" /> Tahrir
          </button>
          <button
            onClick={() => onAddSub(cat)}
            className="flex-1 h-7 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            <Plus className="w-3 h-3" /> Sub qo'sh
          </button>
          <button
            onClick={() => onDelete(cat)}
            disabled={isDeleting}
            className="w-7 h-7 bg-muted hover:bg-red-50 hover:text-red-600 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        {subs.length > 0 && (
          <div>
            <button
              onClick={() => setExpanded((e) => !e)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors text-xs font-semibold text-muted-foreground mb-1"
            >
              <span className="flex items-center gap-1.5">
                <Tag className="w-3 h-3" />
                Subkategoriyalar ({subs.length})
              </span>
              {expanded
                ? <ChevronDown className="w-3.5 h-3.5" />
                : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {expanded && (
              <div className="border border-border/40 rounded-xl overflow-hidden bg-muted/20">
                {subs.map((sub) => (
                  <SubcategoryRow
                    key={sub.id}
                    sub={sub}
                    onEdit={onEditSub}
                    onDelete={onDeleteSub}
                    isDeleting={isDeleting}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const qc = useQueryClient();
  const { data: categories = [], isLoading, error, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const [modal, setModal] = useState<ModalState>({ open: false, mode: "add-parent" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: ({ form, parentId }: { form: FormState; parentId?: string }) =>
      createCategory({ name: form.name, image: form.image || undefined, parentId: parentId ?? null }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); closeModal(); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, form }: { id: string; form: FormState }) =>
      updateCategory(id, { name: form.name, image: form.image || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); closeModal(); },
  });

  const deleteMut = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); setDeletingId(null); },
    onError: () => setDeletingId(null),
  });

  const closeModal = () => setModal({ open: false, mode: "add-parent" });

  const handleSubmit = (form: FormState) => {
    if (modal.mode === "add-parent") {
      createMut.mutate({ form });
    } else if (modal.mode === "add-sub" && modal.parentId) {
      createMut.mutate({ form, parentId: modal.parentId });
    } else if ((modal.mode === "edit-parent" || modal.mode === "edit-sub") && modal.editId) {
      updateMut.mutate({ id: modal.editId, form });
    }
  };

  const openAddParent = () => setModal({ open: true, mode: "add-parent" });

  const openEdit = (cat: ApiCategory) => setModal({
    open: true,
    mode: cat.parentId ? "edit-sub" : "edit-parent",
    editId: cat.id,
    parentName: cat.parentId ? undefined : cat.name,
    initialForm: { name: cat.name, image: cat.image ?? "" },
  });

  const openAddSub = (parent: ApiCategory) => setModal({
    open: true,
    mode: "add-sub",
    parentId: parent.id,
    parentName: parent.name,
  });

  const handleDelete = (cat: ApiCategory) => {
    if (!confirm(`"${cat.name}" kategoriyasini o'chirmoqchimisiz?`)) return;
    setDeletingId(cat.id);
    deleteMut.mutate(cat.id);
  };

  const isBusy = createMut.isPending || updateMut.isPending;
  const totalSubs = categories.reduce((acc, c) => acc + (c.subcategories?.length ?? 0), 0);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
            <FolderTree className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl">Kategoriyalar</h1>
            <p className="text-sm text-muted-foreground">
              {categories.length} asosiy · {totalSubs} subkategoriya
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="w-9 h-9 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openAddParent}
            className="flex items-center gap-2 h-9 px-4 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Yangi kategoriya
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Asosiy", value: categories.length, color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20" },
          { label: "Subkategoriya", value: totalSubs, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
          { label: "Rasmi bor", value: categories.filter((c) => c.image).length + categories.reduce((a, c) => a + (c.subcategories?.filter((s) => s.image).length ?? 0), 0), color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-2xl p-4 text-center", s.color)}>
            <div className="font-display font-bold text-2xl">{s.value}</div>
            <div className="text-xs font-semibold mt-0.5 opacity-70">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 text-destructive">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>Yuklanmadi. Qayta urinib ko'ring.</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20">
          <FolderTree className="w-14 h-14 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="font-semibold text-lg mb-1">Hali kategoriya yo'q</h3>
          <p className="text-muted-foreground text-sm mb-4">Birinchi kategoriyani qo'shing</p>
          <button
            onClick={openAddParent}
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold"
          >
            Kategoriya qo'shish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              idx={idx}
              onEdit={openEdit}
              onDelete={handleDelete}
              onAddSub={openAddSub}
              onEditSub={openEdit}
              onDeleteSub={handleDelete}
              isDeleting={deletingId === cat.id || (cat.subcategories?.some((s) => s.id === deletingId) ?? false)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <CategoryFormModal
          modal={modal}
          onClose={closeModal}
          onSubmit={handleSubmit}
          isBusy={isBusy}
        />
      )}
    </div>
  );
}
