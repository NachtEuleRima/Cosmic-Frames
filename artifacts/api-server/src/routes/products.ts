import { Router, type IRouter } from "express";
import { eq, ilike, and, type SQL } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import {
  ListProductsQueryParams,
  ListProductsResponse,
  ListFeaturedProductsResponse,
  ListCategoriesResponse,
  GetProductParams,
  GetProductResponse,
  GetStoreStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/products", async (req, res): Promise<void> => {
  const query = ListProductsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions: SQL[] = [];
  if (query.data.category) {
    conditions.push(eq(productsTable.category, query.data.category));
  }
  if (query.data.search) {
    conditions.push(ilike(productsTable.name, `%${query.data.search}%`));
  }

  const products = conditions.length
    ? await db.select().from(productsTable).where(and(...conditions))
    : await db.select().from(productsTable);

  const mapped = products.map((p) => ({
    ...p,
    price: parseFloat(p.price),
  }));

  res.json(ListProductsResponse.parse(mapped));
});

router.get("/products/featured", async (_req, res): Promise<void> => {
  const products = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.featured, true))
    .limit(6);

  const mapped = products.map((p) => ({
    ...p,
    price: parseFloat(p.price),
  }));

  res.json(ListFeaturedProductsResponse.parse(mapped));
});

router.get("/products/categories", async (_req, res): Promise<void> => {
  const all = await db.select().from(productsTable);

  const categoryMap: Record<string, number> = {};
  for (const p of all) {
    categoryMap[p.category] = (categoryMap[p.category] ?? 0) + 1;
  }

  const categoryDescriptions: Record<string, string> = {
    "Classic Series": "Frames inspired by the original Star Trek series from the 1960s",
    "Next Generation": "Sleek, modern frames fit for the 24th century Enterprise crew",
    "Deep Space Nine": "Sturdy frames built for life on the frontier of explored space",
    "Voyager": "Resilient frames for the long journey home across the Delta Quadrant",
    "Klingon Collection": "Bold, battle-hardened frames with Klingon warrior spirit",
    "LCARS Edition": "Frames featuring the iconic Library Computer Access/Retrieval System aesthetic",
  };

  const categories = Object.entries(categoryMap).map(([name, count]) => ({
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    description: categoryDescriptions[name] ?? `Frames from the ${name} universe`,
    productCount: count,
  }));

  res.json(ListCategoriesResponse.parse(categories));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, params.data.id));

  if (!product) {
    res.status(404).json({ error: "Product not found in this sector" });
    return;
  }

  res.json(GetProductResponse.parse({ ...product, price: parseFloat(product.price) }));
});

const TREK_FACTS = [
  "The USS Enterprise NCC-1701 can travel at warp 9, but our shipping is faster.",
  "Starfleet has catalogued over 1000 alien species. We have frames for all of them.",
  "Vulcans live for 200+ years — long enough to collect our entire catalog twice.",
  "The replicator was invented in the 24th century. Our frames exist right now.",
  "Klingon warriors believe there is no honour in a bare wall. We agree.",
];

router.get("/store/stats", async (_req, res): Promise<void> => {
  const all = await db.select().from(productsTable);
  const categorySet = new Set(all.map((p) => p.category));
  const fact = TREK_FACTS[Math.floor(Math.random() * TREK_FACTS.length)];

  res.json(
    GetStoreStatsResponse.parse({
      totalProducts: all.length,
      totalCategories: categorySet.size,
      happyCustomers: 47312,
      starTrekFact: fact,
    }),
  );
});

export default router;
