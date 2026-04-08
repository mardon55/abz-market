import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Bell, Package, Store, Megaphone, CheckCheck, Trash2, ChevronLeft, ShoppingBag } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = "/api";

interface Notification {
  id: string;
  telegramId: string | null;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  meta: string | null;
  createdAt: string;
}

function typeIcon(type: string) {
  if (type.startsWith("order_"))    return <ShoppingBag className="w-5 h-5" />;
  if (type.startsWith("store_"))    return <Store className="w-5 h-5" />;
  if (type.startsWith("product_"))  return <Package className="w-5 h-5" />;
  return <Megaphone className="w-5 h-5" />;
}

function typeBg(type: string) {
  if (type.startsWith("order_"))    return "bg-blue-500/20 text-blue-400";
  if (type === "store_approved")    return "bg-green-500/20 text-green-400";
  if (type === "store_rejected")    return "bg-red-500/20 text-red-400";
  if (type.startsWith("product_"))  return "bg-orange-500/20 text-orange-400";
  return "bg-violet-500/20 text-violet-400";
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Hozirgina";
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} soat oldin`;
  const days = Math.floor(hrs / 24);
  return `${days} kun oldin`;
}

export default function NotificationsPage() {
  const [, nav] = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const telegramId = String(
    (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id ??
    localStorage.getItem("tg_user_id") ??
    ""
  );

  const fetchNotifs = useCallback(async () => {
    if (!telegramId) { setLoading(false); return; }
    try {
      const r = await fetch(`${API}/notifications?telegramId=${telegramId}`);
      const d = await r.json();
      setNotifications(d.notifications ?? []);
    } finally {
      setLoading(false);
    }
  }, [telegramId]);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  const markRead = async (id: string) => {
    await fetch(`${API}/notifications/${id}/read`, { method: "PATCH" });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = async () => {
    if (!telegramId) return;
    await fetch(`${API}/notifications/read-all?telegramId=${telegramId}`, { method: "PATCH" });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotif = async (id: string) => {
    setDeleting(id);
    await fetch(`${API}/notifications/${id}`, { method: "DELETE" });
    setNotifications(prev => prev.filter(n => n.id !== id));
    setDeleting(null);
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg,#f8f7ff 0%,#f0edff 100%)" }}>
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 border-b border-violet-100">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => nav(`${BASE}/profile`)}
            className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-violet-700" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-gray-900 text-base leading-none">Bildirishnomalar</h1>
            {unread > 0 && (
              <p className="text-violet-600 text-xs mt-0.5">{unread} ta o'qilmagan</p>
            )}
          </div>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 rounded-xl text-violet-700 text-xs font-semibold active:scale-95 transition-transform"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Barchasini o'qi
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-4 max-w-md mx-auto">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse h-24" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-3xl bg-violet-100 flex items-center justify-center mb-4">
              <Bell className="w-9 h-9 text-violet-400" />
            </div>
            <h3 className="font-bold text-gray-700 text-lg mb-1">Bildirishnoma yo'q</h3>
            <p className="text-gray-400 text-sm max-w-xs">Buyurtma holati, do'kon yangiliklari va boshqa xabarlar shu yerda chiqadi</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => !n.isRead && markRead(n.id)}
                className={`relative bg-white rounded-2xl p-4 shadow-sm border transition-all active:scale-[0.99] cursor-pointer ${
                  n.isRead ? "border-gray-100" : "border-violet-200 shadow-violet-100"
                }`}
              >
                {/* Unread dot */}
                {!n.isRead && (
                  <span className="absolute top-4 right-4 w-2 h-2 bg-violet-500 rounded-full" />
                )}

                <div className="flex gap-3">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${typeBg(n.type)}`}>
                    {typeIcon(n.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-4">
                    <p className={`text-sm font-semibold leading-tight mb-0.5 ${n.isRead ? "text-gray-700" : "text-gray-900"}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">{n.body}</p>
                    <p className="text-[11px] text-gray-400 mt-1.5">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNotif(n.id); }}
                  disabled={deleting === n.id}
                  className="absolute bottom-3 right-3 w-7 h-7 flex items-center justify-center rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
