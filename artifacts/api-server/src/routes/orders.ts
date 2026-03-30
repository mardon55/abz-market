import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, productsTable, storesTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { CreateOrderBody, UpdateOrderStatusBody } from "@workspace/api-zod";

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
    const { status } = req.query as Record<string, string>;

    const conditions = [];
    if (status) conditions.push(eq(ordersTable.status, status));

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
      })
      .from(ordersTable)
      .leftJoin(storesTable, eq(ordersTable.storeId, storesTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(ordersTable.createdAt);

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
      })
      .returning();

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

    const [updated] = await db
      .update(ordersTable)
      .set({ status: body.status })
      .where(eq(ordersTable.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Order not found" });
    }

    const items = await db
      .select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.orderId, updated.id));

    res.json({ ...updated, items });
  } catch (err) {
    req.log.error({ err }, "Error updating order");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
