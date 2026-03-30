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
    const { phoneNumber, otp } = await req.json();

    if (!phoneNumber || !otp) {
      return new Response(
        JSON.stringify({ error: 'Phone number and OTP are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Call MSG91 API to verify OTP
    const response = await fetch(
      `https://control.msg91.com/api/v5/otp/verify?mobile=91${phoneNumber}&otp=${otp}`,
      {
        method: 'GET',
        headers: {
          'authkey': MSG91_AUTH_TOKEN || '',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Invalid OTP');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'OTP verified successfully',
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
        error: error.message || 'Failed to verify OTP'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
