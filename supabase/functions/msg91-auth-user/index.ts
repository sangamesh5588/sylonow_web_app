import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MSG91_AUTH_KEY = Deno.env.get("MSG91_AUTH_KEY") || Deno.env.get("MSG91_AUTH_TOKEN");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const normalizeIndianPhone = (value: string | undefined | null): string | null => {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!MSG91_AUTH_KEY) {
      throw new Error("MSG91 auth key is not configured");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase service credentials are not configured");
    }

    const { msg91_access_token, phone } = await req.json();
    if (!msg91_access_token) {
      return new Response(
        JSON.stringify({ error: "msg91_access_token is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const verifyResponse = await fetch("https://control.msg91.com/api/v5/widget/verifyAccessToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authkey: MSG91_AUTH_KEY,
        "access-token": msg91_access_token,
      }),
    });

    const msg91Data = await verifyResponse.json();
    if (!verifyResponse.ok || msg91Data?.type === "error") {
      return new Response(
        JSON.stringify({
          error: "MSG91 token verification failed",
          details: msg91Data?.message || msg91Data?.error || "Invalid access token",
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const verifiedPhone = normalizeIndianPhone(
      phone ||
        msg91Data?.mobile ||
        msg91Data?.phone ||
        msg91Data?.identifier ||
        msg91Data?.phoneNumber
    );

    if (!verifiedPhone) {
      return new Response(
        JSON.stringify({ error: "Verified phone number was not available from request or MSG91" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    if (usersError) throw new Error(usersError.message);

    const existingUser = usersData?.users?.find((user) => user.phone === verifiedPhone);
    let authUserId = existingUser?.id;

    if (!authUserId) {
      const { data: createdUserData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        phone: verifiedPhone,
        phone_confirm: true,
      });
      if (createError || !createdUserData?.user?.id) {
        throw new Error(createError?.message || "Failed to create user");
      }
      authUserId = createdUserData.user.id;
    }

    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.createSession({
      user_id: authUserId,
    });
    if (sessionError || !sessionData?.session) {
      throw new Error(sessionError?.message || "Failed to create Supabase session");
    }

    return new Response(
      JSON.stringify({
        success: true,
        refresh_token: sessionData.session.refresh_token,
        user: {
          id: authUserId,
          phone: verifiedPhone,
        },
        session: sessionData.session,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Authentication failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
