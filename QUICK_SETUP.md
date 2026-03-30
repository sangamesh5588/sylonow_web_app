# Quick Setup Guide - MSG91 + Supabase

Your Supabase project is already configured! Just follow these 3 simple steps:

## ✅ Your Current Setup

- ✅ Supabase Project: `txgszrxjyanazlrupaty`
- ✅ Supabase URL: `https://txgszrxjyanazlrupaty.supabase.co`
- ✅ Environment variables configured
- ✅ MSG91 credentials: Ready

## 🚀 Quick Deploy (3 Steps)

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

### Step 2: Login and Link

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref txgszrxjyanazlrupaty
```

### Step 3: Deploy Functions

**Windows:**
```bash
deploy-functions.bat
```

**Mac/Linux:**
```bash
chmod +x deploy-functions.sh
./deploy-functions.sh
```

**Or manually:**
```bash
# Set secrets
supabase secrets set MSG91_AUTH_KEY=495150Aecd63E869a098d5P1
supabase secrets set MSG91_TEMPLATE_ID=699fe1a0679b735321067a13

# Deploy functions
supabase functions deploy
```

## ✅ That's It!

Now restart your app:
```bash
npm run dev
```

Try logging in - it should work now!

## 🧪 Test Your Setup

### Test Send OTP:
```bash
curl -X POST 'https://txgszrxjyanazlrupaty.supabase.co/functions/v1/send-otp' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z3N6cnhqeWFuYXpscnVwYXR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNzU4MjcsImV4cCI6MjA2NTg1MTgyN30.7MDiDGMCEa-E8c3HgIGxSpkOsH9kClD5i5LNSjzFul4' \
  -H 'Content-Type: application/json' \
  -d '{"phoneNumber":"9741338102"}'
```

Expected response:
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

## 🐛 Troubleshooting

### "supabase: command not found"
```bash
npm install -g supabase
```

### "Failed to link project"
Make sure you're logged in:
```bash
supabase login
```

### "Failed to deploy"
Check if you're in the right directory:
```bash
cd c:\Users\msi\Desktop\project\sylonow-web-app--main\sylonow-web-app--main
```

### Still getting "Failed to send OTP"?
1. Check Supabase function logs:
```bash
supabase functions logs send-otp --tail
```

2. Verify secrets are set:
```bash
supabase secrets list
```

## 📊 View Logs

Real-time logs:
```bash
supabase functions logs send-otp --tail
```

Or visit: https://supabase.com/dashboard/project/txgszrxjyanazlrupaty/functions/send-otp

## ✨ Your MSG91 Configuration

From your `msg91.md`:
- **Widget ID**: `366274677442303433393835`
- **Token Auth**: `495150T9dnXSDMY69a09988P1`
- **Auth Key**: `495150Aecd63E869a098d5P1`
- **Template ID**: `699fe1a0679b735321067a13`

All configured and ready to use!

## 🎉 Next Steps

After deployment works:
1. Test login flow in your app
2. Monitor function invocations in Supabase dashboard
3. Check MSG91 dashboard for SMS delivery
4. Deploy your app to production when ready

---

Need help? Check [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed guide.
