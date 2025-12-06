# Testing Supabase Setup

This guide helps you verify that your Supabase integration is working correctly.

## Prerequisites

1. ✅ Supabase project created
2. ✅ Migration applied to database
3. ✅ Environment variables set in `.env`
4. ✅ Supabase client installed

---

## Quick Test Methods

### Method 1: Using the Test Script (Recommended)

```bash
# Install tsx if not already installed
pnpm add -D tsx

# Run the test script
npx tsx scripts/test-supabase.ts
```

This will test:
- ✅ Connection to Supabase
- ✅ All tables exist
- ✅ Initial data (indicators) loaded
- ✅ Row Level Security policies
- ✅ JSONB support
- ✅ Storage bucket

### Method 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor**
3. Check that all tables are visible:
   - `thematic_areas`
   - `counties`
   - `indicators`
   - `county_performance`
   - `publications`
   - `user_profiles`

4. Check **SQL Editor** → Run:
   ```sql
   SELECT COUNT(*) FROM indicators;
   ```
   Should return ~60+ rows

### Method 3: Manual API Test

#### Test 1: Basic Connection

```bash
# Replace with your actual values
curl -X GET \
  'https://your-project.supabase.co/rest/v1/counties?select=*&limit=5' \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"
```

#### Test 2: Check Indicators

```bash
curl -X GET \
  'https://your-project.supabase.co/rest/v1/indicators?select=count' \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"
```

### Method 4: Test in Your Application

#### Frontend Test

Create a test component or add to an existing page:

```typescript
// client/pages/TestSupabase.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestSupabase() {
  const [status, setStatus] = useState('Testing...');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function test() {
      try {
        // Test 1: Connection
        const { data: counties, error } = await supabase
          .from('counties')
          .select('*')
          .limit(5);

        if (error) throw error;

        setStatus('✅ Connected!');
        setData(counties);
      } catch (error: any) {
        setStatus(`❌ Error: ${error.message}`);
      }
    }
    test();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <p className="mb-4">{status}</p>
      {data && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Sample Data:</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
```

Add route in `client/App.tsx`:
```typescript
<Route path="/test-supabase" element={<TestSupabase />} />
```

Then visit: http://localhost:8080/test-supabase

#### Backend Test

Add a test endpoint:

```typescript
// server/routes/test.ts
import { Router } from 'express';
import { supabase } from '../lib/supabase';

export function createTestRoutes(): Router {
  const router = Router();

  router.get('/supabase', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('counties')
        .select('*')
        .limit(5);

      if (error) throw error;

      res.json({
        status: 'success',
        message: 'Supabase connection working!',
        data,
        count: data?.length || 0
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  });

  return router;
}
```

Register in `server/index.ts`:
```typescript
import { createTestRoutes } from './routes/test';
app.use('/test', createTestRoutes());
```

Test: `curl http://localhost:8080/test/supabase`

---

## What to Check

### ✅ Database Schema

1. **All tables exist:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

2. **Indicators populated:**
   ```sql
   SELECT COUNT(*) FROM indicators;
   -- Should return ~60+
   ```

3. **Indexes created:**
   ```sql
   SELECT indexname FROM pg_indexes 
   WHERE tablename IN ('county_performance', 'indicators');
   ```

### ✅ Row Level Security

1. **Check RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

2. **Test public read:**
   ```sql
   -- Should work without authentication
   SELECT * FROM counties LIMIT 1;
   ```

### ✅ Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Verify `publications` bucket exists
3. Check bucket is public (or has proper policies)

---

## Common Issues & Solutions

### Issue: "Missing Supabase credentials"

**Solution:**
- Check `.env` file has:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `SUPABASE_URL` (for server)
  - `SUPABASE_SERVICE_ROLE_KEY` (for server)

### Issue: "Table not found"

**Solution:**
- Run the migration in Supabase Dashboard → SQL Editor
- Copy contents of `supabase/migrations/20250106000000_initial_schema.sql`
- Paste and execute

### Issue: "RLS policy violation"

**Solution:**
- Check RLS policies in migration file
- Verify policies are created in Supabase Dashboard → Authentication → Policies

### Issue: "Connection refused"

**Solution:**
- Verify Supabase URL is correct
- Check API key is correct
- Ensure project is not paused (free tier pauses after inactivity)

---

## Expected Results

When everything is working, you should see:

✅ **Connection Test**: Success  
✅ **Tables**: All 6 tables exist  
✅ **Indicators**: 60+ records  
✅ **RLS**: Public read works  
✅ **Storage**: Bucket exists (or can be created)  
✅ **JSONB**: County performance can store JSON  

---

## Next Steps After Testing

Once tests pass:

1. ✅ Update your routes to use Supabase
2. ✅ Migrate authentication to Supabase Auth
3. ✅ Set up file uploads to Storage
4. ✅ Test end-to-end workflows
5. ✅ Deploy!

---

## Quick Test Checklist

- [ ] Test script runs without errors
- [ ] All tables visible in dashboard
- [ ] Indicators table has 60+ rows
- [ ] Can query counties from frontend
- [ ] Can query counties from backend
- [ ] Storage bucket created
- [ ] RLS policies working (public read)

---

**Need Help?** Check the `SUPABASE_MIGRATION_GUIDE.md` for detailed setup instructions.

