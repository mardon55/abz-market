import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { pickupPointsTable, deliveryZonesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// ── Pickup Points ─────────────────────────────────────────────────────────────

router.get("/pickup-points", async (req, res) => {
  try {
    const { activeOnly } = req.query as Record<string, string>;
    let points = await db.select().from(pickupPointsTable).orderBy(pickupPointsTable.createdAt);
    if (activeOnly === "true") points = points.filter(p => p.isActive);
    res.json({ points });
  } catch (err) {
    req.log.error({ err }, "Error fetching pickup points");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/pickup-points", async (req, res) => {
  try {
    const { name, address, city, phone, workingHours } = req.body as Record<string, string>;
    if (!name || !address || !city) return res.status(400).json({ error: "name, address, city required" });
    const [point] = await db.insert(pickupPointsTable).values({
      name, address, city, phone: phone || null, workingHours: workingHours || null, isActive: true,
    }).returning();
    res.status(201).json(point);
  } catch (err) {
    req.log.error({ err }, "Error creating pickup point");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/pickup-points/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body as Record<string, any>;
    const updates: Record<string, any> = {};
    if ("name" in body) updates.name = body.name;
    if ("address" in body) updates.address = body.address;
    if ("city" in body) updates.city = body.city;
    if ("phone" in body) updates.phone = body.phone || null;
    if ("workingHours" in body) updates.workingHours = body.workingHours || null;
    if ("isActive" in body) updates.isActive = body.isActive;
    const [updated] = await db.update(pickupPointsTable).set(updates).where(eq(pickupPointsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Error updating pickup point");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/pickup-points/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(pickupPointsTable).where(eq(pickupPointsTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Error deleting pickup point");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Delivery Zones ────────────────────────────────────────────────────────────

router.get("/delivery-zones", async (req, res) => {
  try {
    const { activeOnly } = req.query as Record<string, string>;
    let zones = await db.select().from(deliveryZonesTable).orderBy(deliveryZonesTable.region);
    if (activeOnly === "true") zones = zones.filter(z => z.isActive);
    res.json({ zones });
  } catch (err) {
    req.log.error({ err }, "Error fetching delivery zones");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/delivery-zones", async (req, res) => {
  try {
    const { region, district, price } = req.body as Record<string, any>;
    if (!region || price === undefined) return res.status(400).json({ error: "region, price required" });
    const [zone] = await db.insert(deliveryZonesTable).values({
      region, district: district || null, price: Number(price), isActive: true,
    }).returning();
    res.status(201).json(zone);
  } catch (err) {
    req.log.error({ err }, "Error creating delivery zone");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/delivery-zones/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body as Record<string, any>;
    const updates: Record<string, any> = {};
    if ("region" in body) updates.region = body.region;
    if ("district" in body) updates.district = body.district || null;
    if ("price" in body) updates.price = Number(body.price);
    if ("isActive" in body) updates.isActive = body.isActive;
    const [updated] = await db.update(deliveryZonesTable).set(updates).where(eq(deliveryZonesTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Error updating delivery zone");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/delivery-zones/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(deliveryZonesTable).where(eq(deliveryZonesTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Error deleting delivery zone");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
