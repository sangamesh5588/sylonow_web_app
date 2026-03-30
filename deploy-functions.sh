#!/bin/bash

# Deploy MSG91 OTP Functions to Supabase
echo "🚀 Deploying MSG91 OTP Functions to Supabase..."

# Set MSG91 secrets
echo "📝 Setting MSG91 secrets..."
supabase secrets set MSG91_AUTH_KEY=495150Aecd63E869a098d5P1
supabase secrets set MSG91_TEMPLATE_ID=699fe1a0679b735321067a13

# Deploy all functions
echo "📦 Deploying Edge Functions..."
supabase functions deploy send-otp
supabase functions deploy verify-otp
supabase functions deploy resend-otp

echo "✅ Deployment complete!"
echo ""
echo "🧪 Test your functions:"
echo "curl -X POST 'https://txgszrxjyanazlrupaty.supabase.co/functions/v1/send-otp' \\"
echo "  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"phoneNumber\":\"9741338102\"}'"
