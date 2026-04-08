import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initTelegramOnce } from "@/hooks/use-telegram";

// Pages
import BotInterface from "@/pages/bot";
import Home from "@/pages/home";
import Catalog from "@/pages/catalog";
import ProductDetail from "@/pages/product";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Orders from "@/pages/orders";
import Profile from "@/pages/profile";
import Analytics from "@/pages/analytics";
import Stores from "@/pages/stores";
import StoreProfile from "@/pages/store-profile";
import RegisterStore from "@/pages/register-store";
import MyStore from "@/pages/my-store";
import Favorites from "@/pages/favorites";
import TopMahsulotlar from "@/pages/top-mahsulotlar";
import FlashSalePage from "@/pages/flash-sale";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

// Initialize Telegram WebApp ONCE at app startup
initTelegramOnce();

function Router() {
  return (
    <Switch>
      <Route path="/bot" component={BotInterface} />
      <Route path="/" component={Home} />
      <Route path="/catalog" component={Catalog} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/orders" component={Orders} />
      <Route path="/profile" component={Profile} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/stores" component={Stores} />
      <Route path="/store/:id" component={StoreProfile} />
      <Route path="/register-store" component={RegisterStore} />
      <Route path="/my-store" component={MyStore} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/top-mahsulotlar" component={TopMahsulotlar} />
      <Route path="/flash-sale" component={FlashSalePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Apply saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
