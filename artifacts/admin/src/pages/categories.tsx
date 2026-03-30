import { useState } from "react";
import { Plus, Edit2, Trash2, Package, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const INITIAL = [
  { id: "c1", name: "Shkaflar",   emoji: "🚪", bg: "from-violet-500 to-purple-600", products: 45, order: 1, status: "faol" },
  { id: "c2", name: "Komodlar",   emoji: "🪵", bg: "from-amber-500 to-orange-500",  products: 32, order: 2, status: "faol" },
  { id: "c3", name: "Oshxonalar", emoji: "🍳", bg: "from-emerald-500 to-teal-600",  products: 28, order: 3, status: "faol" },
  { id: "c4", name: "Yotoqxona",  emoji: "🛏", bg: "from-blue-500 to-indigo-600",   products: 23, order: 4, status: "faol" },
  { id: "c5", name: "Stollar",    emoji: "🪑", bg: "from-rose-500 to-pink-600",     products: 18, order: 5, status: "faol" },
  { id: "c6", name: "Stullar",    emoji: "💺", bg: "from-cyan-500 to-sky-600",      products: 14, order: 6, status: "faol" },
  { id: "c7", name: "Divonlar",   emoji: "🛋", bg: "from-fuchsia-500 to-violet-600", products: 11, order: 7, status: "faol" },
  { id: "c8", name: "Javonlar",   emoji: "📚", bg: "from-lime-500 to-green-600",    products: 9,  order: 8, status: "faol" },
];

type Category = typeof INITIAL[0];

export default function Categories() {
  const [cats, setCats] = useState(INITIAL);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", emoji: "🪑" });

  const handleAdd = () => {
    if (!form.name.trim()) return;
    if (editId) {
      setCats((prev) => prev.map((c) => c.id === editId ? { ...c, name: form.name, emoji: form.emoji } : c));
      setEditId(null);
    } else {
      setCats((prev) => [...prev, {
        id: "c" + Date.now(),
        name: form.name,
        emoji: form.emoji,
        bg: "from-violet-500 to-purple-600",
        products: 0,
        order: prev.length + 1,
        status: "faol",
      }]);
    }
    setForm({ name: "", emoji: "🪑" });
    setShowForm(false);
  };

  const handleEdit = (cat: Category) => {
    setForm({ name: cat.name, emoji: cat.emoji });
    setEditId(cat.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setCats((prev) => prev.filter((c) => c.id !== id));
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setCats((prev) => {
      const arr = [...prev];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return arr;
    });
  };
  const moveDown = (idx: number) => {
    setCats((prev) => {
      if (idx === prev.length - 1) return prev;
      const arr = [...prev];
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return arr;
    });
  };

  const totalProducts = cats.reduce((a, c) => a + c.products, 0);

  const EMOJIS = ["🪑","🚪","🛏","🍳","🪵","💺","🛋","📚","🪞","🛁","🧸","🖼️"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Kategoriyalar</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{cats.length} ta kategoriya, {totalProducts} ta mahsulot</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ name: "", emoji: "🪑" }); }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Kategoriya qo'shish
        </button>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="bg-card border border-primary/30 rounded-2xl p-5 mb-5 shadow-sm">
          <h3 className="font-display font-bold text-base mb-4">{editId ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Emoji picker */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Emoji</label>
              <div className="flex flex-wrap gap-1.5">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setForm((f) => ({ ...f, emoji: e }))}
                    className={cn(
                      "w-9 h-9 rounded-xl text-lg border-2 transition-all",
                      form.emoji === e ? "border-primary bg-primary/10" : "border-border/40 bg-muted hover:border-primary/40"
                    )}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            {/* Name input */}
            <div className="flex-1">
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Nomi (Uzbek)</label>
              <input
                type="text"
                placeholder="Masalan: Shkaflar"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full h-10 px-3 bg-muted border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAdd}
              className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              {editId ? "Saqlash" : "Qo'shish"}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditId(null); }}
              className="px-5 py-2 bg-muted border border-border/60 rounded-xl text-sm font-semibold hover:bg-muted/80 transition-colors"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}

      {/* Category cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cats.map((cat, idx) => (
          <div key={cat.id} className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Gradient header */}
            <div className={cn("relative h-28 bg-gradient-to-br flex items-center justify-center overflow-hidden", cat.bg)}>
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/30 transition-colors"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => moveDown(idx)}
                  disabled={idx === cats.length - 1}
                  className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/30 transition-colors"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
              <span className="text-5xl drop-shadow-lg">{cat.emoji}</span>
              <div className="absolute bottom-2 left-3 text-white/60 text-[10px] font-bold">#{idx + 1}</div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-display font-bold text-base mb-1">{cat.name}</h3>
              <div className="flex items-center gap-1 text-muted-foreground text-xs mb-4">
                <Package className="w-3 h-3" />
                {cat.products} ta mahsulot
              </div>

              {/* Mini progress bar */}
              <div className="h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
                <div
                  className={cn("h-full rounded-full bg-gradient-to-r", cat.bg)}
                  style={{ width: `${Math.min((cat.products / totalProducts) * 100 * 3, 100)}%` }}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(cat)}
                  className="flex-1 h-8 bg-muted hover:bg-blue-100 hover:text-blue-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Tahrirlash
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="w-8 h-8 bg-muted hover:bg-red-100 hover:text-red-600 rounded-xl flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
