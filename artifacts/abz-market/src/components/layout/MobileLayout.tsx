import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Home, Search, ShoppingBag, Heart, User, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { motion, AnimatePresence } from "framer-motion";

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

  const navItems = [
    { icon: Home, label: "Asosiy", path: "/" },
    { icon: Search, label: "Katalog", path: "/catalog" },
    { icon: ShoppingBag, label: "Savat", path: "/cart", badge: cartItemCount },
    { icon: Heart, label: "Sevimli", path: "/favorites" }, // Placeholder path
    { icon: User, label: "Profil", path: "/profile" },
  ];

  const handleBack = () => {
    if (onBack) onBack();
    else window.history.back();
  };

  return (
    <div className="relative mx-auto max-w-[430px] bg-background min-h-[100dvh] shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      {(title || showBack || headerRight) && (
        <header 
          className={cn(
            "sticky top-0 z-50 flex items-center h-14 px-4 transition-colors duration-200",
            transparentHeader 
              ? "bg-gradient-to-b from-black/50 to-transparent text-white border-none" 
              : "glass-panel border-b border-border/50 text-foreground"
          )}
        >
          {showBack && (
            <button 
              onClick={handleBack}
              className="p-2 -ml-2 rounded-full hover:bg-black/5 active:scale-95 transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          
          {title && (
            <h1 className={cn(
              "font-display font-semibold text-lg ml-2 flex-1 line-clamp-1",
              !showBack && "ml-0"
            )}>
              {title}
            </h1>
          )}

          <div className="ml-auto">
            {headerRight}
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 overflow-y-auto hide-scrollbar pb-safe",
        !hideNav && "pb-[80px]" // Space for bottom nav
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      {!hideNav && (
        <nav className="absolute bottom-0 left-0 right-0 z-50 pb-safe">
          <div className="glass-panel border-t border-border flex items-center justify-around h-16 px-2 rounded-t-2xl">
            {navItems.map((item) => {
              const isActive = location === item.path || (item.path !== '/' && location.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="relative flex flex-col items-center justify-center w-full h-full space-y-1 tap-highlight-transparent group active:scale-95 transition-transform"
                >
                  <div className="relative">
                    <item.icon 
                      className={cn(
                        "w-6 h-6 transition-all duration-300",
                        isActive ? "text-primary fill-primary/20 stroke-[2px]" : "text-muted-foreground stroke-[1.5px] group-hover:text-foreground"
                      )} 
                    />
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-destructive text-destructive-foreground text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border-2 border-background animate-in zoom-in">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium transition-colors duration-300",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
                  
                  {isActive && (
                    <motion.div 
                      layoutId="bottom-nav-indicator"
                      className="absolute -top-[1px] w-8 h-[3px] bg-primary rounded-b-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
