# Supabase Setup Guide for OTP Authentication

This guide will help you set up Supabase with Edge Functions to handle MSG91 OTP authentication securely.

## Why Supabase?

- **Solves CORS Issues**: MSG91 API doesn't allow direct browser calls
- **Secure API Keys**: MSG91 credentials stay on the server
- **Scalable**: Handles production traffic easily
- **Free Tier**: Perfect for development and small apps

## Step-by-Step Setup

### 1. Create Supabase Account

1. Go to [supabase.com](https://supabase.com/)
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Verify your email

### 2. Create a New Project

1. Click "New Project"
2. Fill in project details:
   - **Name**: `sylonow-auth`
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine
3. Click "Create new project"
4. Wait 2-3 minutes for project to be ready

### 3. Get Supabase Credentials

1. Go to **Project Settings** (gear icon bottom left)
2. Click **API** tab
3. Copy these values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`

4. Update your [.env.local](.env.local) file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Install Supabase CLI

#### Windows:
```bash
npm install -g supabase
```

#### Mac/Linux:
```bash
brew install supabase/tap/supabase
```

Or use npx (no installation needed):
```bash
npx supabase
```

### 5. Login to Supabase CLI

```bash
supabase login
```

This will open your browser. Authorize the CLI.

### 6. Link Your Project

```bash
supabase link --project-ref your-project-ref
```

To find your project ref:
- Go to Project Settings > General
- Copy the "Reference ID"

### 7. Set MSG91 Secrets in Supabase

Your MSG91 credentials need to be stored securely in Supabase:

```bash
supabase secrets set MSG91_AUTH_KEY=495150Aecd63E869a098d5P1
supabase secrets set MSG91_TEMPLATE_ID=699fe1a0679b735321067a13
```

**Important**: Never commit these to Git!

### 8. Deploy Edge Functions

Deploy all three OTP functions:

```bash
# Deploy send-otp function
supabase functions deploy send-otp

# Deploy verify-otp function
supabase functions deploy verify-otp

# Deploy resend-otp function
supabase functions deploy resend-otp
```

Or deploy all at once:
```bash
supabase functions deploy
```

### 9. Test Your Functions

Test if the functions are working:

```bash
# Test send-otp
curl -X POST 'https://your-project.supabase.co/functions/v1/send-otp' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"phoneNumber":"9741338102"}'
```

You should receive:
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

### 10. Update Your App

Your app is already configured! Just restart your dev server:

```bash
npm run dev
```

## File Structure

```
project/
├── supabase/
│   ├── config.toml                    # Supabase configuration
│   └── functions/
│       ├── send-otp/
│       │   └── index.ts              # Send OTP function
│       ├── verify-otp/
│       │   └── index.ts              # Verify OTP function
│       └── resend-otp/
│           └── index.ts              # Resend OTP function
├── src/
│   └── services/
│       └── msg91.ts                  # Updated to use Supabase
└── .env.local                        # Supabase credentials
```

## Environment Variables Summary

### Frontend (.env.local)
```env
# Supabase - Public (safe to expose)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# MSG91 - Server only (set in Supabase secrets)
# MSG91_AUTH_KEY=xxxxx  (DON'T put in .env.local)
# MSG91_TEMPLATE_ID=xxxxx  (DON'T put in .env.local)
```

### Supabase Secrets (via CLI)
```bash
MSG91_AUTH_KEY=495150Aecd63E869a098d5P1
MSG91_TEMPLATE_ID=699fe1a0679b735321067a13
```

## How It Works

### Before (CORS Error ❌)
```
Browser → MSG91 API ❌ (CORS blocked)
```

### After (Working ✅)
```
Browser → Supabase Edge Function → MSG91 API ✅
```

## Common Issues & Solutions

### Issue 1: "Failed to send OTP"

**Cause**: Edge functions not deployed or secrets not set

**Solution**:
```bash
# Check if functions are deployed
supabase functions list

# Redeploy functions
supabase functions deploy

# Check secrets
supabase secrets list
```

### Issue 2: "Invalid project ref"

**Cause**: Wrong project reference ID

**Solution**:
1. Go to Project Settings > General
2. Copy correct Reference ID
3. Run: `supabase link --project-ref correct-ref-id`

### Issue 3: "Authorization header is missing"

**Cause**: Missing or incorrect anon key

**Solution**:
1. Verify `VITE_SUPABASE_ANON_KEY` in .env.local
2. Restart dev server after changing .env.local

### Issue 4: Functions taking too long

**Cause**: Cold start (first request after deploy)

**Solution**: This is normal. Subsequent requests will be faster.

## Testing Locally

You can test Edge Functions locally before deploying:

```bash
# Start Supabase locally
supabase start

# In another terminal, run your app
npm run dev
```

Update .env.local for local testing:
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key
```

## Monitoring & Logs

### View Function Logs
```bash
# Real-time logs
supabase functions logs send-otp --tail

# Or view in dashboard
# Go to Functions > send-otp > Logs
```

### Check Function Metrics
Go to Supabase Dashboard:
1. Click **Functions** (left sidebar)
2. Select a function
3. View **Invocations**, **Errors**, **Duration**

## Cost & Limits

### Free Tier Includes:
- **500,000** Edge Function invocations/month
- **2GB** Edge Function bandwidth
- **Unlimited** API requests

For most apps, this is more than enough!

### If You Exceed Limits:
- Upgrade to Pro plan: $25/month
- Or optimize: Cache OTPs, implement rate limiting

## Security Best Practices

1. ✅ **Never commit secrets** to Git
2. ✅ **Use environment variables** for all credentials
3. ✅ **Keep anon key public** (it's designed to be public)
4. ✅ **Never expose service_role key** (keep it secret!)
5. ✅ **Enable RLS** (Row Level Security) on database tables
6. ✅ **Add rate limiting** to prevent OTP spam

## Next Steps

1. ✅ Test the login flow in your app
2. ✅ Monitor function logs for errors
3. ✅ Add rate limiting (optional but recommended)
4. ✅ Set up database tables for user data (optional)
5. ✅ Deploy your app to production

## Useful Commands

```bash
# Supabase CLI commands
supabase login              # Login to Supabase
supabase projects list      # List your projects
supabase link               # Link to a project
supabase functions list     # List deployed functions
supabase functions deploy   # Deploy all functions
supabase functions delete   # Delete a function
supabase secrets list       # List secrets (names only)
supabase secrets set        # Set a secret
supabase logs               # View logs

# Project management
supabase start              # Start local Supabase
supabase stop               # Stop local Supabase
supabase status             # Check status
```

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Edge Functions Guide**: https://supabase.com/docs/guides/functions
- **MSG91 API Docs**: https://docs.msg91.com/
- **Community**: https://github.com/supabase/supabase/discussions

## Troubleshooting Checklist

Before asking for help, verify:

- [ ] Supabase project is created and running
- [ ] Supabase URL and anon key are correct in .env.local
- [ ] MSG91 secrets are set in Supabase (via CLI)
- [ ] Edge functions are deployed successfully
- [ ] Dev server restarted after env changes
- [ ] Browser console shows no errors
- [ ] Function logs show no errors

## Quick Start (TL;DR)

```bash
# 1. Create Supabase project at supabase.com

# 2. Install and login
npm install -g supabase
supabase login

# 3. Link project
supabase link --project-ref your-ref

# 4. Set secrets
supabase secrets set MSG91_AUTH_KEY=your-key
supabase secrets set MSG91_TEMPLATE_ID=your-template-id

# 5. Deploy functions
supabase functions deploy

# 6. Update .env.local with Supabase credentials

# 7. Restart dev server
npm run dev

# Done! 🎉
```

---

Need help? Check the logs:
```bash
supabase functions logs send-otp --tail
```
