import { ReactNode, useState } from "react";
import { useLocation, Link } from "wouter";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Store,
  LayoutGrid, Bell, Search, ChevronDown, LogOut, Menu, X,
  Settings, CreditCard, Image as ImageIcon, Zap, Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard",        path: "/" },
  { icon: Package,         label: "Mahsulotlar",      path: "/products" },
  { icon: ShoppingCart,    label: "Buyurtmalar",      path: "/orders" },
  { icon: Users,           label: "Foydalanuvchilar", path: "/users" },
  { icon: Store,           label: "Do'konlar",        path: "/stores" },
  { icon: LayoutGrid,      label: "Kategoriyalar",    path: "/categories" },
  { icon: CreditCard,      label: "To'lov usullari",  path: "/payment-methods" },
  { icon: Crown,           label: "Top Mahsulotlar",  path: "/top-products" },
  { icon: ImageIcon,       label: "Bannerlar",        path: "/banners" },
  { icon: Zap,             label: "Flash Sale",       path: "/flash-sales" },
];

function NavItem({ icon: Icon, label, path, collapsed }: any) {
  const [location] = useLocation();
  const isActive = location === path || (path !== "/" && location.startsWith(path));
  return (
    <Link href={path}>
      <div className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all group",
        isActive
          ? "bg-white/15 text-white"
          : "text-white/55 hover:text-white hover:bg-white/10"
      )}>
        <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "text-white/55 group-hover:text-white")} />
        {!collapsed && <span className="text-sm font-medium leading-none">{label}</span>}
        {isActive && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
      </div>
    </Link>
  );
}

export function AdminLayout({ children, onLogout }: { children: ReactNode; onLogout?: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={cn(
      "flex flex-col bg-gradient-to-b from-violet-900 via-violet-800 to-purple-900 h-full",
      mobile ? "w-64" : collapsed ? "w-[68px]" : "w-60"
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shrink-0">
          <Store className="w-4.5 h-4.5 text-violet-700" />
        </div>
        {(!collapsed || mobile) && (
          <div>
            <div className="font-display font-bold text-white text-sm leading-none">ABZ Market</div>
            <div className="text-white/40 text-[10px] mt-0.5">Admin Panel</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {NAV.map((item) => (
          <NavItem key={item.path} {...item} collapsed={collapsed && !mobile} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-4 border-t border-white/10 space-y-0.5">
        <div className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-white/55 hover:text-white hover:bg-white/10 transition-all",
        )}>
          <Settings className="w-5 h-5 shrink-0" />
          {(!collapsed || mobile) && <span className="text-sm font-medium">Sozlamalar</span>}
        </div>
        <div
          onClick={onLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-white/55 hover:text-red-300 hover:bg-red-500/10 transition-all",
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {(!collapsed || mobile) && <span className="text-sm font-medium">Chiqish</span>}
        </div>
      </div>

      {/* Admin profile */}
      {(!collapsed || mobile) && (
        <div className="flex items-center gap-3 px-4 py-4 border-t border-white/10">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold text-white text-sm shrink-0">
            A
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-semibold leading-none truncate">Admin</div>
            <div className="text-white/40 text-[10px] mt-0.5">Super admin</div>
          </div>
        </div>
      )}
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col h-full shrink-0 transition-all duration-300" style={{ width: collapsed ? 68 : 240 }}>
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative flex flex-col w-64 h-full">
            <Sidebar mobile />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-14 bg-card border-b border-border/60 flex items-center px-4 gap-3 shrink-0">
          {/* Collapse toggle (desktop) */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="hidden md:flex w-8 h-8 rounded-lg bg-muted items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <Menu className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Mobile menu */}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex md:hidden w-8 h-8 rounded-lg bg-muted items-center justify-center"
          >
            <Menu className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="search"
                placeholder="Qidirish..."
                className="w-full pl-8 pr-3 h-8 bg-muted rounded-lg text-sm border border-border/40 focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Notification */}
            <button className="relative w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full border border-card" />
            </button>

            {/* Admin */}
            <div className="flex items-center gap-2 pl-2 cursor-pointer">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold">
                A
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold leading-none">Admin</div>
                <div className="text-[10px] text-muted-foreground">admin@abzmarket.uz</div>
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
