// Telegram WebApp — lightweight singleton hook
// tg.ready() and tg.expand() are called ONCE from App.tsx/TelegramProvider.
// This hook only reads from the global tg object and returns stable helpers.

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

interface TelegramWebApp {
  ready(): void;
  expand(): void;
  close(): void;
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      photo_url?: string;
    };
  };
  colorScheme: "light" | "dark";
  themeParams: {
    bg_color?: string;
    text_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  version: string;
  platform: string;
  BackButton: {
    isVisible: boolean;
    onClick(cb: () => void): void;
    offClick(cb: () => void): void;
    show(): void;
    hide(): void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    setText(text: string): void;
    onClick(cb: () => void): void;
    offClick(cb: () => void): void;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    showProgress(leaveActive?: boolean): void;
    hideProgress(): void;
  };
  HapticFeedback: {
    impactOccurred(style: "light" | "medium" | "heavy" | "rigid" | "soft"): void;
    notificationOccurred(type: "error" | "success" | "warning"): void;
    selectionChanged(): void;
  };
  onEvent(eventType: string, callback: () => void): void;
  offEvent(eventType: string, callback: () => void): void;
  sendData(data: string): void;
  openLink(url: string): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback: (result: boolean) => void): void;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
}

// Singleton — read-only after module load
const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;

// Initialize ONCE at module level (no React re-render triggered)
// Only fully initializes inside actual Telegram (initData is non-empty)
let _initialized = false;
export function initTelegramOnce() {
  if (_initialized || !tg) return;
  _initialized = true;
  // Always call ready() so Telegram hides the loading spinner
  tg.ready();
  // expand() only inside real Telegram — in dev/Replit preview it causes iframe resize flicker
  if (tg.initData) {
    tg.expand();
  }
  // Persist Telegram user ID to localStorage so it's available across sessions/pages
  const user = tg.initDataUnsafe?.user;
  if (user?.id) {
    try { localStorage.setItem("tg_user_id", String(user.id)); } catch {}

    // Auto-register user in DB (fire-and-forget)
    try {
      fetch("/api/users/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramId: String(user.id),
          firstName: user.first_name ?? "Foydalanuvchi",
          lastName: user.last_name ?? null,
          avatar: user.photo_url ?? null,
        }),
      }).catch(() => {});
    } catch {}
  }
}

// Stable haptic function (no hook, no re-render)
export function hapticFeedback(type: "impact" | "success" | "error" | "warning" | "selection" = "impact") {
  if (!tg?.HapticFeedback) return;
  try {
    if (type === "impact") tg.HapticFeedback.impactOccurred("medium");
    else if (type === "selection") tg.HapticFeedback.selectionChanged();
    else tg.HapticFeedback.notificationOccurred(type as "error" | "success" | "warning");
  } catch (_) {
    // HapticFeedback not supported in older versions — silently ignore
  }
}

// Hook — lightweight, no state, no side effects, safe to call anywhere
export function useTelegram() {
  const isTelegram = !!tg;
  const colorScheme = tg?.colorScheme ?? "light";
  const user = tg?.initDataUnsafe?.user ?? null;
  const platform = tg?.platform ?? "web";

  return {
    tg,
    isTelegram,
    colorScheme,
    user,
    platform,
    haptic: hapticFeedback,
    showAlert(message: string) {
      if (tg) tg.showAlert(message);
      else alert(message);
    },
  };
}
