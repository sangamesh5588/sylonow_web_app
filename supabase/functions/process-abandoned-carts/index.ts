import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const ABANDONED_CART_WEBHOOK_URL = Deno.env.get("ABANDONED_CART_WEBHOOK_URL");
const ABANDONED_CART_WEBHOOK_SECRET = Deno.env.get("ABANDONED_CART_WEBHOOK_SECRET");

const DEFAULT_DELAY_MINUTES = Number(Deno.env.get("ABANDONED_CART_DELAY_MINUTES") ?? "60");
const DEFAULT_REPEAT_HOURS = Number(Deno.env.get("ABANDONED_CART_REPEAT_HOURS") ?? "24");
const DEFAULT_MAX_BATCH = Number(Deno.env.get("ABANDONED_CART_MAX_BATCH") ?? "50");

type CartRow = {
  id: string;
  auth_user_id: string;
  phone_number: string | null;
  full_name: string | null;
  cart_items: Array<{
    title?: string;
    line_total?: number;
  }> | null;
  item_count: number;
  cart_total: number;
  recovery_url: string | null;
  last_activity_at: string;
  last_notified_at: string | null;
  notification_count: number;
  first_abandoned_at: string | null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing Supabase service role configuration" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const delayMinutes = Number(body.delayMinutes ?? DEFAULT_DELAY_MINUTES);
    const repeatHours = Number(body.repeatHours ?? DEFAULT_REPEAT_HOURS);
    const maxBatch = Number(body.maxBatch ?? DEFAULT_MAX_BATCH);
    const dryRun = Boolean(body.dryRun);

    const abandonedBefore = new Date(Date.now() - delayMinutes * 60 * 1000).toISOString();
    const repeatBefore = new Date(Date.now() - repeatHours * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("abandoned_carts")
      .select("id, auth_user_id, phone_number, full_name, cart_items, item_count, cart_total, recovery_url, last_activity_at, last_notified_at, notification_count, first_abandoned_at")
      .eq("status", "active")
      .gt("item_count", 0)
      .lte("last_activity_at", abandonedBefore)
      .order("last_activity_at", { ascending: true })
      .limit(maxBatch);

    if (error) {
      throw error;
    }

    const dueCarts = (data as CartRow[]).filter((cart) => {
      if (!cart.phone_number) return false;
      if (!cart.last_notified_at) return true;
      return cart.last_notified_at <= repeatBefore;
    });

    if (dryRun) {
      return new Response(
        JSON.stringify({
          success: true,
          dryRun: true,
          dueCount: dueCarts.length,
          carts: dueCarts.map((cart) => ({
            id: cart.id,
            auth_user_id: cart.auth_user_id,
            phone_number: cart.phone_number,
            item_count: cart.item_count,
            cart_total: cart.cart_total,
            recovery_url: cart.recovery_url,
            last_activity_at: cart.last_activity_at,
            notification_count: cart.notification_count,
          })),
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const results: Array<Record<string, unknown>> = [];

    for (const cart of dueCarts) {
      const topTitles = (cart.cart_items ?? [])
        .map((item) => item.title)
        .filter(Boolean)
        .slice(0, 3);

      const payload = {
        cartId: cart.id,
        authUserId: cart.auth_user_id,
        phoneNumber: cart.phone_number,
        fullName: cart.full_name,
        itemCount: cart.item_count,
        cartTotal: cart.cart_total,
        serviceTitles: topTitles,
        recoveryUrl: cart.recovery_url,
        lastActivityAt: cart.last_activity_at,
      };

      let reminderStatus: "queued" | "sent" | "failed" | "skipped" = "queued";
      let providerResponse: unknown = null;
      let errorMessage: string | null = null;

      if (!ABANDONED_CART_WEBHOOK_URL) {
        reminderStatus = "skipped";
        errorMessage = "ABANDONED_CART_WEBHOOK_URL is not configured";
      } else {
        const webhookResponse = await fetch(ABANDONED_CART_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(ABANDONED_CART_WEBHOOK_SECRET
              ? { Authorization: `Bearer ${ABANDONED_CART_WEBHOOK_SECRET}` }
              : {}),
          },
          body: JSON.stringify(payload),
        });

        const responseText = await webhookResponse.text();
        providerResponse = {
          status: webhookResponse.status,
          body: responseText,
        };

        if (webhookResponse.ok) {
          reminderStatus = "sent";
        } else {
          reminderStatus = "failed";
          errorMessage = `Webhook returned ${webhookResponse.status}`;
        }
      }

      const { error: logError } = await supabase.from("abandoned_cart_reminders").insert({
        cart_id: cart.id,
        auth_user_id: cart.auth_user_id,
        reminder_type: "webhook",
        status: reminderStatus,
        destination: cart.phone_number,
        payload,
        provider_response: providerResponse,
        error_message: errorMessage,
        sent_at: reminderStatus === "sent" ? new Date().toISOString() : null,
      });

      if (logError) {
        throw logError;
      }

      const nextNotificationCount =
        reminderStatus === "sent" ? cart.notification_count + 1 : cart.notification_count;

      const { error: cartUpdateError } = await supabase
        .from("abandoned_carts")
        .update({
          first_abandoned_at: cart.first_abandoned_at ?? new Date().toISOString(),
          last_notified_at:
            reminderStatus === "sent" ? new Date().toISOString() : cart.last_notified_at,
          notification_count: nextNotificationCount,
        })
        .eq("id", cart.id);

      if (cartUpdateError) {
        throw cartUpdateError;
      }

      results.push({
        cartId: cart.id,
        status: reminderStatus,
        destination: cart.phone_number,
        errorMessage,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to process abandoned carts",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
