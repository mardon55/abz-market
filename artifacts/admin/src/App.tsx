import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AdminLayout } from "@/components/layout/AdminLayout";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import Orders from "@/pages/orders";
import Users from "@/pages/users";
import Stores from "@/pages/stores";
import Categories from "@/pages/categories";
import PaymentMethods from "@/pages/payment-methods";
import Banners from "@/pages/banners";
import FlashSales from "@/pages/flash-sales";
import TopProducts from "@/pages/top-products";
import Delivery from "@/pages/delivery";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function AdminRouter() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/"              component={Dashboard}     />
        <Route path="/products"      component={Products}      />
        <Route path="/orders"        component={Orders}        />
        <Route path="/users"         component={Users}         />
        <Route path="/stores"        component={Stores}        />
        <Route path="/categories"    component={Categories}    />
        <Route path="/payment-methods" component={PaymentMethods} />
        <Route path="/banners"       component={Banners}       />
        <Route path="/flash-sales"   component={FlashSales}    />
        <Route path="/top-products"  component={TopProducts}   />
        <Route path="/delivery"      component={Delivery}      />
        <Route component={NotFound} />
      </Switch>
    </AdminLayout>
  );
}

function AppContent() {
  const ADMIN_TOKEN = "abz_admin_tg_259875997";
  const ADMIN_TG_ID = "259875997";

  const [authed, setAuthed] = useState(() => {
    // 1. Check URL hash for token (e.g. #t=abz_admin_tg_259875997)
    try {
      const hash = window.location.hash;
      const match = hash.match(/[#&]t=([^&]+)/);
      if (match && match[1] === ADMIN_TOKEN) {
        localStorage.setItem("abz_admin_tg_token", ADMIN_TOKEN);
        history.replaceState(null, "", window.location.pathname + window.location.search);
        return true;
      }
    } catch {}

    // 2. Check URL query param ?t=TOKEN (fallback)
    try {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("t");
      if (t === ADMIN_TOKEN) {
        localStorage.setItem("abz_admin_tg_token", ADMIN_TOKEN);
        return true;
      }
    } catch {}

    // 3. Auto-auth via Telegram WebApp SDK (when opened as Mini App)
    try {
      const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
      if (tgUser && String(tgUser.id) === ADMIN_TG_ID) {
        localStorage.setItem("abz_admin_tg_token", ADMIN_TOKEN);
        return true;
      }
    } catch {}

    // 4. Fallback: check localStorage
    return localStorage.getItem("abz_admin_tg_token") === ADMIN_TOKEN;
  });

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <AdminRouter />
    </WouterRouter>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  );
}
