import { useRef, useState } from "react";
import { X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Multi-image upload with 3:4 ratio enforcement ─────────────────────────────
const MAX_IMGS = 6;
const TARGET_RATIO = 3 / 4; // 0.75
const RATIO_TOLERANCE = 0.06; // ±6%

async function validateAndCompress(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const ratio = img.naturalWidth / img.naturalHeight;
        if (Math.abs(ratio - TARGET_RATIO) > RATIO_TOLERANCE) {
          reject(new Error(
            `"${file.name}" rasmi 3:4 formatda emas (${img.naturalWidth}×${img.naturalHeight}). ` +
            `Iltimos 3:4 formatdagi rasm yuklang (masalan: 900×1200).`
          ));
          return;
        }
        const MAX = 1200;
        let { naturalWidth: width, naturalHeight: height } = img;
        if (width > MAX || height > MAX) {
          if (width >= height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function MultiImageUpload({
  images,
  onChange,
}: {
  images: string[];
  onChange: (v: string[]) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const toProcess = files.slice(0, MAX_IMGS - images.length);
    setLoading(true);
    setError("");
    const results: string[] = [];
    const errors: string[] = [];
    await Promise.all(
      toProcess.map(async (f) => {
        try {
          const compressed = await validateAndCompress(f);
          results.push(compressed);
        } catch (err) {
          errors.push(err instanceof Error ? err.message : "Xato");
        }
      })
    );
    if (results.length) onChange([...images, ...results].slice(0, MAX_IMGS));
    if (errors.length) setError(errors[0]);
    setLoading(false);
    if (ref.current) ref.current.value = "";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-muted-foreground">
          Mahsulot rasmlari * ({images.length}/{MAX_IMGS})
        </label>
        {images.length > 0 && (
          <span className="text-[10px] text-muted-foreground">Birinchi rasm — asosiy</span>
        )}
      </div>

      {/* 3:4 format haqida ko'rsatma */}
      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 mb-2">
        <span className="text-blue-600 text-base leading-none">📐</span>
        <span className="text-[10px] text-blue-700 font-medium">
          Faqat <b>3:4</b> formatdagi rasmlar qabul qilinadi (masalan: 900×1200, 600×800 px)
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-2">
          <span className="text-red-500 text-sm leading-none mt-0.5">⚠</span>
          <span className="text-[10px] text-red-700 font-medium leading-relaxed">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {images.map((src, idx) => (
          <div
            key={idx}
            className="relative rounded-xl overflow-hidden bg-muted border-2 border-primary/30"
            style={{ aspectRatio: "3/4" }}
          >
            <img src={src} alt="" className="w-full h-full object-cover" />
            {idx === 0 && (
              <div className="absolute bottom-0 inset-x-0 bg-primary/80 text-white text-[9px] font-bold text-center py-0.5">
                Asosiy
              </div>
            )}
            <button
              type="button"
              onClick={() => { onChange(images.filter((_, i) => i !== idx)); setError(""); }}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}

        {images.length < MAX_IMGS && (
          <button
            type="button"
            onClick={() => { setError(""); ref.current?.click(); }}
            className={cn(
              "rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all",
              loading
                ? "border-primary/40 bg-primary/5 cursor-wait"
                : "border-border hover:border-primary/40 hover:bg-muted/50 cursor-pointer"
            )}
            style={{ aspectRatio: "3/4" }}
            disabled={loading}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <>
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-1">
                  <ImageIcon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-[10px] font-semibold text-primary text-center px-1">
                  {images.length === 0 ? "Rasm qo'shish" : "+ Qo'shish"}
                </span>
                <span className="text-[9px] text-muted-foreground text-center mt-0.5">3:4 format</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      {images.length === 0 && !error && (
        <p className="text-[11px] text-muted-foreground mt-2 text-center">
          1–6 ta rasm | maks 15MB | faqat 3:4 format
        </p>
      )}
    </div>
  );
}
