import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { addressesTable } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/addresses", async (req, res) => {
  try {
    const telegramId = req.query["telegramId"] as string;
    if (!telegramId) return res.status(400).json({ error: "telegramId required" });

    const addresses = await db
      .select()
      .from(addressesTable)
      .where(eq(addressesTable.telegramId, telegramId))
      .orderBy(desc(addressesTable.isDefault), desc(addressesTable.createdAt));

    res.json({ addresses });
  } catch (err) {
    req.log.error({ err }, "Error fetching addresses");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/addresses", async (req, res) => {
  try {
    const { telegramId, label, address, city, region, isDefault } = req.body as Record<string, string | boolean>;
    if (!telegramId || !address) return res.status(400).json({ error: "telegramId and address required" });

    if (isDefault) {
      await db
        .update(addressesTable)
        .set({ isDefault: false })
        .where(eq(addressesTable.telegramId, telegramId as string));
    }

    const [newAddress] = await db
      .insert(addressesTable)
      .values({
        telegramId: telegramId as string,
        label: (label as string) || "Uy",
        address: address as string,
        city: (city as string) || null,
        region: (region as string) || null,
        isDefault: Boolean(isDefault),
      })
      .returning();

    res.json(newAddress);
  } catch (err) {
    req.log.error({ err }, "Error creating address");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/addresses/:id/default", async (req, res) => {
  try {
    const { id } = req.params;
    const { telegramId } = req.body as { telegramId: string };
    if (!telegramId) return res.status(400).json({ error: "telegramId required" });

    await db
      .update(addressesTable)
      .set({ isDefault: false })
      .where(eq(addressesTable.telegramId, telegramId));

    const [updated] = await db
      .update(addressesTable)
      .set({ isDefault: true })
      .where(and(eq(addressesTable.id, id), eq(addressesTable.telegramId, telegramId)))
      .returning();

    if (!updated) return res.status(404).json({ error: "Address not found" });
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Error setting default address");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/addresses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(addressesTable).where(eq(addressesTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Error deleting address");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
