import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { flashSalesTable, productsTable } from "@workspace/db/schema";
import { eq, inArray } from "drizzle-orm";

const router: IRouter = Router();

// GET /flash-sales — active flash sales with products
router.get("/flash-sales", async (req, res) => {
  try {
    const { all } = req.query as Record<string, string>;
    let sales;
    if (all === "true") {
      sales = await db.select().from(flashSalesTable).orderBy(flashSalesTable.createdAt);
    } else {
      sales = await db.select().from(flashSalesTable)
        .where(eq(flashSalesTable.isActive, true));
      // Filter expired
      const now = new Date();
      sales = sales.filter((s) => new Date(s.endsAt) > now);
    }

    // Attach product details for each sale
    const enriched = await Promise.all(sales.map(async (sale) => {
      let products: any[] = [];
      if (sale.productIds && sale.productIds.length > 0) {
        products = await db.select().from(productsTable)
          .where(inArray(productsTable.id, sale.productIds));
      }
      return { ...sale, products };
    }));

    res.json({ flashSales: enriched });
  } catch (err) {
    req.log.error({ err }, "Error fetching flash sales");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /flash-sales/:id
router.get("/flash-sales/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [sale] = await db.select().from(flashSalesTable).where(eq(flashSalesTable.id, id));
    if (!sale) return res.status(404).json({ error: "Flash sale not found" });

    let products: any[] = [];
    if (sale.productIds && sale.productIds.length > 0) {
      products = await db.select().from(productsTable)
        .where(inArray(productsTable.id, sale.productIds));
    }

    res.json({ ...sale, products });
  } catch (err) {
    req.log.error({ err }, "Error fetching flash sale");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /flash-sales — admin create
router.post("/flash-sales", async (req, res) => {
  try {
    const { title, endsAt, isActive, productIds } = req.body;
    if (!title || !endsAt) return res.status(400).json({ error: "title and endsAt are required" });

    const [sale] = await db.insert(flashSalesTable).values({
      title,
      endsAt:     new Date(endsAt),
      isActive:   isActive  !== undefined ? Boolean(isActive)  : true,
      productIds: Array.isArray(productIds) ? productIds : [],
    }).returning();

    res.status(201).json(sale);
  } catch (err) {
    req.log.error({ err }, "Error creating flash sale");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /flash-sales/:id — admin update
router.put("/flash-sales/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, endsAt, isActive, productIds } = req.body;

    const updates: Record<string, any> = {};
    if (title      !== undefined) updates.title      = title;
    if (endsAt     !== undefined) updates.endsAt     = new Date(endsAt);
    if (isActive   !== undefined) updates.isActive   = Boolean(isActive);
    if (productIds !== undefined) updates.productIds = Array.isArray(productIds) ? productIds : [];

    const [sale] = await db.update(flashSalesTable).set(updates).where(eq(flashSalesTable.id, id)).returning();
    if (!sale) return res.status(404).json({ error: "Flash sale not found" });
    res.json(sale);
  } catch (err) {
    req.log.error({ err }, "Error updating flash sale");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /flash-sales/:id — admin delete
router.delete("/flash-sales/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(flashSalesTable).where(eq(flashSalesTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Error deleting flash sale");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
