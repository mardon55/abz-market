import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable, storesTable } from "@workspace/db/schema";
import { eq, ilike, gte, lte, and, or, desc, sql, inArray, count } from "drizzle-orm";

const router: IRouter = Router();

// ── Helper: sync real product count to stores table ──────────────────────────
async function syncProductCount(storeId: string): Promise<void> {
  try {
    const [{ total }] = await db
      .select({ total: count() })
      .from(productsTable)
      .where(eq(productsTable.storeId, storeId));
    await db
      .update(storesTable)
      .set({ productCount: Number(total) })
      .where(eq(storesTable.id, storeId));
  } catch { /* silent — not critical */ }
}

const PRODUCT_SELECT = {
  id: productsTable.id,
  name: productsTable.name,
  price: productsTable.price,
  oldPrice: productsTable.oldPrice,
  description: productsTable.description,
  images: productsTable.images,
  categoryId: productsTable.categoryId,
  categoryName: categoriesTable.name,
  storeId: productsTable.storeId,
  storeName: storesTable.name,
  rating: productsTable.rating,
  reviewCount: productsTable.reviewCount,
  colors: productsTable.colors,
  sizes: productsTable.sizes,
  dimensions: productsTable.dimensions,
  warranty: productsTable.warranty,
  deliveryDays: productsTable.deliveryDays,
  isTopSelling: productsTable.isTopSelling,
  isFeatured: productsTable.isFeatured,
  discount: productsTable.discount,
  salesCount: productsTable.salesCount,
  status: productsTable.status,
  rejectionReason: productsTable.rejectionReason,
  quantity: productsTable.quantity,
  createdAt: productsTable.createdAt,
};

router.get("/products", async (req, res) => {
  try {
    const {
      categoryId, search, minPrice, maxPrice, storeId, featured,
      status, limit = "500", offset = "0", newOnly, sortBy,
    } = req.query as Record<string, string>;

    const conditions = [];

    // Status filtering: default = approved only (for mini app customers)
    if (status === "all") {
      // no filter
    } else if (status === "pending") {
      conditions.push(eq(productsTable.status, "pending"));
    } else if (status === "rejected") {
      conditions.push(eq(productsTable.status, "rejected"));
    } else {
      conditions.push(eq(productsTable.status, "approved"));
    }

    // New arrivals: last 24 hours
    if (newOnly === "true") {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      conditions.push(gte(productsTable.createdAt, since));
    }

    if (categoryId) {
      const catRow = await db
        .select({ parentId: categoriesTable.parentId })
        .from(categoriesTable)
        .where(eq(categoriesTable.id, categoryId))
        .limit(1);

      if (catRow.length > 0 && catRow[0].parentId === null) {
        const subs = await db
          .select({ id: categoriesTable.id })
          .from(categoriesTable)
          .where(eq(categoriesTable.parentId, categoryId));
        const allIds = [categoryId, ...subs.map((s) => s.id)];
        conditions.push(inArray(productsTable.categoryId, allIds));
      } else {
        conditions.push(eq(productsTable.categoryId, categoryId));
      }
    }
    if (storeId) conditions.push(eq(productsTable.storeId, storeId));
    if (search) {
      // Kategoriya nomida ham qidiramiz (parent va sub)
      const matchingCats = await db
        .select({ id: categoriesTable.id, parentId: categoriesTable.parentId })
        .from(categoriesTable)
        .where(ilike(categoriesTable.name, `%${search}%`));

      // Topilgan kategoriyalar va ularning sub-kategoriyalari
      const parentIds = matchingCats.filter(c => c.parentId === null).map(c => c.id);
      let catIds = matchingCats.map(c => c.id);

      if (parentIds.length > 0) {
        const subCats = await db
          .select({ id: categoriesTable.id })
          .from(categoriesTable)
          .where(inArray(categoriesTable.parentId, parentIds));
        catIds = [...new Set([...catIds, ...subCats.map(s => s.id)])];
      }

      if (catIds.length > 0) {
        conditions.push(
          or(
            ilike(productsTable.name, `%${search}%`),
            inArray(productsTable.categoryId, catIds)
          )!
        );
      } else {
        conditions.push(ilike(productsTable.name, `%${search}%`));
      }
    }
    if (minPrice) conditions.push(gte(productsTable.price, minPrice));
    if (maxPrice) conditions.push(lte(productsTable.price, maxPrice));
    if (featured === "true") conditions.push(eq(productsTable.isFeatured, true));
    if (req.query["isTopSelling"] === "true") conditions.push(eq(productsTable.isTopSelling, true));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // Sorting
    const order = sortBy === "createdAt"
      ? desc(productsTable.createdAt)
      : desc(productsTable.salesCount);

    const products = await db
      .select(PRODUCT_SELECT)
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .leftJoin(storesTable, eq(productsTable.storeId, storesTable.id))
      .where(where)
      .orderBy(order)
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(productsTable)
      .where(where);

    res.json({ products, total: Number(total[0]?.count ?? 0) });
  } catch (err) {
    req.log.error({ err }, "Error fetching products");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/products", async (req, res) => {
  try {
    const {
      name, price, oldPrice, description, images, categoryId, storeId,
      isFeatured, isTopSelling, discount, colors, sizes, dimensions, warranty,
      deliveryDays, quantity, status,
    } = req.body as Record<string, unknown>;

    if (!name || !price || !storeId) {
      return res.status(400).json({ error: "name, price and storeId are required" });
    }

    // Barcha seller mahsulotlari admin tasdiqini kutadi (pending)
    const productStatus = "pending";

    const [product] = await db
      .insert(productsTable)
      .values({
        name: String(name),
        price: String(price),
        oldPrice: oldPrice ? String(oldPrice) : null,
        description: description ? String(description) : null,
        images: Array.isArray(images) ? (images as string[]) : [],
        categoryId: categoryId ? String(categoryId) : null,
        storeId: String(storeId),
        isFeatured: productStatus === "approved" ? isFeatured !== false : false,
        isTopSelling: isTopSelling === true,
        discount: discount ? Number(discount) : null,
        colors: Array.isArray(colors) ? (colors as string[]) : null,
        sizes:  Array.isArray(sizes)  ? (sizes  as string[]) : null,
        dimensions: dimensions ? String(dimensions) : null,
        warranty: warranty ? String(warranty) : null,
        deliveryDays: deliveryDays ? Number(deliveryDays) : 3,
        quantity: quantity ? Number(quantity) : 1,
        status: productStatus,
      })
      .returning({ id: productsTable.id });

    const [full] = await db
      .select(PRODUCT_SELECT)
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .leftJoin(storesTable, eq(productsTable.storeId, storesTable.id))
      .where(eq(productsTable.id, product.id));

    res.status(201).json(full);
    // Sync store product count in background
    syncProductCount(String(storeId));
  } catch (err) {
    req.log.error({ err }, "Error creating product");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, price, oldPrice, description, images, categoryId, storeId,
      isFeatured, isTopSelling, discount, colors, sizes, dimensions, warranty,
      deliveryDays, quantity, action,
    } = req.body as Record<string, unknown>;

    const updates: Record<string, unknown> = {};

    // helper to apply all regular product field updates
    const applyFields = () => {
      if (name !== undefined)         updates.name = String(name);
      if (price !== undefined)        updates.price = String(price);
      if (oldPrice !== undefined)     updates.oldPrice = oldPrice ? String(oldPrice) : null;
      if (description !== undefined)  updates.description = description ? String(description) : null;
      if (images !== undefined)       updates.images = Array.isArray(images) ? images : [];
      if (categoryId !== undefined)   updates.categoryId = categoryId ? String(categoryId) : null;
      if (storeId !== undefined)      updates.storeId = String(storeId);
      if (isFeatured !== undefined)   updates.isFeatured = Boolean(isFeatured);
      if (isTopSelling !== undefined) updates.isTopSelling = Boolean(isTopSelling);
      if (discount !== undefined)     updates.discount = discount ? Number(discount) : null;
      if (colors !== undefined)       updates.colors = Array.isArray(colors) ? colors : null;
      if (sizes !== undefined)        updates.sizes  = Array.isArray(sizes)  ? sizes  : null;
      if (dimensions !== undefined)   updates.dimensions = dimensions ? String(dimensions) : null;
      if (warranty !== undefined)     updates.warranty = warranty ? String(warranty) : null;
      if (deliveryDays !== undefined) updates.deliveryDays = deliveryDays ? Number(deliveryDays) : 3;
      if (quantity !== undefined)     updates.quantity = quantity ? Number(quantity) : 1;
    };

    if (action === "approve") {
      updates.status = "approved";
      updates.rejectionReason = null;
    } else if (action === "reject") {
      updates.status = "rejected";
      if (req.body.rejectionReason) updates.rejectionReason = String(req.body.rejectionReason);
    } else if (action === "resubmit") {
      // Seller edited a rejected product and resubmits for review
      updates.status = "pending";
      updates.rejectionReason = null;
      applyFields();
    } else {
      applyFields();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No updates provided" });
    }

    const [updated] = await db
      .update(productsTable)
      .set(updates as Partial<typeof productsTable.$inferInsert>)
      .where(eq(productsTable.id, id))
      .returning({ id: productsTable.id });

    if (!updated) return res.status(404).json({ error: "Product not found" });

    const [full] = await db
      .select(PRODUCT_SELECT)
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .leftJoin(storesTable, eq(productsTable.storeId, storesTable.id))
      .where(eq(productsTable.id, updated.id));

    res.json(full);
    // Sync store product count if storeId is known
    if (full?.storeId) syncProductCount(full.storeId);
  } catch (err) {
    req.log.error({ err }, "Error updating product");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/products/:id/rate — customer rates a product (1-5)
router.post("/products/:id/rate", async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body as { rating: number };
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be 1–5" });
    }
    const [product] = await db
      .select({ rating: productsTable.rating, reviewCount: productsTable.reviewCount })
      .from(productsTable)
      .where(eq(productsTable.id, id));

    if (!product) return res.status(404).json({ error: "Product not found" });

    const oldCount  = product.reviewCount ?? 0;
    const oldRating = parseFloat(String(product.rating ?? "0"));
    const newCount  = oldCount + 1;
    const newRating = ((oldRating * oldCount) + rating) / newCount;

    await db
      .update(productsTable)
      .set({ rating: String(newRating.toFixed(2)), reviewCount: newCount })
      .where(eq(productsTable.id, id));

    res.json({ rating: newRating.toFixed(2), reviewCount: newCount });
  } catch (err) {
    req.log.error({ err }, "Error rating product");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Get storeId before deleting (for productCount sync)
    const [toDelete] = await db
      .select({ storeId: productsTable.storeId })
      .from(productsTable)
      .where(eq(productsTable.id, id));
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.status(204).end();
    // Sync store product count
    if (toDelete?.storeId) syncProductCount(toDelete.storeId);
  } catch (err) {
    req.log.error({ err }, "Error deleting product");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [product] = await db
      .select(PRODUCT_SELECT)
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .leftJoin(storesTable, eq(productsTable.storeId, storesTable.id))
      .where(eq(productsTable.id, id));

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    req.log.error({ err }, "Error fetching product");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
