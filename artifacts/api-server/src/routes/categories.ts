import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { categoriesTable } from "@workspace/db/schema";
import { eq, isNull, asc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/categories", async (req, res) => {
  try {
    const all = await db
      .select()
      .from(categoriesTable)
      .orderBy(asc(categoriesTable.sortOrder), asc(categoriesTable.name));

    const parents = all.filter((c) => !c.parentId);
    const children = all.filter((c) => !!c.parentId);

    const nested = parents.map((p) => ({
      ...p,
      subcategories: children.filter((c) => c.parentId === p.id),
    }));

    res.json({ categories: nested, flat: all });
  } catch (err) {
    req.log.error({ err }, "Error fetching categories");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/categories", async (req, res) => {
  try {
    const { name, icon, parentId, sortOrder } = req.body as {
      name: string;
      icon?: string;
      parentId?: string | null;
      sortOrder?: number;
    };
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "name is required" });
    }

    if (parentId) {
      const parent = await db
        .select()
        .from(categoriesTable)
        .where(eq(categoriesTable.id, parentId))
        .limit(1);
      if (!parent.length) {
        return res.status(400).json({ error: "Parent category not found" });
      }
      if (parent[0].parentId) {
        return res.status(400).json({ error: "Cannot nest more than 2 levels" });
      }
    }

    const [cat] = await db
      .insert(categoriesTable)
      .values({
        name: name.trim(),
        icon: icon ?? null,
        parentId: parentId ?? null,
        sortOrder: sortOrder ?? 0,
      })
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
    const { name, icon, sortOrder } = req.body as {
      name?: string;
      icon?: string;
      sortOrder?: number;
    };
    const updates: Partial<{ name: string; icon: string; sortOrder: number }> = {};
    if (name) updates.name = name.trim();
    if (icon !== undefined) updates.icon = icon;
    if (sortOrder !== undefined) updates.sortOrder = sortOrder;

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
    await db
      .delete(categoriesTable)
      .where(eq(categoriesTable.parentId, id));
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Error deleting category");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
