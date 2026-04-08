import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, addressesTable, ordersTable } from "@workspace/db/schema";
import { eq, desc, sql, isNull, isNotNull } from "drizzle-orm";

const router: IRouter = Router();

// ── GET /api/users — all users with order stats ───────────────────────────────
// Returns EVERYONE: registered users + unregistered order customers merged
router.get("/users", async (req, res) => {
  try {
    // 1. All formally registered users
    const registeredUsers = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));

    // 2. Order stats per telegramId
    const orderStatsByTgId = await db
      .select({
        telegramId: ordersTable.telegramId,
        orderCount: sql<number>`COUNT(*)::int`,
        totalSpent: sql<number>`COALESCE(SUM(${ordersTable.totalPrice}), 0)::float`,
        lastOrder: sql<string>`MAX(${ordersTable.createdAt})`,
      })
      .from(ordersTable)
      .where(isNotNull(ordersTable.telegramId))
      .groupBy(ordersTable.telegramId);

    const statsByTgId = new Map(orderStatsByTgId.map(s => [s.telegramId!, s]));
    const registeredTgIds = new Set(registeredUsers.map(u => u.telegramId).filter(Boolean));

    // 3. Customers from orders who are NOT in usersTable (guests or pre-fix users)
    const unregisteredCustomers = await db
      .select({
        telegramId: ordersTable.telegramId,
        customerName: ordersTable.customerName,
        customerPhone: ordersTable.customerPhone,
        createdAt: sql<string>`MIN(${ordersTable.createdAt})`,
        orderCount: sql<number>`COUNT(*)::int`,
        totalSpent: sql<number>`COALESCE(SUM(${ordersTable.totalPrice}), 0)::float`,
      })
      .from(ordersTable)
      .where(
        // Orders with telegramId not in users table
        sql`${ordersTable.telegramId} IS NOT NULL AND ${ordersTable.telegramId} NOT IN (SELECT telegram_id FROM users WHERE telegram_id IS NOT NULL)`
      )
      .groupBy(ordersTable.telegramId, ordersTable.customerName, ordersTable.customerPhone);

    // 4. Guest orders (no telegramId) — create synthetic entries
    const guestCustomers = await db
      .select({
        customerName: ordersTable.customerName,
        customerPhone: ordersTable.customerPhone,
        createdAt: sql<string>`MIN(${ordersTable.createdAt})`,
        orderCount: sql<number>`COUNT(*)::int`,
        totalSpent: sql<number>`COALESCE(SUM(${ordersTable.totalPrice}), 0)::float`,
      })
      .from(ordersTable)
      .where(isNull(ordersTable.telegramId))
      .groupBy(ordersTable.customerName, ordersTable.customerPhone);

    // 5. Merge into unified list
    const enrichedRegistered = registeredUsers.map(u => ({
      id:          u.id,
      telegramId:  u.telegramId,
      firstName:   u.firstName,
      lastName:    u.lastName,
      phone:       u.phone,
      avatar:      u.avatar,
      createdAt:   u.createdAt,
      isRegistered: true,
      orderCount:  u.telegramId ? (statsByTgId.get(u.telegramId)?.orderCount ?? 0) : 0,
      totalSpent:  u.telegramId ? (statsByTgId.get(u.telegramId)?.totalSpent ?? 0) : 0,
    }));

    const unregisteredEntries = unregisteredCustomers.map(c => {
      const nameParts = (c.customerName || "").trim().split(" ");
      return {
        id:          `order-${c.telegramId}`,
        telegramId:  c.telegramId,
        firstName:   nameParts[0] || c.customerName,
        lastName:    nameParts.slice(1).join(" ") || null,
        phone:       c.customerPhone,
        avatar:      null,
        createdAt:   new Date(c.createdAt),
        isRegistered: false,
        orderCount:  c.orderCount,
        totalSpent:  c.totalSpent,
      };
    });

    const guestEntries = guestCustomers.map((c, i) => {
      const nameParts = (c.customerName || "").trim().split(" ");
      return {
        id:          `guest-${c.customerPhone ?? i}`,
        telegramId:  null,
        firstName:   nameParts[0] || "Mehmon",
        lastName:    nameParts.slice(1).join(" ") || null,
        phone:       c.customerPhone,
        avatar:      null,
        createdAt:   new Date(c.createdAt),
        isRegistered: false,
        orderCount:  c.orderCount,
        totalSpent:  c.totalSpent,
      };
    });

    const all = [...enrichedRegistered, ...unregisteredEntries, ...guestEntries]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ users: all });
  } catch (err) {
    req.log.error({ err }, "Error fetching users");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /api/users/:telegramId/addresses ─────────────────────────────────────
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

// ── GET /api/users/me ─────────────────────────────────────────────────────────
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

// ── POST /api/users/me — create or update user ───────────────────────────────
router.post("/users/me", async (req, res) => {
  try {
    const { telegramId, firstName, lastName, phone, avatar } = req.body as Record<string, string>;
    if (!telegramId || !firstName) {
      return res.status(400).json({ error: "telegramId and firstName required" });
    }

    const updates: Record<string, unknown> = {
      telegramId,
      firstName: firstName.trim(),
      lastName:  lastName?.trim() || null,
      phone:     phone?.trim() || null,
      updatedAt: new Date(),
    };
    if (avatar !== undefined) updates.avatar = avatar || null;

    const existing = await db.select().from(usersTable).where(eq(usersTable.telegramId, telegramId));

    let user;
    if (existing.length > 0) {
      [user] = await db.update(usersTable).set(updates).where(eq(usersTable.telegramId, telegramId)).returning();
    } else {
      [user] = await db.insert(usersTable).values(updates as typeof usersTable.$inferInsert).returning();
    }

    res.json(user);
  } catch (err) {
    req.log.error({ err }, "Error saving user");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
