import { MobileLayout } from "@/components/layout/MobileLayout";
import { Link } from "wouter";
import { Settings, Package, Heart, MapPin, CreditCard, HelpCircle, LogOut, ChevronRight, Store, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const isSeller = true; // Mock state

  const menuItems = [
    { icon: Package, label: "Buyurtmalarim", path: "/orders" },
    { icon: Heart, label: "Sevimli mahsulotlar", path: "/favorites" },
    { icon: MapPin, label: "Manzillarim", path: "/addresses" },
    { icon: CreditCard, label: "To'lov usullari", path: "/payments" },
  ];

  const sellerItems = [
    { icon: Store, label: "Mening do'konim", path: "/store/s1" },
    { icon: BarChart2, label: "Analitika", path: "/analytics" },
  ];

  const settingsItems = [
    { icon: Settings, label: "Sozlamalar", path: "/settings" },
    { icon: HelpCircle, label: "Yordam markazi", path: "/help" },
  ];

  const MenuSection = ({ items, title }: any) => (
    <div className="mb-6">
      {title && <h3 className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{title}</h3>}
      <div className="bg-card border-y sm:border sm:rounded-2xl border-border/50">
        {items.map((item: any, i: number) => (
          <Link key={i} href={item.path} className="flex items-center gap-3 p-4 bg-background hover:bg-secondary/50 active:bg-secondary transition-colors border-b border-border/50 last:border-0 sm:first:rounded-t-2xl sm:last:rounded-b-2xl">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground">
              <item.icon className="w-4 h-4" />
            </div>
            <span className="flex-1 font-medium text-sm">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <MobileLayout hideNav={false} title="Profil">
      {/* Header Profile Info */}
      <div className="px-4 py-6 bg-primary text-primary-foreground flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xl font-display font-bold border-2 border-white/40">
          AR
        </div>
        <div>
          <h2 className="font-display font-bold text-xl">Akmal Rajabov</h2>
          <p className="text-primary-foreground/80 text-sm">+998 90 123 45 67</p>
        </div>
      </div>

      <div className="pt-4 pb-8 sm:px-4">
        <MenuSection items={menuItems} title="Asosiy" />
        
        {isSeller && (
          <MenuSection items={sellerItems} title="Sotuvchi paneli" />
        )}

        <MenuSection items={settingsItems} title="Qo'shimcha" />

        <div className="px-4 mt-8">
          <Button variant="outline" className="w-full text-destructive border-destructive/20 hover:bg-destructive/10 rounded-xl h-12">
            <LogOut className="w-4 h-4 mr-2" /> Tizimdan chiqish
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
