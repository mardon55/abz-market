import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable, storesTable } from "@workspace/db/schema";
import { eq, ilike, gte, lte, and, desc, sql, inArray } from "drizzle-orm";

const router: IRouter = Router();

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
      status, limit = "20", offset = "0",
    } = req.query as Record<string, string>;

    const conditions = [];

    // Status filtering: default = approved only (for mini app customers)
    // admin can pass status=pending, status=rejected, status=all
    if (status === "all") {
      // no status filter — show everything
    } else if (status === "pending") {
      conditions.push(eq(productsTable.status, "pending"));
    } else if (status === "rejected") {
      conditions.push(eq(productsTable.status, "rejected"));
    } else {
      conditions.push(eq(productsTable.status, "approved"));
    }

    if (categoryId) {
      // Check if this is a parent category — if so, include all subcategory products too
      const catRow = await db
        .select({ parentId: categoriesTable.parentId })
        .from(categoriesTable)
        .where(eq(categoriesTable.id, categoryId))
        .limit(1);

      if (catRow.length > 0 && catRow[0].parentId === null) {
        // It's a parent: get all child IDs
        const subs = await db
          .select({ id: categoriesTable.id })
          .from(categoriesTable)
          .where(eq(categoriesTable.parentId, categoryId));

        const allIds = [categoryId, ...subs.map((s) => s.id)];
        conditions.push(inArray(productsTable.categoryId, allIds));
      } else {
        // It's a subcategory or unknown: filter directly
        conditions.push(eq(productsTable.categoryId, categoryId));
      }
    }
    if (storeId) conditions.push(eq(productsTable.storeId, storeId));
    if (search) conditions.push(ilike(productsTable.name, `%${search}%`));
    if (minPrice) conditions.push(gte(productsTable.price, minPrice));
    if (maxPrice) conditions.push(lte(productsTable.price, maxPrice));
    if (featured === "true") conditions.push(eq(productsTable.isFeatured, true));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const products = await db
      .select(PRODUCT_SELECT)
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .leftJoin(storesTable, eq(productsTable.storeId, storesTable.id))
      .where(where)
      .orderBy(desc(productsTable.salesCount))
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

    // Sellers submit with status='pending'; admin-added products default to 'approved'
    const productStatus = status === "pending" ? "pending" : "approved";

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
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.status(204).end();
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
