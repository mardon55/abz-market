import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { bannersTable } from "@workspace/db/schema";
import { eq, asc } from "drizzle-orm";

const router: IRouter = Router();

// GET /banners — public, returns active banners sorted
router.get("/banners", async (req, res) => {
  try {
    const { all } = req.query as Record<string, string>;
    let banners;
    if (all === "true") {
      banners = await db.select().from(bannersTable).orderBy(asc(bannersTable.sortOrder));
    } else {
      banners = await db.select().from(bannersTable)
        .where(eq(bannersTable.isActive, true))
        .orderBy(asc(bannersTable.sortOrder));
    }
    res.json({ banners });
  } catch (err) {
    req.log.error({ err }, "Error fetching banners");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /banners — admin create
router.post("/banners", async (req, res) => {
  try {
    const { title, subtitle, badge, image, gradient, link, categoryId, storeId, productId, isActive, sortOrder } = req.body;
    if (!title) return res.status(400).json({ error: "title is required" });

    const [banner] = await db.insert(bannersTable).values({
      title,
      subtitle:   subtitle   ?? null,
      badge:      badge      ?? null,
      image:      image      ?? null,
      gradient:   gradient   ?? "from-violet-600 via-purple-600 to-fuchsia-500",
      link:       link       ?? "/catalog",
      categoryId: categoryId ?? null,
      storeId:    storeId    ?? null,
      productId:  productId  ?? null,
      isActive:   isActive   !== undefined ? Boolean(isActive)  : true,
      sortOrder:  sortOrder  !== undefined ? Number(sortOrder)  : 0,
    }).returning();

    res.status(201).json(banner);
  } catch (err) {
    req.log.error({ err }, "Error creating banner");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /banners/:id — admin update
router.put("/banners/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, badge, image, gradient, link, categoryId, storeId, productId, isActive, sortOrder } = req.body;

    const updates: Record<string, any> = {};
    if (title      !== undefined) updates.title      = title;
    if (subtitle   !== undefined) updates.subtitle   = subtitle;
    if (badge      !== undefined) updates.badge      = badge;
    if (image      !== undefined) updates.image      = image;
    if (gradient   !== undefined) updates.gradient   = gradient;
    if (link       !== undefined) updates.link       = link;
    if (categoryId !== undefined) updates.categoryId = categoryId || null;
    if (storeId    !== undefined) updates.storeId    = storeId    || null;
    if (productId  !== undefined) updates.productId  = productId  || null;
    if (isActive   !== undefined) updates.isActive   = Boolean(isActive);
    if (sortOrder  !== undefined) updates.sortOrder  = Number(sortOrder);

    const [banner] = await db.update(bannersTable).set(updates).where(eq(bannersTable.id, id)).returning();
    if (!banner) return res.status(404).json({ error: "Banner not found" });
    res.json(banner);
  } catch (err) {
    req.log.error({ err }, "Error updating banner");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /banners/:id — admin delete
router.delete("/banners/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(bannersTable).where(eq(bannersTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Error deleting banner");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
