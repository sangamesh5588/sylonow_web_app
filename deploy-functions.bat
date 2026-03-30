@echo off
echo 🚀 Deploying MSG91 OTP Functions to Supabase...
echo.

echo 📝 Setting MSG91 secrets...
call supabase secrets set MSG91_AUTH_KEY=495150Aecd63E869a098d5P1
call supabase secrets set MSG91_TEMPLATE_ID=699fe1a0679b735321067a13

echo.
echo 📦 Deploying Edge Functions...
call supabase functions deploy send-otp
call supabase functions deploy verify-otp
call supabase functions deploy resend-otp

echo.
echo ✅ Deployment complete!
echo.
echo 🧪 Now restart your dev server:
echo npm run dev
echo.
pause
