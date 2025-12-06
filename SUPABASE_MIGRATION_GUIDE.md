# Migrating to Supabase - Complete Guide

## 🎯 Why Supabase is Perfect for This App

Supabase is an **excellent choice** for this NDC application because it solves multiple problems:

### ✅ Benefits for Your App:

1. **PostgreSQL Database** - Production-ready, handles concurrency
2. **Built-in Authentication** - Replaces your custom JWT system
3. **File Storage** - Solves the BLOB problem (PDFs in database)
4. **Row Level Security (RLS)** - Database-level security
5. **Auto-generated APIs** - REST and GraphQL out of the box
6. **Real-time Subscriptions** - Live updates (optional)
7. **Free Tier** - Generous free plan to start
8. **Managed Service** - No server management needed

### 🎁 What You Get:

- ✅ **Database**: PostgreSQL (production-grade)
- ✅ **Auth**: Email/password, OAuth, magic links
- ✅ **Storage**: File uploads (perfect for publications)
- ✅ **Security**: RLS policies
- ✅ **Backups**: Automatic daily backups
- ✅ **Scaling**: Handles growth automatically

---

## 📋 Migration Overview

### What Changes:

1. **Database**: SQLite → PostgreSQL (via Supabase)
2. **Authentication**: Custom JWT → Supabase Auth
3. **File Storage**: Database BLOB → Supabase Storage
4. **Connection**: File-based → API-based
5. **Code**: `better-sqlite3` → `@supabase/supabase-js`

### What Stays the Same:

- ✅ Your React frontend (minimal changes)
- ✅ Your API routes structure
- ✅ Your business logic
- ✅ Your data schema (mostly)

---

## 🚀 Step-by-Step Migration

### Step 1: Create Supabase Project

1. **Sign up**: https://supabase.com
2. **Create new project**:
   - Project name: `ndc-frontend`
   - Database password: (save this!)
   - Region: Choose closest to Kenya
3. **Get your credentials**:
   - Project URL: `https://xxxxx.supabase.co`
   - Anon key: `eyJhbGc...` (public, safe for frontend)
   - Service role key: `eyJhbGc...` (secret, backend only)

### Step 2: Install Supabase Client

```bash
cd /Users/wycliffe/ndc_frontend

# Install Supabase JavaScript client
pnpm add @supabase/supabase-js

# Optional: Install Supabase CLI for migrations
pnpm add -D supabase
```

### Step 3: Set Up Environment Variables

Create/update `.env`:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Server-side (keep secret!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_URL=https://xxxxx.supabase.co
```

### Step 4: Create Database Schema in Supabase

#### Option A: Using Supabase Dashboard (Easiest)

1. Go to **SQL Editor** in Supabase dashboard
2. Run this migration:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Thematic Areas
CREATE TABLE thematic_areas (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Counties
CREATE TABLE counties (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  population INTEGER,
  thematic_area_id INTEGER REFERENCES thematic_areas(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (Supabase Auth handles this, but we'll add profile table)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  organisation TEXT,
  phone_number TEXT,
  position TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- County Performance
CREATE TABLE county_performance (
  id SERIAL PRIMARY KEY,
  county_id INTEGER NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  sector TEXT NOT NULL CHECK(sector IN ('water', 'waste')),
  overall_score REAL,
  sector_score REAL,
  governance REAL,
  mrv REAL,
  mitigation REAL,
  adaptation REAL,
  finance REAL,
  indicators_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(county_id, year, sector)
);

-- Indicators
CREATE TABLE indicators (
  id SERIAL PRIMARY KEY,
  sector TEXT NOT NULL CHECK(sector IN ('water', 'waste')),
  thematic_area TEXT NOT NULL,
  indicator_text TEXT NOT NULL,
  weight REAL NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sector, indicator_text)
);

-- Publications (now references storage, not BLOB)
CREATE TABLE publications (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE,
  summary TEXT,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- Path in Supabase Storage
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_county_performance_county_year ON county_performance(county_id, year);
CREATE INDEX idx_county_performance_sector ON county_performance(sector);
CREATE INDEX idx_indicators_sector ON indicators(sector);
CREATE INDEX idx_publications_date ON publications(date DESC);

-- Insert initial indicators (same as SQLite)
INSERT INTO indicators (sector, thematic_area, indicator_text, weight) VALUES
  -- WATER SECTOR INDICATORS
  ('water', 'Governance', 'Existence of relevant sector policy aligned with NDCs, county action plan or sectoral climate strategy, institution involved in climate governance.', 10),
  ('water', 'Governance', '% of staff trained in climate-related planning.', 10),
  -- ... (all 60+ indicators from your SQLite setup)
  -- Copy the full list from server/db/setup.ts
;

-- Enable Row Level Security
ALTER TABLE counties ENABLE ROW LEVEL SECURITY;
ALTER TABLE county_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read, authenticated write
CREATE POLICY "Public read access" ON counties FOR SELECT USING (true);
CREATE POLICY "Public read access" ON county_performance FOR SELECT USING (true);
CREATE POLICY "Public read access" ON publications FOR SELECT USING (true);
CREATE POLICY "Public read access" ON indicators FOR SELECT USING (true);

CREATE POLICY "Authenticated write access" ON county_performance FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write access" ON publications FOR ALL USING (auth.role() = 'authenticated');
```

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
pnpm add -D supabase

# Initialize Supabase
npx supabase init

# Link to your project
npx supabase link --project-ref your-project-ref

# Create migration
npx supabase migration new create_ndc_schema

# Edit the migration file, then:
npx supabase db push
```

### Step 5: Set Up Supabase Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Create bucket: `publications`
3. Set to **Public** (or use signed URLs)
4. Add policy:

```sql
-- Allow public read
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'publications');

-- Allow authenticated upload
CREATE POLICY "Authenticated upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'publications' AND
  auth.role() = 'authenticated'
);
```

### Step 6: Update Server Code

#### Create Supabase Client (`server/lib/supabase.ts`):

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client (bypasses RLS)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
```

#### Update Database Setup (`server/db/setup.ts`):

```typescript
// OLD: SQLite
// import Database from 'better-sqlite3';
// const db = new Database("./ndc.db");

// NEW: Supabase
import { supabase } from '../lib/supabase';

export async function setupDatabase() {
  // Supabase handles schema creation via migrations
  // Just verify connection
  const { data, error } = await supabase.from('counties').select('count').limit(1);
  
  if (error) {
    console.error('Supabase connection error:', error);
    throw error;
  }
  
  console.log('✅ Connected to Supabase');
  return supabase;
}
```

#### Update Route Handlers (Example: `server/routes/counties.ts`):

```typescript
// OLD: SQLite
// const counties = db.prepare('SELECT * FROM counties').all();

// NEW: Supabase
import { supabase } from '../lib/supabase';

export function createCountiesRoutes() {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('counties')
        .select('*')
        .order('name');
      
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch counties' });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('counties')
        .select('*')
        .eq('id', req.params.id)
        .single();
      
      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'County not found' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch county' });
    }
  });

  router.post('/:id/performance', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('county_performance')
        .upsert({
          county_id: req.params.id,
          ...req.body,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'county_id,year,sector'
        })
        .select()
        .single();
      
      if (error) throw error;
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save performance' });
    }
  });

  return router;
}
```

#### Update Publications Route (File Storage):

```typescript
// server/routes/publications.ts
import { supabase } from '../lib/supabase';

router.post('/', async (req, res) => {
  try {
    const { title, date, summary, filename, contentBase64 } = req.body;
    
    // Convert base64 to buffer
    const buffer = Buffer.from(contentBase64, 'base64');
    
    // Upload to Supabase Storage
    const filePath = `publications/${Date.now()}_${filename}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('publications')
      .upload(filePath, buffer, {
        contentType: 'application/pdf',
        upsert: false
      });
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('publications')
      .getPublicUrl(filePath);
    
    // Save metadata to database
    const { data, error } = await supabase
      .from('publications')
      .insert({
        title,
        date,
        summary,
        filename,
        storage_path: filePath,
        file_size: buffer.length,
        mime_type: 'application/pdf'
      })
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload publication' });
  }
});

router.get('/:id/download', async (req, res) => {
  try {
    const { data: pub, error } = await supabase
      .from('publications')
      .select('storage_path, filename, mime_type')
      .eq('id', req.params.id)
      .single();
    
    if (error || !pub) {
      return res.status(404).json({ error: 'Publication not found' });
    }
    
    // Download from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('publications')
      .download(pub.storage_path);
    
    if (downloadError) throw downloadError;
    
    res.setHeader('Content-Type', pub.mime_type || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pub.filename}"`);
    res.send(Buffer.from(await fileData.arrayBuffer()));
  } catch (error) {
    res.status(500).json({ error: 'Download failed' });
  }
});
```

### Step 7: Update Authentication

#### Replace Custom Auth with Supabase Auth

**Frontend** (`client/lib/supabase.ts`):

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Update AuthContext** (`client/context/AuthContext.tsx`):

```typescript
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const register = async (formData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          organisation: formData.organisation,
          phone_number: formData.phoneNumber,
          position: formData.position,
        }
      }
    });
    if (error) throw error;
    
    // Create user profile
    if (data.user) {
      await supabase.from('user_profiles').insert({
        id: data.user.id,
        full_name: formData.fullName,
        email: formData.email,
        organisation: formData.organisation,
        phone_number: formData.phoneNumber,
        position: formData.position,
      });
    }
    
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!session,
      user,
      session,
      login,
      register,
      logout,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Step 8: Update Frontend API Calls

**Option A: Use Supabase Client Directly** (Recommended):

```typescript
// client/lib/api.ts
import { supabase } from './supabase';

export const api = {
  // Counties
  listCounties: async () => {
    const { data, error } = await supabase
      .from('counties')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },

  getCountyPerformance: async (countyName: string, year = "2025") => {
    const { data: county } = await supabase
      .from('counties')
      .select('id, name')
      .ilike('name', countyName)
      .single();

    if (!county) throw new Error('County not found');

    const { data, error } = await supabase
      .from('county_performance')
      .select('*')
      .eq('county_id', county.id)
      .eq('year', parseInt(year));

    if (error) throw error;
    return data;
  },
};
```

**Option B: Keep Express Routes** (Hybrid approach):

Keep your Express routes but have them use Supabase instead of SQLite.

---

## 🔄 Data Migration

### Export from SQLite:

```bash
# Export data to SQL
sqlite3 ndc.db << EOF
.mode insert counties
.output counties.sql
SELECT * FROM counties;

.mode insert county_performance
.output county_performance.sql
SELECT * FROM county_performance;
EOF
```

### Import to Supabase:

```typescript
// scripts/migrate-data.ts
import { supabase } from '../server/lib/supabase';
import Database from 'better-sqlite3';

const sqliteDb = new Database('./ndc.db');

async function migrate() {
  // Migrate counties
  const counties = sqliteDb.prepare('SELECT * FROM counties').all();
  for (const county of counties) {
    await supabase.from('counties').insert({
      id: county.id,
      name: county.name,
      population: county.population,
      thematic_area_id: county.thematic_area_id,
    });
  }

  // Migrate county_performance
  const performance = sqliteDb.prepare('SELECT * FROM county_performance').all();
  for (const perf of performance) {
    await supabase.from('county_performance').insert({
      county_id: perf.county_id,
      year: perf.year,
      sector: perf.sector,
      overall_score: perf.overall_score,
      sector_score: perf.sector_score,
      governance: perf.governance,
      mrv: perf.mrv,
      mitigation: perf.mitigation,
      adaptation: perf.adaptation,
      finance: perf.finance,
      indicators_json: JSON.parse(perf.indicators_json || '[]'),
    });
  }

  console.log('✅ Migration complete');
}

migrate();
```

---

## 🎯 Key Differences: SQLite vs Supabase

| Feature | SQLite | Supabase |
|---------|--------|----------|
| **Connection** | File-based | API-based |
| **Queries** | `db.prepare().all()` | `supabase.from().select()` |
| **Inserts** | `db.prepare().run()` | `supabase.from().insert()` |
| **Updates** | `db.prepare().run()` | `supabase.from().update()` |
| **Files** | BLOB in database | Storage bucket |
| **Auth** | Custom JWT | Built-in |
| **Security** | Application-level | RLS policies |

---

## ✅ Benefits You'll Get

1. **No More File Storage Issues** - PDFs in Storage, not database
2. **Better Authentication** - Built-in, secure, feature-rich
3. **Scalability** - Handles growth automatically
4. **Backups** - Automatic daily backups
5. **Security** - Row Level Security at database level
6. **Real-time** - Optional live updates
7. **Monitoring** - Built-in dashboard and logs

---

## 💰 Pricing

**Free Tier** (Perfect to start):
- 500MB database
- 1GB file storage
- 50,000 monthly active users
- 2GB bandwidth

**Pro Tier** ($25/month):
- 8GB database
- 100GB file storage
- Unlimited users
- 250GB bandwidth

---

## 🚀 Next Steps

1. ✅ Create Supabase account
2. ✅ Set up project
3. ✅ Run schema migration
4. ✅ Update environment variables
5. ✅ Update server code
6. ✅ Update frontend auth
7. ✅ Migrate data
8. ✅ Test thoroughly
9. ✅ Deploy!

---

## 📚 Resources

- Supabase Docs: https://supabase.com/docs
- JavaScript Client: https://supabase.com/docs/reference/javascript
- Migration Guide: https://supabase.com/docs/guides/database/migrations
- Storage Guide: https://supabase.com/docs/guides/storage

---

**Bottom Line**: Supabase is an excellent choice for this app. It solves your file storage problem, provides better auth, and scales with you. The migration is straightforward, and you'll have a production-ready setup!

