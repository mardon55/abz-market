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
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function AdminRouter({ onLogout }: { onLogout: () => void }) {
  return (
    <AdminLayout onLogout={onLogout}>
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
        <Route component={NotFound} />
      </Switch>
    </AdminLayout>
  );
}

function AppContent() {
  const ADMIN_TOKEN = "abz_admin_tg_6271849608";
  const [authed, setAuthed] = useState(() => localStorage.getItem("abz_admin_tg_token") === ADMIN_TOKEN);

  const handleLogout = () => {
    localStorage.removeItem("abz_admin_tg_token");
    setAuthed(false);
  };

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <AdminRouter onLogout={handleLogout} />
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
