import { useEffect, useState, useCallback } from "react";

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
    start_param?: string;
  };
  colorScheme: "light" | "dark";
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  version: string;
  platform: string;
  BackButton: {
    isVisible: boolean;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    show(): void;
    hide(): void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText(text: string): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
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
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  onEvent(eventType: string, callback: () => void): void;
  offEvent(eventType: string, callback: () => void): void;
  sendData(data: string): void;
  openLink(url: string): void;
  openTelegramLink(url: string): void;
  openInvoice(url: string, callback?: (status: string) => void): void;
  showPopup(params: { title?: string; message: string; buttons?: Array<{ id?: string; type?: string; text?: string }> }, callback?: (buttonId: string) => void): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback: (result: boolean) => void): void;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
}

const tg = window.Telegram?.WebApp;

export function useTelegram() {
  const [colorScheme, setColorScheme] = useState<"light" | "dark">(
    tg?.colorScheme || "light"
  );
  const [user, setUser] = useState(tg?.initDataUnsafe?.user || null);

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();

      // Listen for theme changes
      const handleThemeChange = () => {
        setColorScheme(tg.colorScheme);
      };
      tg.onEvent("themeChanged", handleThemeChange);

      return () => {
        tg.offEvent("themeChanged", handleThemeChange);
      };
    }
  }, []);

  const showBackButton = useCallback((callback: () => void) => {
    if (tg?.BackButton) {
      tg.BackButton.show();
      tg.BackButton.onClick(callback);
    }
  }, []);

  const hideBackButton = useCallback((callback?: () => void) => {
    if (tg?.BackButton) {
      if (callback) tg.BackButton.offClick(callback);
      tg.BackButton.hide();
    }
  }, []);

  const showMainButton = useCallback((text: string, callback: () => void, color?: string) => {
    if (tg?.MainButton) {
      tg.MainButton.setText(text);
      if (color) tg.MainButton.color = color;
      tg.MainButton.show();
      tg.MainButton.enable();
      tg.MainButton.onClick(callback);
    }
  }, []);

  const hideMainButton = useCallback((callback?: () => void) => {
    if (tg?.MainButton) {
      if (callback) tg.MainButton.offClick(callback);
      tg.MainButton.hide();
    }
  }, []);

  const haptic = useCallback((type: "impact" | "success" | "error" | "warning" | "selection" = "impact") => {
    if (!tg?.HapticFeedback) return;
    if (type === "impact") tg.HapticFeedback.impactOccurred("medium");
    else if (type === "selection") tg.HapticFeedback.selectionChanged();
    else tg.HapticFeedback.notificationOccurred(type);
  }, []);

  const showAlert = useCallback((message: string) => {
    if (tg) {
      tg.showAlert(message);
    } else {
      alert(message);
    }
  }, []);

  const isTelegram = !!tg;
  const isExpanded = tg?.isExpanded ?? false;
  const platform = tg?.platform || "web";

  return {
    tg,
    isTelegram,
    colorScheme,
    user,
    isExpanded,
    platform,
    showBackButton,
    hideBackButton,
    showMainButton,
    hideMainButton,
    haptic,
    showAlert,
  };
}
