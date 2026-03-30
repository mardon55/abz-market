import { MobileLayout } from "@/components/layout/MobileLayout";
import { Link } from "wouter";
import { MessageCircle, ShoppingBag, Search, Store, Users, MapPin } from "lucide-react";

export default function BotInterface() {
  return (
    <div className="max-w-[430px] mx-auto min-h-[100dvh] bg-[#f1f1f1] dark:bg-[#121212] relative overflow-hidden flex flex-col">
      {/* Telegram App Header Mock */}
      <header className="bg-white dark:bg-[#1c1c1d] px-4 py-2 border-b border-black/5 dark:border-white/5 flex items-center gap-3 sticky top-0 z-50">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
          <MessageCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-semibold text-base leading-tight">ABZ Market Bot</h1>
          <p className="text-xs text-primary">bot</p>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 p-4 flex flex-col justify-end bg-[url('https://web.telegram.org/a/chat-bg-pattern-light.png')] dark:bg-[url('https://web.telegram.org/a/chat-bg-pattern-dark.png')] bg-cover bg-center opacity-90">
        
        <div className="bg-white dark:bg-[#212121] rounded-2xl rounded-bl-sm p-4 max-w-[85%] shadow-sm mb-4 animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-[15px] leading-relaxed mb-2 text-foreground">
            👋 Assalomu alaykum! <strong>ABZ MARKET</strong> rasmiy botiga xush kelibsiz.
          </p>
          <p className="text-[15px] leading-relaxed text-foreground">
            Siz bu yerda o'zingizga yoqqan mebellarni qidirishingiz, buyurtma berishingiz va sotuvchi bo'lishingiz mumkin.
            <br/><br/>
            Katalogga kirish uchun quyidagi tugmani bosing 👇
          </p>
          <span className="text-[11px] text-muted-foreground float-right mt-1">12:45</span>
        </div>

        {/* Inline Keyboard Simulation */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <Link href="/" className="col-span-2 bg-primary text-primary-foreground py-3.5 rounded-xl text-center font-medium shadow-md shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Ilovani ochish (Katalog)
          </Link>
          
          <Link href="/catalog" className="bg-white dark:bg-[#2c2c2e] text-foreground py-3 rounded-xl text-center font-medium shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm border border-black/5 dark:border-white/5">
            <Search className="w-4 h-4 text-primary" />
            Qidiruv
          </Link>
          
          <Link href="/cart" className="bg-white dark:bg-[#2c2c2e] text-foreground py-3 rounded-xl text-center font-medium shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm border border-black/5 dark:border-white/5">
            <ShoppingBag className="w-4 h-4 text-primary" />
            Savatcham
          </Link>

          <Link href="/stores" className="bg-white dark:bg-[#2c2c2e] text-foreground py-3 rounded-xl text-center font-medium shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm border border-black/5 dark:border-white/5">
            <Store className="w-4 h-4 text-primary" />
            Do'konlar
          </Link>

          <Link href="/register-store" className="bg-white dark:bg-[#2c2c2e] text-foreground py-3 rounded-xl text-center font-medium shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm border border-black/5 dark:border-white/5">
            <Users className="w-4 h-4 text-primary" />
            Hamkor bo'lish
          </Link>
        </div>
      </main>
      
      {/* Bot input mock */}
      <div className="bg-white dark:bg-[#1c1c1d] p-3 flex items-center gap-3 border-t border-black/5 dark:border-white/5 pb-safe">
        <button className="text-muted-foreground"><MapPin className="w-6 h-6" /></button>
        <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-full px-4 py-2 text-[15px] text-muted-foreground">Xabar yozing...</div>
      </div>
    </div>
  );
}
