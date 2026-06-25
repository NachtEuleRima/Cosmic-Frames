import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import {
  GetCartQueryParams,
  GetCartResponse,
  AddToCartBody,
  AddToCartResponse,
  UpdateCartItemBody,
  UpdateCartItemResponse,
  RemoveFromCartQueryParams,
  RemoveFromCartResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

type CartItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

type CartStore = Record<string, CartItem[]>;

const cartStore: CartStore = {};

function buildCart(cartId: string) {
  const items = cartStore[cartId] ?? [];
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  return { cartId, items, subtotal: Math.round(subtotal * 100) / 100, itemCount };
}

router.get("/cart", async (req, res): Promise<void> => {
  const query = GetCartQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  res.json(GetCartResponse.parse(buildCart(query.data.cartId)));
});

router.post("/cart/add", async (req, res): Promise<void> => {
  const body = AddToCartBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const { cartId, productId, quantity } = body.data;

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, productId));

  if (!product) {
    res.status(404).json({ error: "Product not found in this sector" });
    return;
  }

  if (!cartStore[cartId]) {
    cartStore[cartId] = [];
  }

  const existing = cartStore[cartId].find((i) => i.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cartStore[cartId].push({
      productId,
      name: product.name,
      price: parseFloat(product.price),
      quantity,
      imageUrl: product.imageUrl,
    });
  }

  res.json(AddToCartResponse.parse(buildCart(cartId)));
});

router.patch("/cart/update", async (req, res): Promise<void> => {
  const body = UpdateCartItemBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const { cartId, productId, quantity } = body.data;

  if (!cartStore[cartId]) {
    cartStore[cartId] = [];
  }

  if (quantity <= 0) {
    cartStore[cartId] = cartStore[cartId].filter((i) => i.productId !== productId);
  } else {
    const item = cartStore[cartId].find((i) => i.productId === productId);
    if (item) item.quantity = quantity;
  }

  res.json(UpdateCartItemResponse.parse(buildCart(cartId)));
});

router.delete("/cart/remove", async (req, res): Promise<void> => {
  const query = RemoveFromCartQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { cartId, productId } = query.data;

  if (cartStore[cartId]) {
    cartStore[cartId] = cartStore[cartId].filter((i) => i.productId !== productId);
  }

  res.json(RemoveFromCartResponse.parse(buildCart(cartId)));
});

export { cartStore };
export default router;
