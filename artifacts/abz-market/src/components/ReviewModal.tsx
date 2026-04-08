import { useState, useRef } from "react";
import { X, Star, Camera, Loader2, CheckCircle2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// ── Types ──────────────────────────────────────────────────────────────────
interface ReviewItem {
  productId: string;
  productName: string;
  productImage: string | null;
  storeId: string | null;
  orderId: string;
}

interface Props {
  item: ReviewItem;
  onClose: () => void;
  onSuccess: () => void;
}

// ── Image compressor ───────────────────────────────────────────────────────
async function compressImage(file: File, maxDim = 800): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width  = img.width  * scale;
      canvas.height = img.height * scale;
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.src = url;
  });
}

function getTelegramUser() {
  try {
    const tg = (window as any).Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;
    const name = user ? `${user.first_name || ""}${user.last_name ? " " + user.last_name : ""}`.trim() : "";
    const id   = user?.id ? String(user.id) : (localStorage.getItem("tg_user_id") ?? "");
    return { name: name || localStorage.getItem("tg_user_name") || "Mijoz", telegramId: id };
  } catch {
    return { name: "Mijoz", telegramId: "" };
  }
}

// ── Star selector ──────────────────────────────────────────────────────────
function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const labels = ["", "Yomon 😞", "O'rtacha 😐", "Yaxshi 🙂", "Juda yaxshi 😊", "A'lo! 🤩"];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            className="p-1 transition-transform active:scale-110"
          >
            <Star
              className={cn(
                "w-10 h-10 transition-colors",
                s <= (hover || value) ? "fill-yellow-400 text-yellow-400" : "text-gray-200 fill-gray-200"
              )}
            />
          </button>
        ))}
      </div>
      <p className="text-sm font-semibold text-muted-foreground h-5">
        {labels[hover || value]}
      </p>
    </div>
  );
}

// ── Main modal ─────────────────────────────────────────────────────────────
export default function ReviewModal({ item, onClose, onSuccess }: Props) {
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages]   = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImages = async (files: FileList | null) => {
    if (!files) return;
    const remaining = 6 - images.length;
    const toProcess = Array.from(files).slice(0, remaining);
    const compressed = await Promise.all(toProcess.map((f) => compressImage(f)));
    setImages((prev) => [...prev, ...compressed].slice(0, 6));
  };

  const removeImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (rating === 0) { setError("Iltimos, yulduzcha bilan baho bering"); return; }
    setError(null);
    setLoading(true);
    try {
      const { name, telegramId } = getTelegramUser();
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: item.orderId,
          productId: item.productId,
          storeId: item.storeId,
          telegramId: telegramId || undefined,
          customerName: name,
          rating,
          comment: comment.trim() || undefined,
          images,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Xato yuz berdi");
      }
      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (e: any) {
      setError(e.message || "Sharh yuborishda xato");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[430px] bg-background rounded-t-3xl shadow-2xl overflow-hidden"
        style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 shrink-0">
          <div>
            <h2 className="font-display font-bold text-base">Sharh qoldirish</h2>
            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[220px]">{item.productName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {done ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-emerald-500" />
              </div>
              <p className="font-bold text-lg text-center">Rahmat!</p>
              <p className="text-sm text-muted-foreground text-center">Sharhingiz qabul qilindi</p>
            </div>
          ) : (
            <>
              {/* Product mini card */}
              <div className="flex items-center gap-3 bg-muted/30 rounded-2xl p-3">
                {item.productImage ? (
                  <img src={item.productImage} className="w-12 h-12 rounded-xl object-cover shrink-0" alt="" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-muted shrink-0" />
                )}
                <p className="font-semibold text-sm line-clamp-2">{item.productName}</p>
              </div>

              {/* Stars */}
              <div className="bg-muted/30 rounded-2xl p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-3 text-center uppercase tracking-wide">
                  Mahsulotga baho bering
                </p>
                <StarSelector value={rating} onChange={setRating} />
              </div>

              {/* Comment */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                  Izoh (ixtiyoriy)
                </label>
                <Textarea
                  placeholder="Mahsulot haqida fikringizni yozing..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className="rounded-xl bg-white/40 border-white/30 resize-none text-sm"
                />
                <p className="text-[10px] text-muted-foreground mt-1 text-right">{comment.length}/500</p>
              </div>

              {/* Image upload */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-2">
                  Rasmlar ({images.length}/6)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {images.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                      <img src={src} className="w-full h-full object-cover" alt={`rasm ${i + 1}`} />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {images.length < 6 && (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      <Camera className="w-5 h-5" />
                      <span className="text-[10px] font-medium">Rasm qo'sh</span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleImages(e.target.files)}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700 font-medium">
                  ⚠️ {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!done && (
          <div className="shrink-0 px-5 pb-safe pt-3 border-t border-border/50 bg-background">
            <Button
              onClick={handleSubmit}
              disabled={loading || rating === 0}
              className="w-full h-12 rounded-2xl font-bold shadow-lg shadow-primary/20"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Yuborilmoqda...</>
              ) : (
                "✅ Sharh yuborish"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
