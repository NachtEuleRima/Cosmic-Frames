# StarFrame Shop

A Star Trek-themed photo frame ecommerce storefront with good humour. Browse, add to cart, and order from across the quadrant.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, wouter routing, TanStack Query, shadcn/ui, framer-motion, tailwind
- API: Express 5 with OpenAPI-first contract; Orval codegen generates typed hooks + Zod schemas
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/` — DB schema (products.ts, orders.ts)
- `lib/api-spec/` — OpenAPI spec (source of truth for the API contract)
- `lib/api-client-react/src/generated/api.ts` — generated hooks + Zod schemas (do not edit)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/starframe-shop/src/pages/` — all frontend pages
- `artifacts/starframe-shop/src/assets/` — AI-generated product images (frame-1.png to frame-8.png)
- `artifacts/starframe-shop/src/index.css` — Trek dark theme CSS variables

## Architecture decisions

- Cart is stored in-memory on the server (ephemeral, keyed by UUID in localStorage). Fine for demo/prototype; swap for Redis or DB-backed cart for production.
- Product images seeded as `/src/assets/frame-N.png` paths — Vite serves these at dev time from the frontend. In production, move to object storage and update image URLs in the DB.
- OpenAPI spec is the contract — never modify generated files. Run `codegen` after changing the spec.
- `useRemoveFromCart` mutation takes `{ params: RemoveFromCartParams }` (query-param-based DELETE), not a body.
- Always rebuild libs (`pnpm run typecheck:libs`) before checking artifact TypeScript if you add/change DB schema or API spec.

## Product

Full Star Trek-themed ecommerce storefront with:
- **Home** — hero, live stats bar, featured products grid, feature highlights
- **Armory (Products)** — searchable, filterable catalog by Trek collection
- **Product Detail** — Trek quote, specs (dimensions, material), quantity picker, add to cart
- **Cargo Hold (Cart)** — update/remove items, subtotal, proceed to checkout
- **Checkout** — customer info form, order manifest summary, place order
- **Order Confirmation / Detail** — order ID, status, line items, shipping details

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Express 5 wildcard routes use `/{*splat}` not `/*`
- `useGetCart` and any hook with `enabled` must also pass `queryKey` explicitly to the query options
- Cart removal is a DELETE with query params — mutate with `{ params: { cartId, productId } }`
- After schema/spec changes: run `codegen`, then `typecheck:libs`, then check artifact TypeScript

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
