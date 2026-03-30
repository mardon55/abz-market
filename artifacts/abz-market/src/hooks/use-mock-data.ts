import type { Product, Category, Store, Order, AnalyticsSummary } from '@workspace/api-client-react/src/generated/api.schemas';

// High quality mock data to ensure the UI looks incredible even if the API fails
export const mockCategories: Category[] = [
  { id: 'c1', name: 'Shkaflar', icon: 'door-closed', productCount: 124 },
  { id: 'c2', name: 'Komodlar', icon: 'layers', productCount: 85 },
  { id: 'c3', name: 'Oshxonalar', icon: 'chef-hat', productCount: 42 },
  { id: 'c4', name: 'Yotoqxona', icon: 'bed-double', productCount: 210 },
  { id: 'c5', name: 'Stollar', icon: 'table', productCount: 156 },
  { id: 'c6', name: 'Stullar', icon: 'rocking-chair', productCount: 320 },
];

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: "Zamonaviy 'Lusso' Yotoq To'plami",
    price: 12500000,
    oldPrice: 15000000,
    description: "Premium sifatdagi materiallardan tayyorlangan zamonaviy yotoqxona to'plami. MDF va DSP dan ishlangan, Turkiya furniturasi ishlatilgan. Kafolat 2 yil.",
    images: [
      "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&q=80",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80"
    ],
    categoryId: 'c4',
    categoryName: 'Yotoqxona',
    storeId: 's1',
    storeName: 'Elegance Mebel',
    rating: 4.8,
    reviewCount: 124,
    colors: ['#FFFFFF', '#D1D5DB', '#1E293B'],
    sizes: ['Standart'],
    dimensions: '200x180x60 cm',
    warranty: '2 yil',
    deliveryDays: 3,
    isTopSelling: true,
    isFeatured: true,
    discount: 16,
    salesCount: 45
  },
  {
    id: 'p2',
    name: "Minimalist 'Nordic' Oshxona Stoli",
    price: 3200000,
    oldPrice: null,
    description: "Yog'och va metal qorishmasidan tayyorlangan zamonaviy oshxona stoli. 6 kishilik.",
    images: [
      "https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800&q=80"
    ],
    categoryId: 'c5',
    categoryName: 'Stollar',
    storeId: 's2',
    storeName: 'WoodLineUz',
    rating: 4.5,
    reviewCount: 56,
    colors: ['#8B5A2B', '#000000'],
    sizes: ['160x90', '180x90'],
    dimensions: '160x90x75 cm',
    warranty: '1 yil',
    deliveryDays: 1,
    isTopSelling: false,
    isFeatured: true,
    discount: 0,
    salesCount: 120
  },
  {
    id: 'p3',
    name: "Katta Sig'imli Kiyim Shkafi 'Grand'",
    price: 5800000,
    oldPrice: 6500000,
    description: "4 eshikli, oyna qoplamali katta kiyim shkafi. Ichida tortmalar va veshalkalar uchun keng joy mavjud.",
    images: [
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80"
    ],
    categoryId: 'c1',
    categoryName: 'Shkaflar',
    storeId: 's1',
    storeName: 'Elegance Mebel',
    rating: 4.9,
    reviewCount: 89,
    colors: ['#FFFFFF', '#E5E7EB'],
    sizes: ['4 eshikli', '6 eshikli'],
    dimensions: '240x220x60 cm',
    warranty: '3 yil',
    deliveryDays: 5,
    isTopSelling: true,
    isFeatured: false,
    discount: 10,
    salesCount: 88
  },
  {
    id: 'p4',
    name: "Qulay Dam Olish Kreslosi",
    price: 1850000,
    oldPrice: 2100000,
    description: "Yumshoq baxmal qoplamali qulay dam olish kreslosi. Ergonomik dizayn.",
    images: [
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80"
    ],
    categoryId: 'c6',
    categoryName: 'Stullar',
    storeId: 's3',
    storeName: 'Comfort Home',
    rating: 4.7,
    reviewCount: 42,
    colors: ['#F59E0B', '#3B82F6', '#10B981'],
    sizes: ['Standart'],
    warranty: '1 yil',
    deliveryDays: 2,
    isTopSelling: false,
    isFeatured: true,
    discount: 12,
    salesCount: 34
  }
];

export const mockStores: Store[] = [
  {
    id: 's1',
    name: 'Elegance Mebel',
    logo: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1000&q=80',
    description: "O'zbekistondagi eng yirik premium mebel ishlab chiqaruvchilaridan biri.",
    type: 'manufacturer',
    rating: 4.9,
    reviewCount: 1250,
    productCount: 340,
    salesCount: 5000,
    deliveryRate: 98,
    location: 'Toshkent sh., Yunusobod tumani',
    phone: '+998 90 123 45 67',
    isVerified: true
  },
  {
    id: 's2',
    name: 'WoodLineUz',
    logo: 'https://images.unsplash.com/photo-1618220179428-22790b46a015?w=200&q=80',
    description: "Sof yog'ochdan yasalgan eksklyuziv mebellar do'koni.",
    type: 'partner',
    rating: 4.7,
    reviewCount: 450,
    productCount: 120,
    salesCount: 1200,
    location: 'Toshkent sh., Chilonzor tumani',
    phone: '+998 99 987 65 43',
    isVerified: true
  }
];

export const mockOrders: Order[] = [
  {
    id: 'o1',
    orderNumber: 'ORD-2025-00124',
    status: 'shipped',
    customerName: 'Alisher Usmonov',
    customerPhone: '+998901112233',
    address: 'Toshkent sh., Mirzo Ulugbek t., 14-uy',
    paymentMethod: 'card',
    totalPrice: 12500000,
    createdAt: '2025-01-20T10:30:00Z',
    storeId: 's1',
    storeName: 'Elegance Mebel',
    items: [
      {
        productId: 'p1',
        productName: "Zamonaviy 'Lusso' Yotoq To'plami",
        productImage: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=200&q=80",
        quantity: 1,
        price: 12500000,
        color: '#FFFFFF'
      }
    ]
  },
  {
    id: 'o2',
    orderNumber: 'ORD-2025-00145',
    status: 'new',
    customerName: 'Alisher Usmonov',
    customerPhone: '+998901112233',
    address: 'Toshkent sh., Mirzo Ulugbek t., 14-uy',
    paymentMethod: 'cash',
    totalPrice: 3200000,
    createdAt: '2025-01-24T15:45:00Z',
    storeId: 's2',
    storeName: 'WoodLineUz',
    items: [
      {
        productId: 'p2',
        productName: "Minimalist 'Nordic' Oshxona Stoli",
        productImage: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=200&q=80",
        quantity: 1,
        price: 3200000,
        color: '#8B5A2B'
      }
    ]
  }
];

export const mockAnalytics: AnalyticsSummary = {
  totalRevenue: 450000000,
  revenueChange: 12.5,
  totalOrders: 145,
  ordersChange: 8.2,
  averageCheck: 3100000,
  averageCheckChange: -2.1,
  conversionRate: 4.2,
  conversionChange: 0.5,
  activeProducts: 85,
  topProducts: [
    { productId: 'p1', productName: "Zamonaviy 'Lusso' Yotoq To'plami", revenue: 125000000, salesCount: 10 },
    { productId: 'p3', productName: "Katta Sig'imli Kiyim Shkafi 'Grand'", revenue: 87000000, salesCount: 15 },
    { productId: 'p2', productName: "Minimalist 'Nordic' Oshxona Stoli", revenue: 64000000, salesCount: 20 },
  ]
};

export const mockChartData = [
  { date: 'Dush', revenue: 15000000, orders: 4 },
  { date: 'Sesh', revenue: 22000000, orders: 6 },
  { date: 'Chor', revenue: 18000000, orders: 5 },
  { date: 'Pay', revenue: 35000000, orders: 9 },
  { date: 'Jum', revenue: 42000000, orders: 12 },
  { date: 'Shan', revenue: 58000000, orders: 15 },
  { date: 'Yak', revenue: 48000000, orders: 14 },
];
