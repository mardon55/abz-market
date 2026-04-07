import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable, storesTable } from "@workspace/db/schema";
import { eq, ilike, gte, lte, and, desc, sql } from "drizzle-orm";

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

    if (categoryId) conditions.push(eq(productsTable.categoryId, categoryId));
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
      isFeatured, isTopSelling, discount, colors, dimensions, warranty,
      deliveryDays, status,
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
        dimensions: dimensions ? String(dimensions) : null,
        warranty: warranty ? String(warranty) : null,
        deliveryDays: deliveryDays ? Number(deliveryDays) : 3,
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
      isFeatured, isTopSelling, discount, colors, dimensions, warranty,
      deliveryDays, action,
    } = req.body as Record<string, unknown>;

    const updates: Record<string, unknown> = {};

    if (action === "approve") {
      updates.status = "approved";
    } else if (action === "reject") {
      updates.status = "rejected";
    } else {
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
      if (dimensions !== undefined)   updates.dimensions = dimensions ? String(dimensions) : null;
      if (warranty !== undefined)     updates.warranty = warranty ? String(warranty) : null;
      if (deliveryDays !== undefined) updates.deliveryDays = deliveryDays ? Number(deliveryDays) : 3;
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
