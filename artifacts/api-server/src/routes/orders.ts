import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable } from "@workspace/db";
import {
  CreateOrderBody,
  CreateOrderResponse,
  GetOrderParams,
  GetOrderResponse,
} from "@workspace/api-zod";
import { cartStore } from "./cart";

const router: IRouter = Router();

router.post("/orders", async (req, res): Promise<void> => {
  const body = CreateOrderBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const { cartId, customerName, customerEmail, shippingAddress, notes } = body.data;

  const items = cartStore[cartId] ?? [];
  if (items.length === 0) {
    res.status(400).json({ error: "Your cargo hold is empty, Captain. Add items before checking out." });
    return;
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const [order] = await db
    .insert(ordersTable)
    .values({
      cartId,
      customerName,
      customerEmail,
      shippingAddress,
      items: items as unknown as object,
      total: total.toFixed(2),
      status: "confirmed",
      notes: notes ?? null,
    })
    .returning();

  delete cartStore[cartId];

  const mapped = {
    ...order,
    total: parseFloat(order.total),
    items: order.items as Array<{ productId: number; name: string; price: number; quantity: number; imageUrl: string }>,
    createdAt: order.createdAt.toISOString(),
  };

  res.status(201).json(CreateOrderResponse.parse(mapped));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, params.data.id));

  if (!order) {
    res.status(404).json({ error: "Order not found in the ship's manifest" });
    return;
  }

  const mapped = {
    ...order,
    total: parseFloat(order.total),
    items: order.items as Array<{ productId: number; name: string; price: number; quantity: number; imageUrl: string }>,
    createdAt: order.createdAt.toISOString(),
  };

  res.json(GetOrderResponse.parse(mapped));
});

export default router;
