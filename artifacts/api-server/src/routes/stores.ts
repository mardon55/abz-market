import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { storesTable } from "@workspace/db/schema";
import { eq, ilike } from "drizzle-orm";
import { CreateStoreBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stores", async (req, res) => {
  try {
    const { search, type } = req.query as Record<string, string>;

    let query = db.select().from(storesTable).$dynamic();
    const conditions = [];
    if (search) conditions.push(ilike(storesTable.name, `%${search}%`));
    if (type) conditions.push(eq(storesTable.type, type));

    const stores = conditions.length > 0
      ? await query.where(conditions.length === 1 ? conditions[0] : conditions[0])
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
    const [store] = await db
      .select()
      .from(storesTable)
      .where(eq(storesTable.id, id));

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }
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
        type: "partner",
        isVerified: false,
      })
      .returning();

    res.status(201).json(newStore);
  } catch (err) {
    req.log.error({ err }, "Error creating store");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
