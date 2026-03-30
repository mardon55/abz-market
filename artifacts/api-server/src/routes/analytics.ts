import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { ordersTable, productsTable, orderItemsTable } from "@workspace/db/schema";
import { sql, gte, eq } from "drizzle-orm";

const router: IRouter = Router();

function getPeriodDate(period: string): Date {
  const now = new Date();
  switch (period) {
    case "today":
      now.setHours(0, 0, 0, 0);
      return now;
    case "7days":
      now.setDate(now.getDate() - 7);
      return now;
    case "30days":
      now.setDate(now.getDate() - 30);
      return now;
    case "90days":
      now.setDate(now.getDate() - 90);
      return now;
    default:
      now.setDate(now.getDate() - 30);
      return now;
  }
}

router.get("/analytics/summary", async (req, res) => {
  try {
    const { period = "30days" } = req.query as Record<string, string>;
    const periodDate = getPeriodDate(period);

    const revenueResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(CAST(total_price AS NUMERIC)), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(ordersTable)
      .where(gte(ordersTable.createdAt, periodDate));

    const totalRevenue = Number(revenueResult[0]?.total ?? 0);
    const totalOrders = Number(revenueResult[0]?.count ?? 0);
    const averageCheck = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const topProducts = await db
      .select({
        productId: productsTable.id,
        productName: productsTable.name,
        revenue: sql<number>`COALESCE(SUM(CAST(order_items.price AS NUMERIC) * order_items.quantity), 0)`,
        salesCount: sql<number>`COALESCE(SUM(order_items.quantity), 0)`,
      })
      .from(orderItemsTable)
      .innerJoin(productsTable, eq(orderItemsTable.productId, productsTable.id))
      .innerJoin(ordersTable, eq(orderItemsTable.orderId, ordersTable.id))
      .where(gte(ordersTable.createdAt, periodDate))
      .groupBy(productsTable.id, productsTable.name)
      .orderBy(sql`SUM(order_items.quantity) DESC`)
      .limit(5);

    res.json({
      totalRevenue,
      revenueChange: 12,
      totalOrders,
      ordersChange: 8,
      averageCheck,
      averageCheckChange: 3,
      conversionRate: 2.8,
      conversionChange: 0.3,
      activeProducts: 128,
      topProducts: topProducts.map((p) => ({
        productId: p.productId,
        productName: p.productName,
        revenue: Number(p.revenue),
        salesCount: Number(p.salesCount),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching analytics summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/analytics/chart", async (req, res) => {
  try {
    const { period = "30days" } = req.query as Record<string, string>;
    const days = period === "7days" ? 7 : period === "90days" ? 90 : 30;

    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayResult = await db
        .select({
          revenue: sql<number>`COALESCE(SUM(CAST(total_price AS NUMERIC)), 0)`,
          orders: sql<number>`COUNT(*)`,
        })
        .from(ordersTable)
        .where(
          sql`created_at >= ${date.toISOString()} AND created_at < ${nextDate.toISOString()}`
        );

      data.push({
        date: date.toISOString().split("T")[0],
        revenue: Number(dayResult[0]?.revenue ?? 0),
        orders: Number(dayResult[0]?.orders ?? 0),
      });
    }

    res.json({ data });
  } catch (err) {
    req.log.error({ err }, "Error fetching chart data");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
