import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  ordersTable, productsTable, orderItemsTable,
  storesTable, usersTable, categoriesTable,
} from "@workspace/db/schema";
import { sql, gte, eq, and, lte, count, sum } from "drizzle-orm";

const router: IRouter = Router();

type Period = "today" | "week" | "month" | "year" | "7days" | "30days" | "90days";

function getRange(period: Period): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();
  switch (period) {
    case "today":  from.setHours(0, 0, 0, 0); break;
    case "week":   from.setDate(from.getDate() - 7); break;
    case "month":  from.setMonth(from.getMonth() - 1); break;
    case "year":   from.setFullYear(from.getFullYear() - 1); break;
    case "7days":  from.setDate(from.getDate() - 7); break;
    case "30days": from.setDate(from.getDate() - 30); break;
    case "90days": from.setDate(from.getDate() - 90); break;
    default:       from.setDate(from.getDate() - 30);
  }
  return { from, to };
}

function getPrevRange(period: Period): { from: Date; to: Date } {
  const curr = getRange(period);
  const diff = curr.to.getTime() - curr.from.getTime();
  return {
    from: new Date(curr.from.getTime() - diff),
    to:   new Date(curr.from.getTime()),
  };
}

function pct(curr: number, prev: number): number {
  if (prev === 0) return 0;
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}

// Helper: query revenue+orders for a date range (with optional storeId)
async function queryRevOrders(from: Date, to: Date, storeId?: string) {
  const conds = [
    gte(ordersTable.createdAt, from),
    lte(ordersTable.createdAt, to),
  ];
  if (storeId) conds.push(eq(ordersTable.storeId, storeId));
  const res = await db
    .select({
      total: sql<string>`COALESCE(SUM(CAST(${ordersTable.totalPrice} AS NUMERIC)), 0)`,
      cnt:   sql<string>`COUNT(*)`,
    })
    .from(ordersTable)
    .where(and(...conds));
  return { total: Number(res[0]?.total ?? 0), cnt: Number(res[0]?.cnt ?? 0) };
}

// ── Admin summary endpoint ─────────────────────────────────────────────────
router.get("/analytics/summary", async (req, res) => {
  try {
    const period = (req.query.period as Period) ?? "month";
    const { from, to } = getRange(period);
    const prev = getPrevRange(period);

    const [currData, prevData] = await Promise.all([
      queryRevOrders(from, to),
      queryRevOrders(prev.from, prev.to),
    ]);

    const totalRevenue = currData.total;
    const totalOrders  = currData.cnt;
    const prevRevenue  = prevData.total;
    const prevOrders   = prevData.cnt;
    const averageCheck = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const prevAvgCheck = prevOrders  > 0 ? prevRevenue  / prevOrders  : 0;

    // User count
    const [userRow] = await db.select({ cnt: sql<string>`COUNT(*)` }).from(usersTable);
    const totalCustomers = Number(userRow?.cnt ?? 0);

    // Active stores
    const [storeRow] = await db
      .select({ cnt: sql<string>`COUNT(*)` })
      .from(storesTable)
      .where(eq(storesTable.isVerified, true));
    const activeStores = Number(storeRow?.cnt ?? 0);

    // Active products
    const [prodRow] = await db
      .select({ cnt: sql<string>`COUNT(*)` })
      .from(productsTable)
      .where(eq(productsTable.status, "approved"));
    const activeProducts = Number(prodRow?.cnt ?? 0);

    // Top products for period
    const topProducts = await db
      .select({
        productId:   productsTable.id,
        productName: productsTable.name,
        revenue: sql<string>`COALESCE(SUM(CAST(${orderItemsTable.price} AS NUMERIC) * ${orderItemsTable.quantity}), 0)`,
        salesCount: sql<string>`COALESCE(SUM(${orderItemsTable.quantity}), 0)`,
      })
      .from(orderItemsTable)
      .innerJoin(productsTable, eq(orderItemsTable.productId, productsTable.id))
      .innerJoin(ordersTable,   eq(orderItemsTable.orderId,   ordersTable.id))
      .where(and(gte(ordersTable.createdAt, from), lte(ordersTable.createdAt, to)))
      .groupBy(productsTable.id, productsTable.name)
      .orderBy(sql`SUM(${orderItemsTable.quantity}) DESC`)
      .limit(10);

    // Recent orders
    const recentOrders = await db
      .select({
        id:           ordersTable.id,
        orderNumber:  ordersTable.orderNumber,
        customerName: ordersTable.customerName,
        totalPrice:   ordersTable.totalPrice,
        status:       ordersTable.status,
        createdAt:    ordersTable.createdAt,
        storeName:    storesTable.name,
      })
      .from(ordersTable)
      .leftJoin(storesTable, eq(ordersTable.storeId, storesTable.id))
      .orderBy(sql`${ordersTable.createdAt} DESC`)
      .limit(10);

    // Category breakdown (join categories table)
    const categoryBreakdown = await db
      .select({
        name:    categoriesTable.name,
        sales:   sql<string>`COALESCE(SUM(${orderItemsTable.quantity}), 0)`,
        revenue: sql<string>`COALESCE(SUM(CAST(${orderItemsTable.price} AS NUMERIC) * ${orderItemsTable.quantity}), 0)`,
      })
      .from(orderItemsTable)
      .innerJoin(productsTable,   eq(orderItemsTable.productId, productsTable.id))
      .innerJoin(categoriesTable, eq(productsTable.categoryId,  categoriesTable.id))
      .innerJoin(ordersTable,     eq(orderItemsTable.orderId,   ordersTable.id))
      .where(and(gte(ordersTable.createdAt, from), lte(ordersTable.createdAt, to)))
      .groupBy(categoriesTable.name)
      .orderBy(sql`SUM(${orderItemsTable.quantity}) DESC`)
      .limit(6);

    const COLORS = ["#7C3AED","#A855F7","#C084FC","#DDD6FE","#8B5CF6","#6D28D9"];

    res.json({
      totalRevenue,
      totalOrders,
      totalCustomers,
      activeStores,
      activeProducts,
      averageCheck,
      revenueChange:      pct(totalRevenue, prevRevenue),
      ordersChange:       pct(totalOrders,  prevOrders),
      averageCheckChange: pct(averageCheck, prevAvgCheck),
      topProducts: topProducts.map((p) => ({
        productId:   p.productId,
        productName: p.productName,
        revenue:     Number(p.revenue),
        salesCount:  Number(p.salesCount),
      })),
      recentOrders: recentOrders.map((o) => ({
        id:           o.id,
        orderNumber:  o.orderNumber,
        customerName: o.customerName,
        storeName:    o.storeName,
        totalPrice:   Number(o.totalPrice),
        status:       o.status,
        createdAt:    o.createdAt,
      })),
      categoryBreakdown: categoryBreakdown.map((c, i) => ({
        name:    c.name,
        revenue: Number(c.revenue),
        sales:   Number(c.sales),
        color:   COLORS[i % COLORS.length],
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching analytics summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Chart endpoint ─────────────────────────────────────────────────────────
router.get("/analytics/chart", async (req, res) => {
  try {
    const period = (req.query.period as Period) ?? "month";
    const storeId = req.query.storeId as string | undefined;
    const data: { label: string; revenue: number; orders: number }[] = [];

    const WEEKDAYS = ["Yak","Du","Se","Ch","Pa","Ju","Sha"];
    const MONTHS   = ["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];

    if (period === "today") {
      for (let h = 0; h < 24; h++) {
        const d1 = new Date(); d1.setHours(h, 0, 0, 0);
        const d2 = new Date(); d2.setHours(h + 1, 0, 0, 0);
        const r = await queryRevOrders(d1, d2, storeId);
        data.push({ label: `${h}:00`, revenue: r.total, orders: r.cnt });
      }
    } else if (period === "year") {
      for (let m = 11; m >= 0; m--) {
        const d1 = new Date(); d1.setMonth(d1.getMonth() - m, 1); d1.setHours(0, 0, 0, 0);
        const d2 = new Date(d1); d2.setMonth(d2.getMonth() + 1);
        const r = await queryRevOrders(d1, d2, storeId);
        data.push({ label: MONTHS[d1.getMonth()], revenue: r.total, orders: r.cnt });
      }
    } else {
      const days = period === "week" || period === "7days" ? 7 : period === "90days" ? 90 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const d1 = new Date(); d1.setDate(d1.getDate() - i); d1.setHours(0, 0, 0, 0);
        const d2 = new Date(d1); d2.setDate(d2.getDate() + 1);
        const r = await queryRevOrders(d1, d2, storeId);
        const label = days <= 7 ? WEEKDAYS[d1.getDay()] : `${d1.getDate()}/${d1.getMonth() + 1}`;
        data.push({ label, revenue: r.total, orders: r.cnt });
      }
    }

    res.json({ data });
  } catch (err) {
    req.log.error({ err }, "Error fetching chart data");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Store (seller) analytics ───────────────────────────────────────────────
router.get("/analytics/store/:storeId", async (req, res) => {
  try {
    const { storeId } = req.params;
    const period = (req.query.period as Period) ?? "month";
    const { from, to } = getRange(period);
    const prev = getPrevRange(period);

    const [currData, prevData] = await Promise.all([
      queryRevOrders(from, to, storeId),
      queryRevOrders(prev.from, prev.to, storeId),
    ]);

    const totalRevenue = currData.total;
    const totalOrders  = currData.cnt;
    const prevRevenue  = prevData.total;
    const prevOrders   = prevData.cnt;
    const avgCheck     = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const prevAvgCheck = prevOrders  > 0 ? prevRevenue  / prevOrders  : 0;

    // Top products
    const topProducts = await db
      .select({
        productId:   productsTable.id,
        productName: productsTable.name,
        revenue:     sql<string>`COALESCE(SUM(CAST(${orderItemsTable.price} AS NUMERIC) * ${orderItemsTable.quantity}), 0)`,
        salesCount:  sql<string>`COALESCE(SUM(${orderItemsTable.quantity}), 0)`,
      })
      .from(orderItemsTable)
      .innerJoin(productsTable, eq(orderItemsTable.productId, productsTable.id))
      .innerJoin(ordersTable,   eq(orderItemsTable.orderId,   ordersTable.id))
      .where(and(
        eq(ordersTable.storeId, storeId),
        gte(ordersTable.createdAt, from),
        lte(ordersTable.createdAt, to)
      ))
      .groupBy(productsTable.id, productsTable.name)
      .orderBy(sql`SUM(${orderItemsTable.quantity}) DESC`)
      .limit(5);

    // Unique customers
    const [custRow] = await db
      .select({ cnt: sql<string>`COUNT(DISTINCT ${ordersTable.telegramId})` })
      .from(ordersTable)
      .where(and(
        eq(ordersTable.storeId, storeId),
        gte(ordersTable.createdAt, from),
        lte(ordersTable.createdAt, to)
      ));

    // Pending orders
    const [pendingRow] = await db
      .select({ cnt: sql<string>`COUNT(*)` })
      .from(ordersTable)
      .where(and(eq(ordersTable.storeId, storeId), eq(ordersTable.status, "pending")));

    // Recent orders
    const recentOrders = await db
      .select({
        id:           ordersTable.id,
        orderNumber:  ordersTable.orderNumber,
        customerName: ordersTable.customerName,
        totalPrice:   ordersTable.totalPrice,
        status:       ordersTable.status,
        createdAt:    ordersTable.createdAt,
      })
      .from(ordersTable)
      .where(eq(ordersTable.storeId, storeId))
      .orderBy(sql`${ordersTable.createdAt} DESC`)
      .limit(5);

    res.json({
      totalRevenue,
      totalOrders,
      uniqueCustomers: Number(custRow?.cnt ?? 0),
      pendingOrders:   Number(pendingRow?.cnt ?? 0),
      averageCheck: avgCheck,
      revenueChange:     pct(totalRevenue, prevRevenue),
      ordersChange:      pct(totalOrders,  prevOrders),
      averageCheckChange:pct(avgCheck,     prevAvgCheck),
      topProducts: topProducts.map((p) => ({
        productId:   p.productId,
        productName: p.productName,
        revenue:     Number(p.revenue),
        salesCount:  Number(p.salesCount),
      })),
      recentOrders: recentOrders.map((o) => ({
        id:           o.id,
        orderNumber:  o.orderNumber,
        customerName: o.customerName,
        totalPrice:   Number(o.totalPrice),
        status:       o.status,
        createdAt:    o.createdAt,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching store analytics");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
