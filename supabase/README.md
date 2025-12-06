# Supabase Migrations

This folder contains database migrations for the NDC Frontend application.

## Structure

```
supabase/
├── migrations/          # SQL migration files
│   └── 20250106000000_initial_schema.sql
├── config.toml          # Local Supabase configuration
└── README.md           # This file
```

## Migration Files

Migration files are named with a timestamp prefix to ensure they run in order:
- Format: `YYYYMMDDHHMMSS_description.sql`
- Example: `20250106000000_initial_schema.sql`

## Running Migrations

### Option 1: Using Supabase Dashboard (Recommended for Production)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of the migration file
4. Click **Run**

### Option 2: Using Supabase CLI

```bash
# Link to your project (first time only)
npx supabase link --project-ref your-project-ref

# Push migrations to remote
npx supabase db push

# Or run a specific migration
npx supabase migration up
```

### Option 3: Local Development

```bash
# Start local Supabase (requires Docker)
npx supabase start

# Run migrations locally
npx supabase migration up
```

## Creating New Migrations

```bash
# Generate a new migration file
npx supabase migration new your_migration_name

# This creates: supabase/migrations/YYYYMMDDHHMMSS_your_migration_name.sql
```

## Migration Best Practices

1. **Always test locally first** before applying to production
2. **Never modify existing migrations** - create new ones instead
3. **Use transactions** for complex migrations
4. **Add rollback scripts** for destructive changes
5. **Document changes** in migration file comments

## Current Schema

The initial migration (`20250106000000_initial_schema.sql`) creates:

- ✅ `thematic_areas` - Climate action categories
- ✅ `counties` - Kenyan counties
- ✅ `user_profiles` - Extended user data (linked to Supabase Auth)
- ✅ `county_performance` - Performance scores by sector
- ✅ `indicators` - 60+ climate indicators (pre-populated)
- ✅ `publications` - Publication metadata (files in Storage)

All tables include:
- Row Level Security (RLS) policies
- Indexes for performance
- Auto-updating `updated_at` timestamps
- Foreign key constraints

## Next Steps

1. Apply the initial migration to your Supabase project
2. Set up the Storage bucket for publications
3. Update your application code to use Supabase client
4. Test the migration thoroughly

For detailed migration instructions, see `SUPABASE_MIGRATION_GUIDE.md` in the project root.

