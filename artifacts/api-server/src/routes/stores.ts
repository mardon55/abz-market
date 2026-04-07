import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { storesTable } from "@workspace/db/schema";
import { eq, ilike, or } from "drizzle-orm";
import { CreateStoreBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stores", async (req, res) => {
  try {
    const { search, type } = req.query as Record<string, string>;

    const conditions = [];
    if (search) conditions.push(ilike(storesTable.name, `%${search}%`));
    if (type) conditions.push(eq(storesTable.type, type));

    const stores = conditions.length > 0
      ? await db.select().from(storesTable).where(conditions.length === 1 ? conditions[0] : or(...conditions))
      : await db.select().from(storesTable);

    res.json({ stores });
  } catch (err) {
    req.log.error({ err }, "Error fetching stores");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stores/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [store] = await db.select().from(storesTable).where(eq(storesTable.id, id));
    if (!store) return res.status(404).json({ error: "Store not found" });
    res.json(store);
  } catch (err) {
    req.log.error({ err }, "Error fetching store");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/stores", async (req, res) => {
  try {
    const body = CreateStoreBody.parse(req.body);

    const [newStore] = await db
      .insert(storesTable)
      .values({
        name: body.name,
        activityType: body.activityType,
        location: body.location,
        phone: body.phone,
        description: body.description,
        stir: body.stir,
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
    const { action, name, phone, location, description, activityType, logo, coverImage } = req.body as Record<string, string>;

    let updates: Record<string, unknown> = {};

    if (action === "approve") {
      updates = { type: "partner", isVerified: true };
    } else if (action === "reject") {
      updates = { type: "rejected", isVerified: false };
    } else {
      // General update
      if (name)         updates.name = name;
      if (phone)        updates.phone = phone;
      if (location)     updates.location = location;
      if (description)  updates.description = description;
      if (activityType) updates.activityType = activityType;
      if (logo !== undefined)        updates.logo = logo || null;
      if (coverImage !== undefined)  updates.coverImage = coverImage || null;
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
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Error updating store");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/stores/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(storesTable).where(eq(storesTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Error deleting store");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
