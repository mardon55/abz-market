import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Package, ChevronUp, ChevronDown, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiCategory {
  id: string;
  name: string;
  icon: string | null;
  productCount: number | null;
}

const EMOJIS = ["🚪","🪵","🍳","🛏","🪑","💺","🛋","📚","🪞","🛁","🧸","🖼️","🪴","🛒","🏠","🛍️"];

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

// ── API helpers ───────────────────────────────────────────────────────────────
async function fetchCategories(): Promise<ApiCategory[]> {
  const r = await fetch("/api/categories");
  if (!r.ok) throw new Error("Kategoriyalar yuklanmadi");
  const data = await r.json();
  return data.categories ?? [];
}

async function createCategory(body: { name: string; icon: string }): Promise<ApiCategory> {
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

// ── Main component ─────────────────────────────────────────────────────────────
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

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState<string | null>(null);
  const [form, setForm]         = useState({ name: "", emoji: "🪑" });
  const [formError, setFormError] = useState("");

  const handleSubmit = async () => {
    if (!form.name.trim()) { setFormError("Kategoriya nomini kiriting"); return; }
    setFormError("");
    try {
      if (editId) {
        await updateMut.mutateAsync({ id: editId, body: { name: form.name.trim(), icon: form.emoji } });
      } else {
        await createMut.mutateAsync({ name: form.name.trim(), icon: form.emoji });
      }
      setForm({ name: "", emoji: "🪑" });
      setEditId(null);
      setShowForm(false);
    } catch (err) {
      setFormError((err as Error).message);
    }
  };

  const handleEdit = (cat: ApiCategory) => {
    setForm({ name: cat.name, emoji: cat.icon ?? "🪑" });
    setEditId(cat.id);
    setShowForm(true);
    setFormError("");
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`"${name}" kategoriyasini o'chirishni tasdiqlaysizmi?`)) return;
    deleteMut.mutate(id);
  };

  const isBusy = createMut.isPending || updateMut.isPending;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Kategoriyalar</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {cats.length} ta kategoriya
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
            onClick={() => { setShowForm(true); setEditId(null); setForm({ name: "", emoji: "🪑" }); setFormError(""); }}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Kategoriya qo'shish
          </button>
        </div>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="bg-card border border-primary/30 rounded-2xl p-5 mb-5 shadow-sm">
          <h3 className="font-display font-bold text-base mb-4">
            {editId ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Emoji picker */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Emoji (belgi)</label>
              <div className="flex flex-wrap gap-1.5">
                {EMOJIS.map((e) => (
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
            {/* Name */}
            <div className="flex-1">
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Nomi (o'zbek tilida) *</label>
              <input
                type="text"
                placeholder="Masalan: Shkaflar"
                value={form.name}
                onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setFormError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full h-10 px-3 bg-muted border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {formError && (
                <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {formError}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSubmit}
              disabled={isBusy}
              className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {isBusy ? "Saqlanmoqda..." : editId ? "Saqlash" : "Qo'shish"}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditId(null); setFormError(""); }}
              className="px-5 py-2 bg-muted border border-border/60 rounded-xl text-sm font-semibold hover:bg-muted/80 transition-colors"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}

      {/* States */}
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
          <Package className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm font-medium">Hech qanday kategoriya yo'q</p>
          <p className="text-xs mt-1">Yuqoridagi tugma orqali kategoriya qo'shing</p>
        </div>
      )}

      {/* Category cards */}
      {!isLoading && !isError && cats.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cats.map((cat, idx) => {
            const bg = getBg(idx);
            return (
              <div
                key={cat.id}
                className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Gradient header */}
                <div className={cn("relative h-28 bg-gradient-to-br flex items-center justify-center overflow-hidden", bg)}>
                  <span className="text-5xl drop-shadow-lg">{cat.icon ?? "📦"}</span>
                  <div className="absolute bottom-2 left-3 text-white/60 text-[10px] font-bold">#{idx + 1}</div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-display font-bold text-base mb-1">{cat.name}</h3>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs mb-4">
                    <Package className="w-3 h-3" />
                    {cat.productCount ?? 0} ta mahsulot
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="flex-1 h-8 bg-muted hover:bg-blue-100 hover:text-blue-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Tahrirlash
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      disabled={deleteMut.isPending}
                      className="w-8 h-8 bg-muted hover:bg-red-100 hover:text-red-600 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
