import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MSG91_AUTH_TOKEN = Deno.env.get('MSG91_AUTH_TOKEN');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phoneNumber, otp } = await req.json();

    if (!phoneNumber || !otp) {
      return new Response(
        JSON.stringify({ error: 'Phone number and OTP are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Verify OTP with MSG91
    const msg91Response = await fetch(
      `https://control.msg91.com/api/v5/otp/verify?mobile=91${phoneNumber}&otp=${otp}`,
      {
        method: 'GET',
        headers: { 'authkey': MSG91_AUTH_TOKEN || '' },
      }
    );

    const msg91Data = await msg91Response.json();

    if (!msg91Response.ok || msg91Data.type === 'error') {
      return new Response(
        JSON.stringify({ error: msg91Data.message || 'Invalid OTP' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Create or get Supabase user using admin API
    const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const phone = `+91${phoneNumber}`;

    // Try to find existing user by phone
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.phone === phone);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        phone,
        phone_confirm: true,
      });

      if (createError) {
        throw new Error(createError.message);
      }
      userId = newUser.user!.id;
    }

    // Step 3: Generate a session token for the user
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.createSession({
      user_id: userId,
    });

    if (sessionError) {
      throw new Error(sessionError.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'OTP verified successfully',
        session: sessionData.session,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to verify OTP' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
