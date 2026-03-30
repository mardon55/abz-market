import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AdminLayout } from "@/components/layout/AdminLayout";
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import Orders from "@/pages/orders";
import Users from "@/pages/users";
import Stores from "@/pages/stores";
import Categories from "@/pages/categories";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/"           component={Dashboard}  />
        <Route path="/products"   component={Products}   />
        <Route path="/orders"     component={Orders}     />
        <Route path="/users"      component={Users}      />
        <Route path="/stores"     component={Stores}     />
        <Route path="/categories" component={Categories} />
        <Route component={NotFound} />
      </Switch>
    </AdminLayout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <Toaster />
    </QueryClientProvider>
  );
}
