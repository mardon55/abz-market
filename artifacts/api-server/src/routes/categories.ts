import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { categoriesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/categories", async (req, res) => {
  try {
    const categories = await db.select().from(categoriesTable);
    res.json({ categories });
  } catch (err) {
    req.log.error({ err }, "Error fetching categories");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/categories", async (req, res) => {
  try {
    const { name, icon } = req.body as { name: string; icon?: string };
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "name is required" });
    }
    const [cat] = await db
      .insert(categoriesTable)
      .values({ name: name.trim(), icon: icon ?? null })
      .returning();
    res.status(201).json(cat);
  } catch (err) {
    req.log.error({ err }, "Error creating category");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon } = req.body as { name?: string; icon?: string };
    const updates: Partial<{ name: string; icon: string }> = {};
    if (name) updates.name = name.trim();
    if (icon !== undefined) updates.icon = icon;

    const [updated] = await db
      .update(categoriesTable)
      .set(updates)
      .where(eq(categoriesTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Error updating category");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Error deleting category");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
