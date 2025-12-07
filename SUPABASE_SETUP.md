# Supabase Setup Guide

## Step 1: Create Your .env File

Create a `.env` file in the root of your project with the following content:

```env
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
```

## Step 2: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Navigate to **Settings** → **API**
4. Copy the following values:
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **anon public** key → Use for `VITE_SUPABASE_PUBLISHABLE_KEY`

## Step 3: Update Your .env File

Replace the placeholder values in your `.env` file with the actual values from Supabase:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Run Database Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/fresh_setup.sql`
4. Click **Run** to execute the migration

## Step 5: Verify Setup

1. Restart your development server (`npm run dev` or `bun dev`)
2. The app should now connect to your Supabase database

## Important Notes

- ⚠️ **Never commit your `.env` file to git** - it's already in `.gitignore`
- The `.env` file is for local development
- For production, set these as environment variables in your hosting platform
- The `anon public` key is safe to use in frontend code (it's public by design)

## Troubleshooting

### "Invalid API key" error
- Make sure you copied the **anon public** key, not the service_role key
- Verify the URL is correct (should end with `.supabase.co`)

### "Failed to fetch" error
- Check that your Supabase project is active
- Verify your internet connection
- Check browser console for CORS errors

### RLS (Row Level Security) errors
- Make sure you've run the migration SQL
- Verify you're authenticated (check if user is logged in)

