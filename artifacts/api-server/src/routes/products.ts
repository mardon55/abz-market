import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable, storesTable } from "@workspace/db/schema";
import { eq, ilike, gte, lte, and, desc, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/products", async (req, res) => {
  try {
    const { categoryId, search, minPrice, maxPrice, color, storeId, featured, limit = "20", offset = "0" } = req.query as Record<string, string>;

    const conditions = [];
    if (categoryId) conditions.push(eq(productsTable.categoryId, categoryId));
    if (storeId) conditions.push(eq(productsTable.storeId, storeId));
    if (search) conditions.push(ilike(productsTable.name, `%${search}%`));
    if (minPrice) conditions.push(gte(productsTable.price, minPrice));
    if (maxPrice) conditions.push(lte(productsTable.price, maxPrice));
    if (featured === "true") conditions.push(eq(productsTable.isFeatured, true));

    const products = await db
      .select({
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
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .leftJoin(storesTable, eq(productsTable.storeId, storesTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(productsTable.salesCount))
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(productsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    res.json({ products, total: Number(total[0]?.count ?? 0) });
  } catch (err) {
    req.log.error({ err }, "Error fetching products");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [product] = await db
      .select({
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
      })
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
