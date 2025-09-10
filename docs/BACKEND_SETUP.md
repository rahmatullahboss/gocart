Backend Setup (Prisma + Postgres)

1) Provision Postgres
- Use Vercel Postgres, Neon, or Supabase.

2) Environment Variables
- DATABASE_URL
- DIRECT_URL
- NEXT_PUBLIC_CURRENCY_SYMBOL (optional)
- ADMIN_API_KEY (optional; to allow protected POST /api/products for seeding)

3) Install and Generate Prisma Client
```
npm i
npm i -D prisma
npm i @prisma/client
npm run prisma:generate
```

4) Apply Migrations
```
npm run prisma:migrate:dev -- -n init
# Production (on Vercel build/deploy):
npm run prisma:migrate:deploy
```

5) Seed Example Product (optional)
```
curl -X POST "https://<your-vercel-domain>/api/products" \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: <ADMIN_API_KEY>" \
  -d '{
    "name":"Sample Product",
    "description":"Demo description",
    "mrp":199.0,
    "price":149.0,
    "images":["https://.../image.png"],
    "category":"Electronics",
    "storeId":"<existing-store-id>"
  }'
```

Notes
- API routes run on Node.js runtime and use Prisma.
- The UI will continue using dummy products until `/api/products` returns at least one product.
- For production images, use Cloudinary/S3 and allow domains in `next.config.mjs` via `images.remotePatterns`.

