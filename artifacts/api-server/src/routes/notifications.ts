import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db/schema";
import { eq, or, isNull, and, desc } from "drizzle-orm";

const router: IRouter = Router();

// Helper: create a notification (used internally too)
export async function createNotification(opts: {
  telegramId?: string | null;
  type: string;
  title: string;
  body: string;
  meta?: Record<string, unknown>;
}) {
  await db.insert(notificationsTable).values({
    telegramId: opts.telegramId ?? null,
    type: opts.type,
    title: opts.title,
    body: opts.body,
    meta: opts.meta ? JSON.stringify(opts.meta) : null,
  });
}

// GET /api/notifications?telegramId=xxx
// Returns personal notifications + broadcasts (telegramId IS NULL)
router.get("/notifications", async (req, res) => {
  try {
    const { telegramId } = req.query as Record<string, string>;
    if (!telegramId) return res.status(400).json({ error: "telegramId required" });

    const rows = await db
      .select()
      .from(notificationsTable)
      .where(
        or(
          eq(notificationsTable.telegramId, telegramId),
          isNull(notificationsTable.telegramId)
        )
      )
      .orderBy(desc(notificationsTable.createdAt));

    res.json({ notifications: rows });
  } catch (err) {
    req.log.error({ err }, "Error fetching notifications");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/notifications  — admin broadcast or targeted
router.post("/notifications", async (req, res) => {
  try {
    const { telegramId, type, title, body, meta } = req.body as Record<string, string>;
    if (!type || !title || !body) return res.status(400).json({ error: "type, title, body required" });

    const [row] = await db
      .insert(notificationsTable)
      .values({
        telegramId: telegramId ?? null,
        type: type ?? "announcement",
        title,
        body,
        meta: meta ?? null,
      })
      .returning();

    res.status(201).json(row);
  } catch (err) {
    req.log.error({ err }, "Error creating notification");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/notifications/:id/read
router.patch("/notifications/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    const [row] = await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.id, id))
      .returning();
    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Error marking notification as read");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/notifications/read-all?telegramId=xxx
router.patch("/notifications/read-all", async (req, res) => {
  try {
    const { telegramId } = req.query as Record<string, string>;
    if (!telegramId) return res.status(400).json({ error: "telegramId required" });

    await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(
        and(
          or(
            eq(notificationsTable.telegramId, telegramId),
            isNull(notificationsTable.telegramId)
          ),
          eq(notificationsTable.isRead, false)
        )
      );

    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Error marking all as read");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/notifications/:id
router.delete("/notifications/:id", async (req, res) => {
  try {
    await db.delete(notificationsTable).where(eq(notificationsTable.id, req.params.id));
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Error deleting notification");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
