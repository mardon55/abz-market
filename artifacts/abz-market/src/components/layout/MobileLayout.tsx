import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Home, Search, ShoppingBag, Heart, User, ArrowLeft, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { motion, AnimatePresence } from "framer-motion";
import { useTelegram } from "@/hooks/use-telegram";

interface MobileLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  headerRight?: ReactNode;
  transparentHeader?: boolean;
}

export function MobileLayout({
  children,
  hideNav = false,
  title,
  showBack,
  onBack,
  headerRight,
  transparentHeader = false
}: MobileLayoutProps) {
  const [location, navigate] = useLocation();
  const cartItemCount = useCartStore((state) => state.getItemCount());
  const { isTelegram, haptic } = useTelegram();

  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDark = () => {
    haptic("selection");
    setIsDark(prev => !prev);
  };

  const navItems = [
    { icon: Home, label: "Bosh sahifa", path: "/" },
    { icon: Search, label: "Katalog", path: "/catalog" },
    { icon: ShoppingBag, label: "Savat", path: "/cart", badge: cartItemCount },
    { icon: Heart, label: "Sevimli", path: "/favorites" },
    { icon: User, label: "Profil", path: "/profile" },
  ];

  const handleBack = () => {
    haptic("impact");
    if (onBack) onBack();
    else window.history.back();
  };

  const handleNavClick = (path: string) => {
    haptic("selection");
    navigate(path);
  };

  return (
    <div className="relative mx-auto max-w-[430px] bg-background min-h-[100dvh] shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      {(title || showBack || headerRight !== undefined) && (
        <header
          className={cn(
            "sticky top-0 z-50 flex items-center h-14 px-4 transition-colors duration-200",
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
                aria-label="Toggle dark mode"
              >
                {isDark
                  ? <Sun className="w-5 h-5 text-yellow-400" />
                  : <Moon className="w-5 h-5 text-muted-foreground" />
                }
              </button>
            )}
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 overflow-y-auto overscroll-none",
        !hideNav && "pb-[72px]"
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      {!hideNav && (
        <nav className="absolute bottom-0 left-0 right-0 z-50">
          <div className="bg-background/95 backdrop-blur-md border-t border-border/60 flex items-center justify-around h-[68px] px-1">
            {navItems.map((item) => {
              const isActive = location === item.path ||
                (item.path !== "/" && location.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className="relative flex flex-col items-center justify-center flex-1 h-full gap-1 group active:scale-90 transition-transform duration-100"
                >
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-indicator"
                      className="absolute top-0 inset-x-2 h-[2px] bg-primary rounded-b-full"
                      transition={{ duration: 0.25 }}
                    />
                  )}
                  <div className="relative">
                    <item.icon
                      className={cn(
                        "w-[22px] h-[22px] transition-all duration-200",
                        isActive
                          ? "text-primary stroke-[2.5px]"
                          : "text-muted-foreground stroke-[1.75px]"
                      )}
                    />
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-destructive text-destructive-foreground text-[9px] font-bold h-[16px] min-w-[16px] px-1 rounded-full flex items-center justify-center border-2 border-background">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
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
