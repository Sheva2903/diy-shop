# Supabase backend

The shop runs on Supabase directly: the browser talks to PostgREST for catalog
reads and to SECURITY DEFINER functions for anything that must not be decided by
the client. There is no application server in between.

## Applying the migrations

The five files in `migrations/` are also concatenated into `apply-all.sql`.
Open the Supabase dashboard → **SQL Editor**, paste `apply-all.sql`, and run it.
The script is idempotent (`create or replace`, `drop policy if exists`,
`on conflict do nothing`), so re-running it is safe.

With the Supabase CLI linked to the project you can instead run:

```bash
supabase db push
```

## What each migration does

| File | Purpose |
|---|---|
| `…_shop_settings.sql` | `shop_settings` single-row table (shop info, bank/VietQR, shipping) that replaces the old `application.properties` values. Adds `orders.cancellation_reason`. |
| `…_rls_policies.sql` | `is_seller()` helper plus RLS on every table. Replaces Spring Security's `SecurityConfig`. |
| `…_order_functions.sql` | `create_order()` and `track_order()`. Ports `OrderService` and `BankTransferInstructionService`. |
| `…_seller_rules.sql` | Order status state machine, inventory restore on cancel, delete guards, `seller_dashboard_stats()`. Ports `SellerOrderService`. |
| `…_storage.sql` | `product-images` bucket, public read / seller write. Replaces `LocalProductImageStorage` and `S3ProductImageStorage`. |

## Security model

- **Catalog** (`categories`, `products`, `product_images`) — anyone may read rows
  where `visible = true`. Only the seller may write.
- **Orders** (`orders`, `order_items`) — no public policy at all. Customers reach
  their own order only through `track_order(order_code, phone_number)`, and
  create one only through `create_order(payload)`. Both are SECURITY DEFINER.
- **Pricing is never trusted from the client.** `create_order` reads prices and
  stock from `products` inside the transaction, locks each row `for update`,
  decrements inventory, and computes the shipping fee from `shop_settings`. The
  payload only contributes product ids, quantities and the delivery address.
- **The seller role lives in `app_metadata.role`**, which is writable only with
  the secret key. A signed-in customer cannot grant it to themselves.

## Keys

Only `SUPABASE_URL` and the **publishable** key belong in the frontend
(`frontend/.env.local`) — they ship in the browser bundle by design, and RLS is
what actually protects the data. The **secret** key must never appear in
frontend code or in the repository.

## Creating a seller account

```bash
curl -X POST "$SUPABASE_URL/auth/v1/admin/users" \
  -H "apikey: $SUPABASE_SECRET_KEY" \
  -H "Authorization: Bearer $SUPABASE_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "email": "seller@example.com",
        "password": "…",
        "email_confirm": true,
        "app_metadata": { "role": "seller" }
      }'
```
