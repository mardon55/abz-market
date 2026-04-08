import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { reviewsTable, productsTable, storesTable } from "@workspace/db/schema";
import { eq, and, sql } from "drizzle-orm";

const router: IRouter = Router();

// GET /reviews?productId=&storeId=
router.get("/reviews", async (req, res) => {
  try {
    const { productId, storeId } = req.query as Record<string, string>;

    const conditions = [];
    if (productId) conditions.push(eq(reviewsTable.productId, productId));
    if (storeId)   conditions.push(eq(reviewsTable.storeId, storeId));

    const reviews = await db
      .select()
      .from(reviewsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sql`${reviewsTable.createdAt} DESC`);

    res.json({ reviews });
  } catch (err) {
    req.log.error({ err }, "Error fetching reviews");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /reviews/check?orderId=&productId=
router.get("/reviews/check", async (req, res) => {
  try {
    const { orderId, productId } = req.query as Record<string, string>;
    if (!orderId || !productId) return res.json({ exists: false });

    const [existing] = await db
      .select({ id: reviewsTable.id })
      .from(reviewsTable)
      .where(and(eq(reviewsTable.orderId, orderId), eq(reviewsTable.productId, productId)));

    res.json({ exists: !!existing, reviewId: existing?.id ?? null });
  } catch (err) {
    req.log.error({ err }, "Error checking review");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /reviews
router.post("/reviews", async (req, res) => {
  try {
    const { orderId, productId, storeId, telegramId, customerName, rating, comment, images } = req.body;

    if (!orderId || !productId || !customerName || !rating) {
      return res.status(400).json({ error: "orderId, productId, customerName, rating are required" });
    }

    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: "rating must be integer 1–5" });
    }

    // Check for duplicate
    const [existing] = await db
      .select({ id: reviewsTable.id })
      .from(reviewsTable)
      .where(and(eq(reviewsTable.orderId, orderId), eq(reviewsTable.productId, productId)));

    if (existing) {
      return res.status(409).json({ error: "Review already exists for this order item" });
    }

    const [newReview] = await db
      .insert(reviewsTable)
      .values({
        orderId,
        productId,
        storeId:      storeId      ?? null,
        telegramId:   telegramId   ?? null,
        customerName: String(customerName),
        rating:       ratingNum,
        comment:      comment      ?? null,
        images:       Array.isArray(images) ? images.slice(0, 6) : [],
      })
      .returning();

    // Update product avg rating
    const allProductReviews = await db
      .select({ rating: reviewsTable.rating })
      .from(reviewsTable)
      .where(eq(reviewsTable.productId, productId));

    const avgRating = allProductReviews.reduce((s, r) => s + r.rating, 0) / allProductReviews.length;

    await db
      .update(productsTable)
      .set({ rating: avgRating.toFixed(2), reviewCount: allProductReviews.length })
      .where(eq(productsTable.id, productId));

    // Update store avg rating
    if (storeId) {
      const storeReviews = await db
        .select({ rating: reviewsTable.rating })
        .from(reviewsTable)
        .where(eq(reviewsTable.storeId, storeId));

      const storeAvg = storeReviews.reduce((s, r) => s + r.rating, 0) / storeReviews.length;

      await db
        .update(storesTable)
        .set({ rating: storeAvg.toFixed(2), reviewCount: storeReviews.length })
        .where(eq(storesTable.id, storeId));
    }

    res.status(201).json(newReview);
  } catch (err) {
    req.log.error({ err }, "Error creating review");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
