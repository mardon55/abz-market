import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, addressesTable, ordersTable } from "@workspace/db/schema";
import { eq, desc, sql, isNull, isNotNull } from "drizzle-orm";

const router: IRouter = Router();

// ── GET /api/users — all users with order stats ───────────────────────────────
router.get("/users", async (req, res) => {
  try {
    // 1. usersTable dagi barcha foydalanuvchilar (bot orqali kelganlar)
    const registeredUsers = await db
      .select({
        id:        usersTable.id,
        telegramId: usersTable.telegramId,
        firstName: usersTable.firstName,
        lastName:  usersTable.lastName,
        phone:     usersTable.phone,
        avatar:    usersTable.avatar,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
      })
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt));

    // 2. Buyurtmalar statistikasi telegramId bo'yicha
    const orderStatsByTgId = await db
      .select({
        telegramId: ordersTable.telegramId,
        orderCount: sql<number>`COUNT(*)::int`,
        totalSpent: sql<number>`COALESCE(SUM(${ordersTable.totalPrice}), 0)::float`,
      })
      .from(ordersTable)
      .where(isNotNull(ordersTable.telegramId))
      .groupBy(ordersTable.telegramId);

    const statsByTgId = new Map(orderStatsByTgId.map(s => [s.telegramId!, s]));
    const registeredTgIds = new Set(registeredUsers.map(u => u.telegramId).filter(Boolean));

    // 3. Buyurtma bergan lekin usersTable da yo'q mehmonlar
    const unregisteredCustomers = await db
      .select({
        telegramId:    ordersTable.telegramId,
        customerName:  ordersTable.customerName,
        customerPhone: ordersTable.customerPhone,
        createdAt:     sql<string>`MIN(${ordersTable.createdAt})`,
        orderCount:    sql<number>`COUNT(*)::int`,
        totalSpent:    sql<number>`COALESCE(SUM(${ordersTable.totalPrice}), 0)::float`,
      })
      .from(ordersTable)
      .where(
        sql`${ordersTable.telegramId} IS NOT NULL AND ${ordersTable.telegramId} NOT IN (SELECT telegram_id FROM users WHERE telegram_id IS NOT NULL)`
      )
      .groupBy(ordersTable.telegramId, ordersTable.customerName, ordersTable.customerPhone);

    // 4. TelegramId yo'q mehmon buyurtmalar
    const guestCustomers = await db
      .select({
        customerName:  ordersTable.customerName,
        customerPhone: ordersTable.customerPhone,
        createdAt:     sql<string>`MIN(${ordersTable.createdAt})`,
        orderCount:    sql<number>`COUNT(*)::int`,
        totalSpent:    sql<number>`COALESCE(SUM(${ordersTable.totalPrice}), 0)::float`,
      })
      .from(ordersTable)
      .where(isNull(ordersTable.telegramId))
      .groupBy(ordersTable.customerName, ordersTable.customerPhone);

    // 5. Birlashtirish
    const enrichedRegistered = registeredUsers.map(u => ({
      id:          u.id,
      telegramId:  u.telegramId,
      firstName:   u.firstName,
      lastName:    u.lastName ?? null,
      phone:       u.phone ?? null,
      avatar:      u.avatar ?? null,
      createdAt:   u.createdAt,
      isRegistered: true,
      hasProfile:  !!(u.phone),
      orderCount:  u.telegramId ? (statsByTgId.get(u.telegramId)?.orderCount ?? 0) : 0,
      totalSpent:  u.telegramId ? (statsByTgId.get(u.telegramId)?.totalSpent ?? 0) : 0,
    }));

    const unregisteredEntries = unregisteredCustomers.map(c => {
      const nameParts = (c.customerName || "").trim().split(" ");
      return {
        id:          `order-${c.telegramId}`,
        telegramId:  c.telegramId,
        firstName:   nameParts[0] || c.customerName || "Mehmon",
        lastName:    nameParts.slice(1).join(" ") || null,
        phone:       c.customerPhone,
        avatar:      null,
        createdAt:   new Date(c.createdAt),
        isRegistered: false,
        hasProfile:  true,
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
        hasProfile:  false,
        orderCount:  c.orderCount,
        totalSpent:  c.totalSpent,
      };
    });

    const all = [...enrichedRegistered, ...unregisteredEntries, ...guestEntries]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      users: all,
      stats: {
        total:          all.length,
        botUsers:       registeredUsers.length,
        withPhone:      all.filter(u => u.phone).length,
        withOrders:     all.filter(u => u.orderCount > 0).length,
      }
    });
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

    const [user] = await db
      .select({
        id:        usersTable.id,
        telegramId: usersTable.telegramId,
        firstName: usersTable.firstName,
        lastName:  usersTable.lastName,
        phone:     usersTable.phone,
        avatar:    usersTable.avatar,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
      })
      .from(usersTable)
      .where(eq(usersTable.telegramId, tgId));

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

    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.telegramId, telegramId));

    let user;
    if (existing.length > 0) {
      // Faqat kelgan maydonlarni yangilash — phone/avatar yo'q bo'lsa O'CHIRMAYDI
      const updates: Record<string, unknown> = {
        firstName: firstName.trim(),
        lastName:  lastName?.trim() || null,
        updatedAt: new Date(),
      };
      if (phone !== undefined && phone !== null && phone.trim() !== "") {
        updates.phone = phone.trim();
      }
      if (avatar !== undefined) {
        updates.avatar = avatar || null;
      }
      [user] = await db
        .update(usersTable)
        .set(updates)
        .where(eq(usersTable.telegramId, telegramId))
        .returning();
    } else {
      // Yangi foydalanuvchi — barcha ma'lumotlar bilan kiritiladi
      const values: Record<string, unknown> = {
        telegramId,
        firstName: firstName.trim(),
        lastName:  lastName?.trim() || null,
      };
      if (phone?.trim()) values.phone = phone.trim();
      if (avatar)        values.avatar = avatar;
      [user] = await db
        .insert(usersTable)
        .values(values as typeof usersTable.$inferInsert)
        .returning();
    }

    const safeUser = {
      id:        user.id,
      telegramId: user.telegramId,
      firstName: user.firstName,
      lastName:  user.lastName,
      phone:     user.phone,
      avatar:    user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    res.json(safeUser);
  } catch (err) {
    req.log.error({ err }, "Error saving user");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
