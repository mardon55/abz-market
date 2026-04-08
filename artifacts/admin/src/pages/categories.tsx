import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Edit2, Trash2, Package, RefreshCw, AlertCircle,
  ChevronDown, ChevronRight, FolderTree, Tag, X, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiCategory {
  id: string;
  name: string;
  icon: string | null;
  productCount: number | null;
  parentId: string | null;
  sortOrder: number | null;
  subcategories?: ApiCategory[];
}

const QUICK_EMOJIS = [
  "🪑","🛋","🛏","📚","🪞","🛁","🧹","🪴","🚪","🍳",
  "🧸","💡","🪵","🏠","🛒","🖼️","🪟","💺","🗄️","🛗",
];

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
  name: string; icon: string; parentId?: string | null;
}): Promise<ApiCategory> {
  const r = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("Yaratishda xato");
  return r.json();
}

async function updateCategory(id: string, body: { name: string; icon: string }): Promise<ApiCategory> {
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
  emoji: string;
}

interface ModalState {
  open: boolean;
  mode: "add-parent" | "add-sub" | "edit-parent" | "edit-sub";
  parentId?: string;
  editId?: string;
  parentName?: string;
}

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
  const [form, setForm] = useState<FormState>({ name: "", emoji: "🪑" });
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
      <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-2xl w-full max-w-md">
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
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
              Emoji belgisi
            </label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-3xl flex-shrink-0 select-none">
                {form.emoji || "?"}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Emoji kiriting yoki pastdan tanlang"
                  value={form.emoji}
                  onChange={(e) => {
                    const val = e.target.value;
                    const chars = [...val];
                    if (chars.length <= 2) setForm((f) => ({ ...f, emoji: val }));
                  }}
                  className="w-full h-10 px-3 bg-muted border border-border/60 rounded-xl text-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  maxLength={4}
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Klaviaturangizdan emoji kiriting yoki tezkor tanlov:
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {QUICK_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, emoji: e }))}
                  className={cn(
                    "w-9 h-9 rounded-xl text-lg border-2 transition-all",
                    form.emoji === e
                      ? "border-primary bg-primary/10"
                      : "border-border/40 bg-muted hover:border-primary/40"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
              Nomi (o'zbek tilida) *
            </label>
            <input
              type="text"
              autoFocus
              placeholder={isSub ? "Masalan: Krovati" : "Masalan: Yotoq xona"}
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
    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors group">
      <span className="text-xl w-8 text-center flex-shrink-0">{sub.icon ?? "📦"}</span>
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
      <div className={cn("relative h-24 bg-gradient-to-br flex items-center justify-center overflow-hidden", bg)}>
        <span className="text-4xl drop-shadow-lg">{cat.icon ?? "📦"}</span>
        <div className="absolute bottom-2 left-3 text-white/60 text-[10px] font-bold">#{idx + 1}</div>
        <div className="absolute top-2 right-2 flex gap-1.5">
          <span className="bg-black/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
            {subs.length} sub
          </span>
        </div>
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

        {subs.length === 0 && (
          <button
            onClick={() => onAddSub(cat)}
            className="w-full py-2 rounded-xl border border-dashed border-border/60 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3 h-3" /> Subkategoriya qo'shish
          </button>
        )}
      </div>
    </div>
  );
}

export default function Categories() {
  const qc = useQueryClient();

  const { data: cats = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    refetchInterval: 60_000,
  });

  const createMut = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["categories-list"] });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { name: string; icon: string } }) =>
      updateCategory(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["categories-list"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["categories-list"] });
    },
  });

  const [modal, setModal] = useState<ModalState>({ open: false, mode: "add-parent" });
  const [editTarget, setEditTarget] = useState<ApiCategory | null>(null);

  const openAddParent = () => {
    setEditTarget(null);
    setModal({ open: true, mode: "add-parent" });
  };

  const openEditParent = (cat: ApiCategory) => {
    setEditTarget(cat);
    setModal({ open: true, mode: "edit-parent", editId: cat.id });
  };

  const openAddSub = (parent: ApiCategory) => {
    setEditTarget(null);
    setModal({ open: true, mode: "add-sub", parentId: parent.id, parentName: parent.name });
  };

  const openEditSub = (sub: ApiCategory) => {
    setEditTarget(sub);
    setModal({ open: true, mode: "edit-sub", editId: sub.id });
  };

  const closeModal = () => {
    setModal({ open: false, mode: "add-parent" });
    setEditTarget(null);
  };

  const handleSubmit = async (form: FormState) => {
    try {
      if (modal.mode === "add-parent") {
        await createMut.mutateAsync({ name: form.name, icon: form.emoji, parentId: null });
      } else if (modal.mode === "add-sub") {
        await createMut.mutateAsync({ name: form.name, icon: form.emoji, parentId: modal.parentId });
      } else if (modal.mode === "edit-parent" || modal.mode === "edit-sub") {
        if (modal.editId) {
          await updateMut.mutateAsync({ id: modal.editId, body: { name: form.name, icon: form.emoji } });
        }
      }
      closeModal();
    } catch {
    }
  };

  const handleDelete = (cat: ApiCategory) => {
    const hasSubs = (cat.subcategories?.length ?? 0) > 0;
    const msg = hasSubs
      ? `"${cat.name}" kategoriyasini va uning ${cat.subcategories!.length} ta subkategoriyasini o'chirishni tasdiqlaysizmi?`
      : `"${cat.name}" ni o'chirishni tasdiqlaysizmi?`;
    if (!confirm(msg)) return;
    deleteMut.mutate(cat.id);
  };

  const handleDeleteSub = (sub: ApiCategory) => {
    if (!confirm(`"${sub.name}" subkategoriyasini o'chirishni tasdiqlaysizmi?`)) return;
    deleteMut.mutate(sub.id);
  };

  const isBusy = createMut.isPending || updateMut.isPending;

  const totalSubs = cats.reduce((acc, c) => acc + (c.subcategories?.length ?? 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-primary" />
            Kategoriyalar
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {cats.length} ta asosiy • {totalSubs} ta subkategoriya
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="w-9 h-9 flex items-center justify-center bg-muted border border-border/60 rounded-xl hover:bg-muted/80 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={openAddParent}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Kategoriya qo'shish
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm">Yuklanmoqda...</span>
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <AlertCircle className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm font-medium">Kategoriyalarni yuklashda xato</p>
          <button onClick={() => refetch()} className="mt-3 text-xs text-primary hover:underline">
            Qayta urinish
          </button>
        </div>
      )}

      {!isLoading && !isError && cats.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <FolderTree className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm font-medium">Hech qanday kategoriya yo'q</p>
          <p className="text-xs mt-1">Yuqoridagi tugma orqali kategoriya qo'shing</p>
        </div>
      )}

      {!isLoading && !isError && cats.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cats.map((cat, idx) => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              idx={idx}
              onEdit={openEditParent}
              onDelete={handleDelete}
              onAddSub={openAddSub}
              onEditSub={openEditSub}
              onDeleteSub={handleDeleteSub}
              isDeleting={deleteMut.isPending}
            />
          ))}
        </div>
      )}

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
