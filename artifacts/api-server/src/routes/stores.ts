import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  storesTable, productsTable, ordersTable, orderItemsTable,
  reviewsTable, notificationsTable,
} from "@workspace/db/schema";
import { eq, ilike, and, inArray, like } from "drizzle-orm";
import { CreateStoreBody } from "@workspace/api-zod";
import { createNotification } from "./notifications";

const router: IRouter = Router();

router.get("/stores", async (req, res) => {
  try {
    const { search, type, telegramId, admin } = req.query as Record<string, string>;
    const isAdmin = admin === "1";

    const conditions = [];
    if (search) conditions.push(ilike(storesTable.name, `%${search}%`));
    if (type) conditions.push(eq(storesTable.type, type));
    if (telegramId) conditions.push(eq(storesTable.ownerTelegramId, telegramId));

    const stores = conditions.length > 0
      ? await db.select().from(storesTable).where(conditions.length === 1 ? conditions[0] : and(...conditions))
      : await db.select().from(storesTable);

    // Oddiy foydalanuvchilardan maxfiy maydonlarni yashirish
    const safeStores = isAdmin
      ? stores
      : stores.map(({ phone: _p, location: _l, ownerTelegramId: _t, stir: _s, ...rest }) => rest);

    res.json({ stores: safeStores });
  } catch (err) {
    req.log.error({ err }, "Error fetching stores");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stores/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.query.admin === "1";

    const [store] = await db.select().from(storesTable).where(eq(storesTable.id, id));
    if (!store) return res.status(404).json({ error: "Store not found" });

    if (isAdmin) {
      res.json(store);
    } else {
      const { phone: _p, location: _l, ownerTelegramId: _t, stir: _s, ...safeStore } = store;
      res.json(safeStore);
    }
  } catch (err) {
    req.log.error({ err }, "Error fetching store");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/stores", async (req, res) => {
  try {
    const body = CreateStoreBody.parse(req.body);
    const ownerTelegramId = (req.body as Record<string, string>).ownerTelegramId ?? null;

    // Bitta akkaunt - bitta do'kon tekshiruvi
    if (ownerTelegramId) {
      const existing = await db
        .select()
        .from(storesTable)
        .where(eq(storesTable.ownerTelegramId, ownerTelegramId));
      const activeStore = existing.find((s) => s.type !== "rejected");
      if (activeStore) {
        return res.status(409).json({
          error: "Bu Telegram akkauntida allaqachon do'kon mavjud",
          storeId: activeStore.id,
          storeName: activeStore.name,
        });
      }
    }

    const [newStore] = await db
      .insert(storesTable)
      .values({
        name: body.name,
        activityType: body.activityType,
        location: body.location,
        phone: body.phone,
        description: body.description,
        stir: body.stir,
        ownerTelegramId,
        type: "pending",
        isVerified: false,
      })
      .returning();

    res.status(201).json(newStore);
  } catch (err) {
    req.log.error({ err }, "Error creating store");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/stores/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body as Record<string, unknown>;
    const { action, name, phone, location, description, activityType, logo, coverImage } = body as Record<string, string>;

    let updates: Record<string, unknown> = {};

    if (action === "approve") {
      updates = { type: "partner", isVerified: true };
    } else if (action === "reject") {
      updates = { type: "rejected", isVerified: false };
    } else if (action === "open") {
      updates = { type: "partner", isVerified: true };
    } else {
      // General update
      if (name)         updates.name = name;
      if (phone)        updates.phone = phone;
      if (location)     updates.location = location;
      if (description)  updates.description = description;
      if (activityType) updates.activityType = activityType;
      if (logo !== undefined)        updates.logo = logo || null;
      if (coverImage !== undefined)  updates.coverImage = coverImage || null;
      if ("ownerTelegramId" in body) updates.ownerTelegramId = body.ownerTelegramId as string | null;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No updates provided" });
    }

    const [updated] = await db
      .update(storesTable)
      .set(updates as Partial<typeof storesTable.$inferInsert>)
      .where(eq(storesTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Store not found" });

    // Send notification to store owner
    if (updated.ownerTelegramId) {
      if (action === "approve" || action === "open") {
        await createNotification({
          telegramId: updated.ownerTelegramId,
          type: "store_approved",
          title: "Do'koningiz tasdiqlandi! 🎉",
          body: `"${updated.name}" do'koni muvaffaqiyatli ochildi! Tabriklaymiz — siz endi 2 oy bepul foydalanishingiz mumkin. Mahsulotlaringizni qo'shishni boshlang! 🚀`,
          meta: { storeId: updated.id, storeName: updated.name },
        }).catch(() => {});
      } else if (action === "reject") {
        await createNotification({
          telegramId: updated.ownerTelegramId,
          type: "store_rejected",
          title: "Do'kon arizasi rad etildi ❌",
          body: `"${updated.name}" do'koni arizangiz ko'rib chiqildi, afsuski rad etildi. Batafsil ma'lumot uchun admin bilan bog'laning.`,
          meta: { storeId: updated.id, storeName: updated.name },
        }).catch(() => {});
      }
    }

    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Error updating store");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/stores/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Get all product IDs belonging to this store
    const storeProducts = await db
      .select({ id: productsTable.id })
      .from(productsTable)
      .where(eq(productsTable.storeId, id));
    const productIds = storeProducts.map(p => p.id);

    // 2. Get all order IDs for this store
    const storeOrders = await db
      .select({ id: ordersTable.id })
      .from(ordersTable)
      .where(eq(ordersTable.storeId, id));
    const orderIds = storeOrders.map(o => o.id);

    // 3. Delete order items (references orders and products)
    if (orderIds.length > 0) {
      await db.delete(orderItemsTable).where(inArray(orderItemsTable.orderId, orderIds));
    }

    // 4. Delete reviews referencing this store or its products
    await db.delete(reviewsTable).where(eq(reviewsTable.storeId, id));
    if (productIds.length > 0) {
      await db.delete(reviewsTable).where(inArray(reviewsTable.productId, productIds));
    }

    // 5. Delete orders for this store
    if (orderIds.length > 0) {
      await db.delete(ordersTable).where(eq(ordersTable.storeId, id));
    }

    // 6. Delete products
    if (productIds.length > 0) {
      await db.delete(productsTable).where(eq(productsTable.storeId, id));
    }

    // 7. Delete notifications referencing this store
    await db.delete(notificationsTable).where(like(notificationsTable.meta, `%"storeId":"${id}"%`));

    // 8. Finally delete the store itself
    await db.delete(storesTable).where(eq(storesTable.id, id));

    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Error deleting store");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
