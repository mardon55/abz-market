import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Home, Search, ShoppingBag, Heart, User, ArrowLeft, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { hapticFeedback } from "@/hooks/use-telegram";

interface MobileLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  headerRight?: ReactNode;
  transparentHeader?: boolean;
}

const NAV_ITEMS = [
  { icon: Home,        label: "Bosh sahifa", path: "/" },
  { icon: Search,      label: "Katalog",     path: "/catalog" },
  { icon: ShoppingBag, label: "Savat",       path: "/cart" },
  { icon: Heart,       label: "Sevimli",     path: "/favorites" },
  { icon: User,        label: "Profil",      path: "/profile" },
];

const getInitialDark = () => {
  try { return localStorage.getItem("theme") === "dark"; }
  catch { return false; }
};

export function MobileLayout({
  children,
  hideNav = false,
  title,
  showBack,
  onBack,
  headerRight,
  transparentHeader = false,
}: MobileLayoutProps) {
  const [location, navigate] = useLocation();
  const cartItemCount = useCartStore((s) => s.getItemCount());
  const [isDark, setIsDark] = useState(getInitialDark);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const handleBack = () => {
    hapticFeedback("impact");
    if (onBack) onBack();
    else window.history.back();
  };

  const handleNav = (path: string) => {
    hapticFeedback("selection");
    navigate(path);
  };

  const toggleDark = () => {
    hapticFeedback("selection");
    setIsDark((v) => !v);
  };

  return (
    <div className="relative mx-auto max-w-[430px] h-[100dvh] overflow-hidden flex flex-col">

      {/* ── Header ─────────────────────────────────────── */}
      {(title || showBack || headerRight !== undefined) && (
        <header
          className={cn(
            "sticky top-0 z-50 flex items-center h-[52px] px-4",
            transparentHeader
              ? "bg-transparent text-white"
              : "glass border-b border-white/40 text-foreground shadow-ios-sm"
          )}
        >
          {showBack && (
            <button
              onClick={handleBack}
              className="w-8 h-8 -ml-1 rounded-2xl flex items-center justify-center press-sm bg-black/5 dark:bg-white/10"
            >
              <ArrowLeft className="w-[18px] h-[18px]" />
            </button>
          )}

          {title && (
            <h1 className={cn(
              "font-display font-bold text-[17px] flex-1 line-clamp-1",
              showBack ? "ml-2.5" : "ml-0"
            )}>
              {title}
            </h1>
          )}

          <div className="ml-auto flex items-center gap-1.5">
            {headerRight}
            {!transparentHeader && (
              <button
                onClick={toggleDark}
                className="w-8 h-8 rounded-2xl flex items-center justify-center press-sm bg-black/5 dark:bg-white/10"
                aria-label="Toggle dark mode"
              >
                {isDark
                  ? <Sun className="w-4 h-4 text-amber-400" />
                  : <Moon className="w-4 h-4 text-foreground/70" />}
              </button>
            )}
          </div>
        </header>
      )}

      {/* ── Content ────────────────────────────────────── */}
      <main className={cn(
        "flex-1 overflow-y-auto overscroll-none",
        !hideNav && "pb-[72px]"
      )}>
        {children}
      </main>

      {/* ── Bottom Navigation ──────────────────────────── */}
      {!hideNav && (
        <nav className="absolute bottom-0 left-0 right-0 z-50">
          <div className="glass-nav flex items-stretch h-[68px]">
            {NAV_ITEMS.map((item) => {
              const isActive =
                location === item.path ||
                (item.path !== "/" && location.startsWith(item.path));
              const badge = item.path === "/cart" ? cartItemCount : 0;

              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className="relative flex flex-col items-center justify-center flex-1 gap-[3px] active:scale-90 transition-transform duration-100"
                >
                  {/* Active pill indicator */}
                  {isActive && (
                    <div className="absolute top-0 inset-x-4 h-[2px] bg-primary rounded-b-full shadow-[0_1px_8px_rgba(124,58,237,0.5)]" />
                  )}

                  <div className="relative">
                    {/* Icon with glass bubble when active */}
                    <div className={cn(
                      "w-8 h-8 rounded-2xl flex items-center justify-center transition-all duration-200",
                      isActive ? "bg-primary/10 dark:bg-primary/20" : "bg-transparent"
                    )}>
                      <item.icon
                        className={cn(
                          "w-[20px] h-[20px] transition-all duration-200",
                          isActive
                            ? "text-primary stroke-[2.25px] drop-shadow-[0_0_8px_rgba(124,58,237,0.4)]"
                            : "text-foreground/40 stroke-[1.75px]"
                        )}
                      />
                    </div>
                    {badge > 0 && (
                      <span className="absolute -top-1 -right-1.5 bg-destructive text-white text-[9px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center border-2 border-background shadow-sm">
                        {badge > 99 ? "99+" : badge}
                      </span>
                    )}
                  </div>

                  <span className={cn(
                    "text-[10px] font-semibold transition-colors duration-200",
                    isActive ? "text-primary" : "text-foreground/40"
                  )}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
