import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Truck, MapPin, Plus, Trash2, Edit2, Check, X, Phone,
  Clock, ToggleLeft, ToggleRight, Package, AlertCircle, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";

const BASE = "/api";

// ── Types ─────────────────────────────────────────────────────────────────────
interface PickupPoint {
  id: string; name: string; address: string; city: string;
  phone: string | null; workingHours: string | null;
  isActive: boolean; createdAt: string;
}
interface DeliveryZone {
  id: string; region: string; district: string | null;
  price: number; isActive: boolean; createdAt: string;
}

// ── API helpers ────────────────────────────────────────────────────────────────
async function fetchPoints(): Promise<PickupPoint[]> {
  const r = await fetch(`${BASE}/pickup-points`);
  const d = await r.json();
  return d.points ?? [];
}
async function fetchZones(): Promise<DeliveryZone[]> {
  const r = await fetch(`${BASE}/delivery-zones`);
  const d = await r.json();
  return d.zones ?? [];
}

// ── Uzbekistan regions ─────────────────────────────────────────────────────────
const UZ_REGIONS = [
  "Toshkent shahri", "Toshkent viloyati", "Samarqand viloyati",
  "Buxoro viloyati", "Andijon viloyati", "Farg'ona viloyati",
  "Namangan viloyati", "Qashqadaryo viloyati", "Surxondaryo viloyati",
  "Xorazm viloyati", "Navoiy viloyati", "Jizzax viloyati", "Sirdaryo viloyati",
  "Qoraqalpog'iston Respublikasi",
];

// ── Empty forms ────────────────────────────────────────────────────────────────
const emptyPoint = () => ({ name: "", address: "", city: "", phone: "", workingHours: "" });
const emptyZone  = () => ({ region: UZ_REGIONS[0], district: "", price: "" });

// ── Point Form ─────────────────────────────────────────────────────────────────
function PointForm({
  initial, onSave, onCancel, saving,
}: {
  initial?: Partial<PickupPoint>;
  onSave: (d: any) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    address: initial?.address ?? "",
    city: initial?.city ?? "",
    phone: initial?.phone ?? "",
    workingHours: initial?.workingHours ?? "",
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="bg-muted/40 rounded-2xl p-4 space-y-3 border border-border/60">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Punkt nomi *</label>
          <input value={form.name} onChange={set("name")} placeholder="ABZ Punkt №1"
            className="w-full h-9 px-3 rounded-xl border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Shahar *</label>
          <input value={form.city} onChange={set("city")} placeholder="Toshkent"
            className="w-full h-9 px-3 rounded-xl border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Telefon</label>
          <input value={form.phone} onChange={set("phone")} placeholder="+998901234567"
            className="w-full h-9 px-3 rounded-xl border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">To'liq manzil *</label>
          <input value={form.address} onChange={set("address")} placeholder="Yunusobod tumani, Amir Temur shoh ko'chasi 1-uy"
            className="w-full h-9 px-3 rounded-xl border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Ish vaqti</label>
          <input value={form.workingHours} onChange={set("workingHours")} placeholder="Du–Sha: 09:00–19:00"
            className="w-full h-9 px-3 rounded-xl border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={() => onSave(form)} disabled={saving || !form.name || !form.address || !form.city}
          className="flex-1 h-9 bg-primary text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Saqlash</>}
        </button>
        <button onClick={onCancel} className="h-9 px-4 bg-muted rounded-xl text-sm font-semibold">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Zone Form ──────────────────────────────────────────────────────────────────
function ZoneForm({
  initial, onSave, onCancel, saving,
}: {
  initial?: Partial<DeliveryZone>;
  onSave: (d: any) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    region: initial?.region ?? UZ_REGIONS[0],
    district: initial?.district ?? "",
    price: initial?.price !== undefined ? String(initial.price) : "",
  });

  return (
    <div className="bg-muted/40 rounded-2xl p-4 space-y-3 border border-border/60">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Viloyat *</label>
          <select value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
            className="w-full h-9 px-3 rounded-xl border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40">
            {UZ_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Tuman (ixtiyoriy)</label>
          <input value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
            placeholder="Barcha tumanlar"
            className="w-full h-9 px-3 rounded-xl border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Narx (so'm) *</label>
          <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            placeholder="25000"
            className="w-full h-9 px-3 rounded-xl border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={() => onSave({ ...form, price: Number(form.price) })}
          disabled={saving || !form.region || !form.price}
          className="flex-1 h-9 bg-primary text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Saqlash</>}
        </button>
        <button onClick={onCancel} className="h-9 px-4 bg-muted rounded-xl text-sm font-semibold">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Delivery() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"zones" | "points">("zones");

  // ── Pickup Points state ────────────────────────────────────────────────────
  const [showAddPoint, setShowAddPoint] = useState(false);
  const [editPointId, setEditPointId]   = useState<string | null>(null);
  const [deletePointId, setDeletePointId] = useState<string | null>(null);

  const { data: points = [], isLoading: pointsLoading } = useQuery({
    queryKey: ["admin-pickup-points"],
    queryFn: fetchPoints,
    refetchInterval: 15_000,
  });

  const addPointMut = useMutation({
    mutationFn: (d: any) => fetch(`${BASE}/pickup-points`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d),
    }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-pickup-points"] }); setShowAddPoint(false); },
  });

  const updatePointMut = useMutation({
    mutationFn: ({ id, ...d }: any) => fetch(`${BASE}/pickup-points/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d),
    }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-pickup-points"] }); setEditPointId(null); },
  });

  const togglePointMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      fetch(`${BASE}/pickup-points/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-pickup-points"] }),
  });

  const deletePointMut = useMutation({
    mutationFn: (id: string) => fetch(`${BASE}/pickup-points/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-pickup-points"] }); setDeletePointId(null); },
  });

  // ── Delivery Zones state ───────────────────────────────────────────────────
  const [showAddZone, setShowAddZone]   = useState(false);
  const [editZoneId, setEditZoneId]     = useState<string | null>(null);
  const [deleteZoneId, setDeleteZoneId] = useState<string | null>(null);

  const { data: zones = [], isLoading: zonesLoading } = useQuery({
    queryKey: ["admin-delivery-zones"],
    queryFn: fetchZones,
    refetchInterval: 15_000,
  });

  const addZoneMut = useMutation({
    mutationFn: (d: any) => fetch(`${BASE}/delivery-zones`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d),
    }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-delivery-zones"] }); setShowAddZone(false); },
  });

  const updateZoneMut = useMutation({
    mutationFn: ({ id, ...d }: any) => fetch(`${BASE}/delivery-zones/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d),
    }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-delivery-zones"] }); setEditZoneId(null); },
  });

  const toggleZoneMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      fetch(`${BASE}/delivery-zones/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-delivery-zones"] }),
  });

  const deleteZoneMut = useMutation({
    mutationFn: (id: string) => fetch(`${BASE}/delivery-zones/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-delivery-zones"] }); setDeleteZoneId(null); },
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Truck className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-display font-bold text-2xl">Yetkazib berish</h1>
        </div>
        <p className="text-sm text-muted-foreground ml-12">Dastavka narxlari va punktlarni boshqarish</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-2xl mb-6 w-fit">
        <button
          onClick={() => setTab("zones")}
          className={cn(
            "flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all",
            tab === "zones" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Truck className="w-4 h-4" /> Dastavka narxlari
        </button>
        <button
          onClick={() => setTab("points")}
          className={cn(
            "flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all",
            tab === "points" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <MapPin className="w-4 h-4" /> Olib ketish punktlari
        </button>
      </div>

      {/* ── DELIVERY ZONES TAB ────────────────────────────────────────────────── */}
      {tab === "zones" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-base">Viloyat / Tuman narxlari</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Har bir hududga alohida dastavka narxi belgilang</p>
            </div>
            <button
              onClick={() => { setShowAddZone(v => !v); setEditZoneId(null); }}
              className="flex items-center gap-1.5 h-9 px-4 bg-primary text-white rounded-xl text-sm font-bold"
            >
              <Plus className="w-4 h-4" /> Qo'shish
            </button>
          </div>

          {showAddZone && (
            <ZoneForm
              onSave={d => addZoneMut.mutate(d)}
              onCancel={() => setShowAddZone(false)}
              saving={addZoneMut.isPending}
            />
          )}

          {zonesLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : zones.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-center">
              <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center">
                <Truck className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-semibold text-muted-foreground">Dastavka hududlari yo'q</p>
              <p className="text-sm text-muted-foreground">Viloyat yoki tumanlarga narx belgilang</p>
            </div>
          ) : (
            <div className="space-y-2">
              {zones.map(z => (
                <div key={z.id}>
                  {editZoneId === z.id ? (
                    <ZoneForm
                      initial={z}
                      onSave={d => updateZoneMut.mutate({ id: z.id, ...d })}
                      onCancel={() => setEditZoneId(null)}
                      saving={updateZoneMut.isPending}
                    />
                  ) : (
                    <div className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl border transition-all",
                      z.isActive ? "bg-card border-border/60" : "bg-muted/30 border-border/30 opacity-60"
                    )}>
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Truck className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{z.region}</div>
                        {z.district && <div className="text-xs text-muted-foreground mt-0.5">{z.district}</div>}
                      </div>
                      <div className="text-right mr-2">
                        <div className="font-bold text-primary text-sm">{formatPrice(z.price)}</div>
                        <div className="text-[10px] text-muted-foreground">dastavka</div>
                      </div>

                      {/* Toggle */}
                      <button
                        onClick={() => toggleZoneMut.mutate({ id: z.id, isActive: !z.isActive })}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title={z.isActive ? "O'chirish" : "Yoqish"}
                      >
                        {z.isActive
                          ? <ToggleRight className="w-6 h-6 text-primary" />
                          : <ToggleLeft className="w-6 h-6" />}
                      </button>

                      {/* Edit */}
                      <button onClick={() => { setEditZoneId(z.id); setShowAddZone(false); }}
                        className="w-8 h-8 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      {deleteZoneId === z.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => deleteZoneMut.mutate(z.id)} disabled={deleteZoneMut.isPending}
                            className="h-8 px-2 bg-red-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 disabled:opacity-50">
                            {deleteZoneMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Ha"}
                          </button>
                          <button onClick={() => setDeleteZoneId(null)} className="h-8 px-2 bg-muted rounded-lg text-xs font-semibold">Yo'q</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteZoneId(z.id)}
                          className="w-8 h-8 rounded-lg bg-muted hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PICKUP POINTS TAB ─────────────────────────────────────────────────── */}
      {tab === "points" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-base">Olib ketish punktlari</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Mijozlar buyurtmani bu yerdan olib ketishi mumkin</p>
            </div>
            <button
              onClick={() => { setShowAddPoint(v => !v); setEditPointId(null); }}
              className="flex items-center gap-1.5 h-9 px-4 bg-primary text-white rounded-xl text-sm font-bold"
            >
              <Plus className="w-4 h-4" /> Qo'shish
            </button>
          </div>

          {showAddPoint && (
            <PointForm
              onSave={d => addPointMut.mutate(d)}
              onCancel={() => setShowAddPoint(false)}
              saving={addPointMut.isPending}
            />
          )}

          {pointsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : points.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-center">
              <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center">
                <MapPin className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-semibold text-muted-foreground">Punktlar yo'q</p>
              <p className="text-sm text-muted-foreground">Yangi punkt qo'shing</p>
            </div>
          ) : (
            <div className="space-y-2">
              {points.map(p => (
                <div key={p.id}>
                  {editPointId === p.id ? (
                    <PointForm
                      initial={p}
                      onSave={d => updatePointMut.mutate({ id: p.id, ...d })}
                      onCancel={() => setEditPointId(null)}
                      saving={updatePointMut.isPending}
                    />
                  ) : (
                    <div className={cn(
                      "p-4 rounded-2xl border transition-all",
                      p.isActive ? "bg-card border-border/60" : "bg-muted/30 border-border/30 opacity-60"
                    )}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Package className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">{p.name}</span>
                            <span className={cn(
                              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                              p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                            )}>
                              {p.isActive ? "Faol" : "Nofaol"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span>{p.city}, {p.address}</span>
                          </div>
                          {p.phone && (
                            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                              <Phone className="w-3 h-3 shrink-0" />
                              <span>{p.phone}</span>
                            </div>
                          )}
                          {p.workingHours && (
                            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>{p.workingHours}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Toggle */}
                          <button
                            onClick={() => togglePointMut.mutate({ id: p.id, isActive: !p.isActive })}
                            title={p.isActive ? "O'chirish" : "Yoqish"}
                          >
                            {p.isActive
                              ? <ToggleRight className="w-6 h-6 text-primary" />
                              : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
                          </button>

                          {/* Edit */}
                          <button onClick={() => { setEditPointId(p.id); setShowAddPoint(false); }}
                            className="w-8 h-8 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          {deletePointId === p.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => deletePointMut.mutate(p.id)} disabled={deletePointMut.isPending}
                                className="h-8 px-2 bg-red-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 disabled:opacity-50">
                                {deletePointMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Ha"}
                              </button>
                              <button onClick={() => setDeletePointId(null)} className="h-8 px-2 bg-muted rounded-lg text-xs font-semibold">Yo'q</button>
                            </div>
                          ) : (
                            <button onClick={() => setDeletePointId(p.id)}
                              className="w-8 h-8 rounded-lg bg-muted hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
