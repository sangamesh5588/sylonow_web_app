# Abandoned Cart Plan

## What was added

1. A Supabase-backed cart snapshot table: `public.abandoned_carts`
2. A reminder log table: `public.abandoned_cart_reminders`
3. An RPC for authenticated cart snapshot upserts: `public.upsert_abandoned_cart_snapshot(...)`
4. Automatic browser sync for logged-in users from the app shell
5. Checkout conversion handling so purchased cart entries are removed and the snapshot is updated
6. An Edge Function: `process-abandoned-carts`

## Flow

1. User adds or removes cart items in the browser.
2. Logged-in sessions sync the reduced cart snapshot to Supabase.
3. If the cart stays inactive for the configured delay, `process-abandoned-carts` picks it up.
4. The function logs the reminder attempt and optionally posts the payload to your webhook provider.
5. Successful checkout removes the purchased cart entry and updates the snapshot as `converted` when the cart becomes empty.

## Files

- `supabase/migrations/202604050001_abandoned_carts.sql`
- `supabase/functions/process-abandoned-carts/index.ts`
- `src/lib/abandonedCart.ts`
- `src/components/layout/CartSync.tsx`
- `src/pages/Checkout.tsx`

## Supabase Apply Steps

Supabase MCP was not configured in this session, so the live apply step could not be executed through MCP. Use either Supabase Dashboard SQL editor, Supabase CLI, or MCP once available.

1. Apply the migration:

```bash
supabase db push
```

2. Deploy the function:

```bash
supabase functions deploy process-abandoned-carts
```

3. Set function secrets:

```bash
supabase secrets set ABANDONED_CART_DELAY_MINUTES=60
supabase secrets set ABANDONED_CART_REPEAT_HOURS=24
supabase secrets set ABANDONED_CART_MAX_BATCH=50
supabase secrets set ABANDONED_CART_WEBHOOK_URL=https://your-provider.example.com/abandoned-cart
supabase secrets set ABANDONED_CART_WEBHOOK_SECRET=your-shared-secret
```

4. Schedule the function from Supabase scheduled functions or your external scheduler.

Recommended cadence:

- Run every 15 minutes
- Delay before first reminder: 60 minutes
- Repeat gap: 24 hours

## Webhook Payload

The function posts JSON like this:

```json
{
  "cartId": "uuid",
  "authUserId": "uuid",
  "phoneNumber": "+9190...",
  "fullName": "Customer Name",
  "itemCount": 2,
  "cartTotal": 12998,
  "serviceTitles": ["Jungle Safari Setup", "Baby Shower Decor"],
  "recoveryUrl": "https://your-site/cart",
  "lastActivityAt": "2026-04-05T10:00:00.000Z"
}
```

## Notes

- Only authenticated users are synced to Supabase right now because guests do not have a stable server-side identity.
- `process-abandoned-carts` skips carts without a phone number.
- The current repo already has Deno typing issues in `supabase/functions/*`, so root `npm run lint` still fails for unrelated reasons.
