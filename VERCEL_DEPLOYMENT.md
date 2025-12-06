# Vercel Deployment Guide

## Required Environment Variables

When deploying to Vercel, you need to add the following environment variables in your Vercel project settings:

### Frontend Environment Variables (Required)

These are used by the React client and must be prefixed with `VITE_` to be accessible in the browser:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these:**
- Go to your Supabase project dashboard
- Navigate to **Settings** → **API**
- Copy the **Project URL** → Use as `VITE_SUPABASE_URL`
- Copy the **anon/public key** → Use as `VITE_SUPABASE_ANON_KEY`

### Backend Environment Variables (Optional - Only if using serverless functions)

If you're using Vercel serverless functions for any backend operations, you'll also need:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Where to find these:**
- Same Supabase dashboard → **Settings** → **API**
- Copy the **Project URL** → Use as `SUPABASE_URL`
- Copy the **service_role key** (⚠️ Keep this secret!) → Use as `SUPABASE_SERVICE_ROLE_KEY`

**Note:** The service role key bypasses Row Level Security (RLS). Only use it in serverless functions, never expose it to the frontend.

### Optional Environment Variables

```
PING_MESSAGE=ping  # Optional: Custom message for /ping endpoint
PORT=3000          # Optional: Server port (Vercel sets this automatically)
NODE_ENV=production # Optional: Usually set automatically by Vercel
```

## How to Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Name**: The variable name (e.g., `VITE_SUPABASE_URL`)
   - **Value**: The actual value
   - **Environment**: Select where it applies:
     - **Production**: For production deployments
     - **Preview**: For preview deployments (pull requests)
     - **Development**: For local development (if using Vercel CLI)

## Important Notes

### For Frontend-Only Deployment (Recommended)

Since your app now uses Supabase directly from the frontend, you typically only need:

- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`

The Express server routes are no longer used for data operations, so you may not need the server-side variables unless you're deploying serverless functions.

### Security Best Practices

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Use different Supabase projects** for development and production if possible
3. **The anon key is safe** to expose in the frontend (it's public by design)
4. **The service role key is secret** - Only use in serverless functions, never in frontend code

## Verification

After adding the environment variables:

1. Redeploy your application in Vercel
2. Check the build logs to ensure variables are loaded
3. Test the application to verify Supabase connections work

## Troubleshooting

If you see errors like "Missing Supabase environment variables":
- Verify the variable names match exactly (case-sensitive)
- Ensure variables are added to the correct environment (Production/Preview)
- Redeploy after adding new variables
- Check Vercel build logs for any variable loading errors

