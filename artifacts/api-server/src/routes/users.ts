import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, addressesTable, ordersTable } from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";

const router: IRouter = Router();

// GET /api/users — all users with order stats
router.get("/users", async (req, res) => {
  try {
    const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));

    // Get order stats per user (group by telegramId)
    const orderStats = await db
      .select({
        telegramId: ordersTable.telegramId,
        orderCount: sql<number>`COUNT(*)::int`,
        totalSpent: sql<number>`COALESCE(SUM(${ordersTable.totalPrice}), 0)::float`,
      })
      .from(ordersTable)
      .groupBy(ordersTable.telegramId);

    const statsMap = new Map(orderStats.map(s => [s.telegramId, s]));

    const enriched = users.map(u => ({
      ...u,
      orderCount: u.telegramId ? (statsMap.get(u.telegramId)?.orderCount ?? 0) : 0,
      totalSpent: u.telegramId ? (statsMap.get(u.telegramId)?.totalSpent ?? 0) : 0,
    }));

    res.json({ users: enriched });
  } catch (err) {
    req.log.error({ err }, "Error fetching users");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/users/:telegramId/addresses
router.get("/users/:telegramId/addresses", async (req, res) => {
  try {
    const { telegramId } = req.params;
    const addresses = await db
      .select()
      .from(addressesTable)
      .where(eq(addressesTable.telegramId, telegramId))
      .orderBy(desc(addressesTable.isDefault), desc(addressesTable.createdAt));
    res.json({ addresses });
  } catch (err) {
    req.log.error({ err }, "Error fetching user addresses");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/users/me
router.get("/users/me", async (req, res) => {
  try {
    const tgId = req.query["tgId"] as string;
    if (!tgId) return res.status(400).json({ error: "tgId required" });

    const [user] = await db.select().from(usersTable).where(eq(usersTable.telegramId, tgId));
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    req.log.error({ err }, "Error fetching user");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/users/me — create or update user
router.post("/users/me", async (req, res) => {
  try {
    const { telegramId, firstName, lastName, phone, avatar } = req.body as Record<string, string>;
    if (!telegramId || !firstName) {
      return res.status(400).json({ error: "telegramId and firstName required" });
    }

    const updates: Record<string, unknown> = {
      telegramId,
      firstName: firstName.trim(),
      lastName: lastName?.trim() || null,
      phone: phone?.trim() || null,
      updatedAt: new Date(),
    };
    if (avatar !== undefined) updates.avatar = avatar || null;

    const existing = await db.select().from(usersTable).where(eq(usersTable.telegramId, telegramId));

    let user;
    if (existing.length > 0) {
      [user] = await db
        .update(usersTable)
        .set(updates)
        .where(eq(usersTable.telegramId, telegramId))
        .returning();
    } else {
      [user] = await db
        .insert(usersTable)
        .values(updates as typeof usersTable.$inferInsert)
        .returning();
    }

    res.json(user);
  } catch (err) {
    req.log.error({ err }, "Error saving user");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
