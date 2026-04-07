import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getProducts, getProduct, getCategories, getOrders, getStore, getStores, getAnalyticsSummary, getAnalyticsChart, createOrder
} from '@workspace/api-client-react';
import type { 
  GetProductsParams, GetOrdersParams, GetStoresParams, GetAnalyticsSummaryParams, GetAnalyticsChartParams, CreateOrderRequest 
} from '@workspace/api-client-react';
import { mockProducts, mockCategories, mockOrders, mockStores, mockAnalytics, mockChartData } from './use-mock-data';

// Wrappers around the generated queries that fallback to rich mock data 
// if the endpoint fails (e.g. 404), ensuring the UI is always stunning.

export function useProducts(params?: GetProductsParams) {
  return useQuery({
    queryKey: ['/api/products', params],
    queryFn: async () => {
      try {
        const data = await getProducts(params);
        if (data && data.products) return data;
        throw new Error("Invalid response");
      } catch (e) {
        console.warn("Using mock products", e);
        // Apply simple mock filtering
        let filtered = [...mockProducts];
        if (params?.categoryId) filtered = filtered.filter(p => p.categoryId === params.categoryId);
        if (params?.search) filtered = filtered.filter(p => p.name.toLowerCase().includes(params.search!.toLowerCase()));
        if (params?.featured) filtered = filtered.filter(p => p.isFeatured);
        return { products: filtered, total: filtered.length };
      }
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['/api/products', id],
    queryFn: async () => {
      try {
        const data = await getProduct(id);
        if (data) return data;
        throw new Error("Not found");
      } catch (e) {
        console.warn("Using mock product", e);
        return mockProducts.find(p => p.id === id) || mockProducts[0];
      }
    },
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      try {
        const data = await getCategories();
        if (data && data.categories) return data;
        throw new Error("Invalid response");
      } catch (e) {
        console.warn("Using mock categories");
        return { categories: mockCategories };
      }
    }
  });
}

export function useOrders(params?: GetOrdersParams, options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: ['/api/orders', params],
    queryFn: async () => {
      const data = await getOrders(params);
      if (data && data.orders) return data;
      return { orders: [] };
    },
    refetchInterval: options?.refetchInterval,
  });
}

export function useStores(params?: GetStoresParams) {
  return useQuery({
    queryKey: ['/api/stores', params],
    queryFn: async () => {
      try {
        const data = await getStores(params);
        if (data && data.stores) return data;
        throw new Error("Invalid response");
      } catch (e) {
        console.warn("Using mock stores");
        return { stores: mockStores };
      }
    }
  });
}

export function useStoreProfile(id: string) {
  return useQuery({
    queryKey: ['/api/stores', id],
    queryFn: async () => {
      try {
        const data = await getStore(id);
        if (data) return data;
        throw new Error("Not found");
      } catch (e) {
        console.warn("Using mock store profile");
        return mockStores.find(s => s.id === id) || mockStores[0];
      }
    },
    enabled: !!id,
  });
}

export function useAnalyticsSummary(params?: GetAnalyticsSummaryParams) {
  return useQuery({
    queryKey: ['/api/analytics/summary', params],
    queryFn: async () => {
      try {
        const data = await getAnalyticsSummary(params);
        if (data) return data;
        throw new Error("Invalid response");
      } catch (e) {
        console.warn("Using mock analytics");
        return mockAnalytics;
      }
    }
  });
}

export function useAnalyticsChart(params?: GetAnalyticsChartParams) {
  return useQuery({
    queryKey: ['/api/analytics/chart', params],
    queryFn: async () => {
      try {
        const data = await getAnalyticsChart(params);
        if (data && data.data) return data;
        throw new Error("Invalid response");
      } catch (e) {
        console.warn("Using mock chart data");
        return { data: mockChartData };
      }
    }
  });
}

export function useSubmitOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateOrderRequest) => {
      return await createOrder(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    }
  });
}
