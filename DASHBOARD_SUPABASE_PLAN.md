# Dashboard Supabase Migration Plan

## Current Dashboard Analysis

### What the Dashboard Currently Shows:

1. **Stats Cards:**
   - Total Counties (from API) ✅
   - Thematic Areas (from API) ✅
   - Water Management: 85% (HARDCODED) ❌
   - Overall Score: 79% (HARDCODED) ❌

2. **Chart:**
   - Quarterly Performance (HARDCODED data) ❌

3. **Data Fetched:**
   - Counties (via `api.listCounties()`)
   - Thematic Areas (via `api.listThematicAreas()`)
   - Publications (via `api.listPublications()`)

### What We Can Improve with Supabase:

1. ✅ **Replace API calls with Supabase client** (direct queries)
2. ✅ **Calculate real performance stats** from `county_performance` table
3. ✅ **Show actual average scores** for water/waste sectors
4. ✅ **Add real performance trends** (by year/month)
5. ✅ **Show counties with data** vs total counties
6. ✅ **Add performance distribution** (how many counties in each score range)

---

## Migration Strategy

### Option 1: Direct Supabase Queries (Recommended)
- Use Supabase client directly in components
- Faster (no Express middleware)
- Better caching with React Query
- Simpler code

### Option 2: Keep Express Routes (Hybrid)
- Keep Express routes but have them query Supabase
- More control over data transformation
- Can add caching/rate limiting

**Recommendation:** Use Option 1 for read operations, Option 2 for write operations.

---

## Proposed Dashboard Enhancements

### New Stats to Add:

1. **Average Water Score** - Calculate from `county_performance` where sector='water'
2. **Average Waste Score** - Calculate from `county_performance` where sector='waste'
3. **Counties with Data** - Count distinct counties in `county_performance`
4. **Total Performance Records** - Count all performance entries
5. **Top Performing County** - Highest sector_score
6. **Recent Activity** - Latest performance updates

### Chart Improvements:

1. **Sector Comparison** - Water vs Waste average scores
2. **Performance Distribution** - How many counties in each score range
3. **Year-over-Year Trends** - If we have multiple years of data
4. **Thematic Area Breakdown** - Average scores by thematic area

---

## Implementation Plan

1. Create Supabase API functions in `client/lib/supabase-api.ts`
2. Update Dashboard to use Supabase directly
3. Add real performance calculations
4. Replace hardcoded stats with live data
5. Enhance charts with real data

