import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

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
