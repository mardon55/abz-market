import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, productsTable, storesTable, usersTable } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { CreateOrderBody, UpdateOrderStatusBody } from "@workspace/api-zod";
import { createNotification } from "./notifications";

const ORDER_STATUS_MAP: Record<string, { title: string; body: string }> = {
  processing:       { title: "Buyurtma qabul qilindi ✅",  body: "Buyurtmangiz ishlov berilmoqda." },
  ready:            { title: "Buyurtma tayyor! 🎉",        body: "Buyurtmangiz olib ketishga yoki yetkazib berishga tayyor." },
  delivered:        { title: "Buyurtma yetkazildi 🚚",     body: "Buyurtmangiz muvaffaqiyatli yetkazildi. Xaridingiz uchun rahmat!" },
  cancelled:        { title: "Buyurtma bekor qilindi ❌",   body: "Buyurtmangiz bekor qilindi." },
  return_requested: { title: "Qaytarish so'rovi qabul qilindi 🔄", body: "Mahsulotni qaytarish so'rovingiz qabul qilindi. Tez orada siz bilan bog'lanishadi." },
  returned:         { title: "Qaytarish tasdiqlandi ✅",   body: "Mahsulotingiz qaytarildi. Pul mablag'i tez orada qaytariladi." },
};

const router: IRouter = Router();

function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `#ORD-${year}${month}${day}-${random}`;
}

router.get("/orders", async (req, res) => {
  try {
    const { status, telegramId } = req.query as Record<string, string>;

    const conditions = [];
    if (status) conditions.push(eq(ordersTable.status, status));
    if (telegramId) conditions.push(eq(ordersTable.telegramId, telegramId));

    const orders = await db
      .select({
        id: ordersTable.id,
        orderNumber: ordersTable.orderNumber,
        status: ordersTable.status,
        customerName: ordersTable.customerName,
        customerPhone: ordersTable.customerPhone,
        address: ordersTable.address,
        comment: ordersTable.comment,
        paymentMethod: ordersTable.paymentMethod,
        totalPrice: ordersTable.totalPrice,
        createdAt: ordersTable.createdAt,
        storeId: ordersTable.storeId,
        storeName: storesTable.name,
        cancelReason: ordersTable.cancelReason,
        returnReason: ordersTable.returnReason,
        deliveredAt: ordersTable.deliveredAt,
      })
      .from(ordersTable)
      .leftJoin(storesTable, eq(ordersTable.storeId, storesTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(ordersTable.createdAt));

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItemsTable)
          .where(eq(orderItemsTable.orderId, order.id));
        return { ...order, items };
      })
    );

    res.json({ orders: ordersWithItems });
  } catch (err) {
    req.log.error({ err }, "Error fetching orders");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/orders", async (req, res) => {
  try {
    const body = CreateOrderBody.parse(req.body);

    let totalPrice = 0;
    const productDetails = await Promise.all(
      body.items.map(async (item) => {
        const [product] = await db
          .select()
          .from(productsTable)
          .where(eq(productsTable.id, item.productId));
        if (!product) throw new Error(`Product ${item.productId} not found`);
        totalPrice += Number(product.price) * item.quantity;
        return { product, quantity: item.quantity, color: item.color };
      })
    );

    const storeId = productDetails[0]?.product?.storeId;

    const [newOrder] = await db
      .insert(ordersTable)
      .values({
        orderNumber: generateOrderNumber(),
        status: "new",
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        address: body.address,
        comment: body.comment,
        paymentMethod: body.paymentMethod,
        totalPrice: totalPrice.toString(),
        storeId,
        telegramId: body.telegramId ?? null,
      })
      .returning();

    // Auto-register user from order data
    if (body.telegramId) {
      try {
        const nameParts = (body.customerName || "").trim().split(" ");
        const firstName = nameParts[0] || "Foydalanuvchi";
        const lastName  = nameParts.slice(1).join(" ") || null;
        const existing  = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.telegramId, body.telegramId));
        if (existing.length === 0) {
          await db.insert(usersTable).values({
            telegramId: body.telegramId,
            firstName,
            lastName,
            phone: body.customerPhone || null,
          });
        } else {
          // Update phone if not set
          await db.update(usersTable)
            .set({ phone: body.customerPhone || null, updatedAt: new Date() })
            .where(eq(usersTable.telegramId, body.telegramId));
        }
      } catch { /* non-critical, ignore */ }
    }

    await db.insert(orderItemsTable).values(
      productDetails.map(({ product, quantity, color }) => ({
        orderId: newOrder.id,
        productId: product.id,
        productName: product.name,
        productImage: product.images?.[0],
        quantity,
        price: product.price,
        color,
      }))
    );

    const items = await db
      .select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.orderId, newOrder.id));

    // ── Xaridorga bildirishnoma: buyurtma qabul qilindi ──────────────────────
    if (body.telegramId) {
      const storeName = productDetails[0]?.product?.storeId
        ? (await db.select({ name: storesTable.name }).from(storesTable)
            .where(eq(storesTable.id, productDetails[0].product.storeId)))[0]?.name ?? ""
        : "";
      await createNotification({
        telegramId: body.telegramId,
        type: "order_new",
        title: "Buyurtma qabul qilindi ✅",
        body: `${newOrder.orderNumber} — ${storeName ? `"${storeName}" do'koniga ` : ""}buyurtmangiz muvaffaqiyatli yuborildi. Tez orada siz bilan bog'lanishadi.`,
        meta: { orderId: newOrder.id, orderNumber: newOrder.orderNumber },
      }).catch(() => {});
    }

    // ── Do'kon egasiga bildirishnoma: yangi buyurtma keldi ───────────────────
    if (storeId) {
      const [storeRow] = await db
        .select({ ownerTelegramId: storesTable.ownerTelegramId, name: storesTable.name })
        .from(storesTable)
        .where(eq(storesTable.id, storeId));
      if (storeRow?.ownerTelegramId) {
        await createNotification({
          telegramId: storeRow.ownerTelegramId,
          type: "order_incoming",
          title: "Yangi buyurtma keldi! 🛒",
          body: `${newOrder.orderNumber} — ${body.customerName} tomonidan ${Number(newOrder.totalPrice).toLocaleString("uz-UZ")} so'm miqdorida buyurtma berildi.`,
          meta: { orderId: newOrder.id, orderNumber: newOrder.orderNumber, storeId },
        }).catch(() => {});
      }
    }

    res.status(201).json({ ...newOrder, items });
  } catch (err) {
    req.log.error({ err }, "Error creating order");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [order] = await db
      .select({
        id: ordersTable.id,
        orderNumber: ordersTable.orderNumber,
        status: ordersTable.status,
        customerName: ordersTable.customerName,
        customerPhone: ordersTable.customerPhone,
        address: ordersTable.address,
        comment: ordersTable.comment,
        paymentMethod: ordersTable.paymentMethod,
        totalPrice: ordersTable.totalPrice,
        createdAt: ordersTable.createdAt,
        storeId: ordersTable.storeId,
        storeName: storesTable.name,
        cancelReason: ordersTable.cancelReason,
        returnReason: ordersTable.returnReason,
        deliveredAt: ordersTable.deliveredAt,
      })
      .from(ordersTable)
      .leftJoin(storesTable, eq(ordersTable.storeId, storesTable.id))
      .where(eq(ordersTable.id, id));

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const items = await db
      .select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.orderId, order.id));

    res.json({ ...order, items });
  } catch (err) {
    req.log.error({ err }, "Error fetching order");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const body = UpdateOrderStatusBody.parse(req.body);

    // Build update payload
    const updatePayload: Record<string, unknown> = { status: body.status };
    if (body.status === "delivered")          updatePayload.deliveredAt  = new Date();
    if (body.status === "cancelled"  && body.reason) updatePayload.cancelReason = body.reason;
    if (body.status === "return_requested" && body.reason) updatePayload.returnReason = body.reason;

    const [updated] = await db
      .update(ordersTable)
      .set(updatePayload as any)
      .where(eq(ordersTable.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Order not found" });
    }

    const items = await db
      .select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.orderId, updated.id));

    // Send notification to customer if status changed
    const notif = ORDER_STATUS_MAP[body.status];
    if (notif && updated.telegramId) {
      await createNotification({
        telegramId: updated.telegramId,
        type: `order_${body.status}`,
        title: notif.title,
        body: `${updated.orderNumber} — ${notif.body}`,
        meta: { orderId: updated.id, orderNumber: updated.orderNumber },
      }).catch(() => {});
    }

    // Yetkazib berilganda "sharh qoldiring" eslatmasi ─────────────────────────
    if (body.status === "delivered" && updated.telegramId) {
      await createNotification({
        telegramId: updated.telegramId,
        type: "review_request",
        title: "Fikr qoldiring ⭐",
        body: `${updated.orderNumber} buyurtmangizni oldingizmi? Do'kon haqida fikr qoldirsangiz, boshqa xaridorlarga yordam bergan bo'lasiz!`,
        meta: { orderId: updated.id, orderNumber: updated.orderNumber, storeId: updated.storeId },
      }).catch(() => {});
    }

    res.json({ ...updated, items });
  } catch (err) {
    req.log.error({ err }, "Error updating order");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
