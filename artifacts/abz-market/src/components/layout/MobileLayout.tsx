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

// Read theme once at module level to avoid hydration flash
const getInitialDark = () => {
  try {
    return localStorage.getItem("theme") === "dark";
  } catch {
    return false;
  }
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

  // Apply dark class on change
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
    <div className="relative mx-auto max-w-[430px] bg-background min-h-[100dvh] shadow-2xl overflow-hidden flex flex-col">
      {/* ── Header ── */}
      {(title || showBack || headerRight !== undefined) && (
        <header
          className={cn(
            "sticky top-0 z-50 flex items-center h-14 px-4",
            transparentHeader
              ? "bg-gradient-to-b from-black/60 to-transparent text-white border-none"
              : "bg-background/95 backdrop-blur-sm border-b border-border/50 text-foreground"
          )}
        >
          {showBack && (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-full hover:bg-muted active:scale-95 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {title && (
            <h1 className={cn(
              "font-display font-semibold text-[17px] flex-1 line-clamp-1",
              showBack ? "ml-2" : "ml-0"
            )}>
              {title}
            </h1>
          )}

          <div className="ml-auto flex items-center gap-2">
            {headerRight}
            {!transparentHeader && (
              <button
                onClick={toggleDark}
                className="p-2 rounded-full hover:bg-muted active:scale-90 transition-all"
                aria-label="Dark mode"
              >
                {isDark
                  ? <Sun className="w-5 h-5 text-yellow-400" />
                  : <Moon className="w-5 h-5 text-muted-foreground" />}
              </button>
            )}
          </div>
        </header>
      )}

      {/* ── Content ── */}
      <main className={cn("flex-1 overflow-y-auto overscroll-none", !hideNav && "pb-[72px]")}>
        {children}
      </main>

      {/* ── Bottom Nav ── */}
      {!hideNav && (
        <nav className="absolute bottom-0 left-0 right-0 z-50">
          <div className="bg-background/95 backdrop-blur-md border-t border-border/60 flex items-stretch h-[68px]">
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
                  {isActive && (
                    <div className="absolute top-0 inset-x-3 h-[2.5px] bg-primary rounded-b-full" />
                  )}
                  <div className="relative">
                    <item.icon
                      className={cn(
                        "w-[22px] h-[22px] transition-colors duration-150",
                        isActive ? "text-primary stroke-[2.5px]" : "text-muted-foreground stroke-[1.75px]"
                      )}
                    />
                    {badge > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-destructive text-destructive-foreground text-[9px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center border-2 border-background">
                        {badge > 99 ? "99+" : badge}
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium transition-colors duration-150",
                    isActive ? "text-primary font-semibold" : "text-muted-foreground"
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
