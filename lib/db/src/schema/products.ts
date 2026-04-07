import { pgTable, text, numeric, integer, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  telegramId: text("telegram_id").unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  phone: text("phone"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const categoriesTable = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  icon: text("icon"),
  productCount: integer("product_count").default(0),
});

export const storesTable = pgTable("stores", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  logo: text("logo"),
  coverImage: text("cover_image"),
  description: text("description"),
  type: text("type").notNull().default("partner"),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  productCount: integer("product_count").default(0),
  salesCount: integer("sales_count").default(0),
  deliveryRate: numeric("delivery_rate", { precision: 5, scale: 2 }),
  location: text("location"),
  phone: text("phone"),
  stir: text("stir"),
  activityType: text("activity_type"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const productsTable = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  price: numeric("price", { precision: 15, scale: 2 }).notNull(),
  oldPrice: numeric("old_price", { precision: 15, scale: 2 }),
  description: text("description"),
  images: text("images").array(),
  categoryId: uuid("category_id").references(() => categoriesTable.id),
  storeId: uuid("store_id").references(() => storesTable.id).notNull(),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  colors: text("colors").array(),
  sizes: text("sizes").array(),
  dimensions: text("dimensions"),
  warranty: text("warranty"),
  deliveryDays: integer("delivery_days").default(3),
  isTopSelling: boolean("is_top_selling").default(false),
  isFeatured: boolean("is_featured").default(false),
  discount: integer("discount"),
  salesCount: integer("sales_count").default(0),
  quantity: integer("quantity").default(1),
  status: text("status").notNull().default("approved"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ordersTable = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: text("order_number").notNull().unique(),
  status: text("status").notNull().default("new"),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  address: text("address").notNull(),
  comment: text("comment"),
  paymentMethod: text("payment_method").notNull().default("cash"),
  totalPrice: numeric("total_price", { precision: 15, scale: 2 }).notNull(),
  storeId: uuid("store_id").references(() => storesTable.id),
  telegramId: text("telegram_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItemsTable = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => ordersTable.id).notNull(),
  productId: uuid("product_id").references(() => productsTable.id).notNull(),
  productName: text("product_name").notNull(),
  productImage: text("product_image"),
  quantity: integer("quantity").notNull().default(1),
  price: numeric("price", { precision: 15, scale: 2 }).notNull(),
  color: text("color"),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true });
export const insertStoreSchema = createInsertSchema(storesTable).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true });

export type Product = typeof productsTable.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Store = typeof storesTable.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Order = typeof ordersTable.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Category = typeof categoriesTable.$inferSelect;
export type OrderItem = typeof orderItemsTable.$inferSelect;
