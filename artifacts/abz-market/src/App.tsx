import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTelegram } from "@/hooks/use-telegram";
import NotFound from "@/pages/not-found";

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    }
  }
});

function TelegramProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, tg } = useTelegram();

  useEffect(() => {
    // Apply dark/light mode based on Telegram theme
    const root = document.documentElement;
    if (colorScheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [colorScheme]);

  useEffect(() => {
    // Apply Telegram theme colors if available
    if (tg?.themeParams) {
      const { bg_color, button_color } = tg.themeParams;
      if (button_color) {
        document.documentElement.style.setProperty(
          "--tg-button-color",
          button_color
        );
      }
      if (bg_color) {
        document.documentElement.style.setProperty(
          "--tg-bg-color",
          bg_color
        );
      }
    }
  }, [tg]);

  return <>{children}</>;
}

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

      <Route path="/favorites"><Redirect to="/" /></Route>
      <Route path="/order/:id"><Redirect to="/orders" /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <TelegramProvider>
            <Router />
          </TelegramProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
