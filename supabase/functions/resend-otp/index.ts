import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MSG91_AUTH_TOKEN = Deno.env.get('MSG91_AUTH_TOKEN');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber || phoneNumber.length !== 10) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Call MSG91 API to resend OTP
    const response = await fetch(
      `https://control.msg91.com/api/v5/otp/retry?mobile=91${phoneNumber}`,
      {
        method: 'POST',
        headers: {
          'authkey': MSG91_AUTH_TOKEN || '',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to resend OTP');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'OTP resent successfully',
        data
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to resend OTP'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
