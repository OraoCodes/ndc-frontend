# SQLite Setup Guide for Local Development

## 🎯 Good News: SQLite Requires NO Setup!

SQLite is an **embedded database** - it's just a file! Unlike MySQL or PostgreSQL, you don't need to:
- Install a database server
- Configure database users
- Set up connection strings
- Run database services

The database is automatically created when you start the application!

---

## ✅ What's Already Set Up

When you run `pnpm dev`, the application automatically:

1. **Creates the database file** (`ndc.db`) if it doesn't exist
2. **Creates all tables** (6 tables total)
3. **Inserts initial data** (60+ climate indicators)
4. **Connects to the database** via `better-sqlite3`

**You don't need to do anything!** The database is ready to use.

---

## 📁 Database File Location

```
/Users/wycliffe/ndc_frontend/ndc.db
```

This is a single file containing your entire database. You can:
- Copy it (backup)
- Delete it (reset database)
- Move it
- View it with SQLite tools

---

## 🔍 How to Explore the Database

### Option 1: Using SQLite CLI (Command Line)

If you have `sqlite3` installed (comes with macOS):

```bash
# Open the database
cd /Users/wycliffe/ndc_frontend
sqlite3 ndc.db

# Once inside, try these commands:
.tables                    # List all tables
.schema counties           # Show table structure
SELECT * FROM counties LIMIT 5;  # View sample data
.quit                      # Exit
```

### Option 2: Using a GUI Tool (Recommended for Learning)

**DB Browser for SQLite** (Free, Visual):
- Download: https://sqlitebrowser.org/
- Open `ndc.db` file
- Browse tables, run queries, edit data visually

**TablePlus** (macOS, Paid but beautiful):
- Download: https://tableplus.com/
- Connect to SQLite file

**VS Code Extension**:
- Install "SQLite Viewer" extension
- Right-click `ndc.db` → "Open Database"

---

## 🗄️ Database Schema Overview

### Tables in Your Database:

1. **`thematic_areas`** - Climate categories (Water, Waste, etc.)
2. **`counties`** - Kenyan counties with population
3. **`users`** - Application user accounts
4. **`county_performance`** - Performance scores by year/sector
5. **`indicators`** - 60+ climate indicators with weights
6. **`publications`** - PDF files stored as binary data

### Quick Query Examples:

```sql
-- Count all counties
SELECT COUNT(*) FROM counties;

-- View all thematic areas
SELECT * FROM thematic_areas;

-- Get water sector indicators
SELECT * FROM indicators WHERE sector = 'water';

-- View county performance scores
SELECT c.name, cp.sector_score, cp.year 
FROM county_performance cp
JOIN counties c ON cp.county_id = c.id
WHERE cp.sector = 'water'
ORDER BY cp.sector_score DESC
LIMIT 10;
```

---

## 🚀 Running the Application

### Step 1: Start the Development Server

```bash
cd /Users/wycliffe/ndc_frontend
pnpm dev
```

The database is automatically initialized on first run!

### Step 2: Verify Database Creation

After starting the server, check:

```bash
ls -lh ndc.db
```

You should see a file (currently ~252KB).

---

## 🔄 Resetting the Database

If you want to start fresh:

```bash
# Stop the server (Ctrl+C)

# Delete the database file
rm ndc.db

# Restart the server - it will recreate everything
pnpm dev
```

---

## 📚 Learning SQLite Basics

### Key SQLite Concepts:

1. **It's a file**: `ndc.db` is your entire database
2. **No server needed**: Just read/write to the file
3. **SQL syntax**: Uses standard SQL (with some SQLite-specific features)
4. **Transactions**: Automatic for most operations

### Common SQLite Commands:

```sql
-- View all tables
.tables

-- Show structure of a table
.schema table_name

-- View all data in a table
SELECT * FROM table_name;

-- Count rows
SELECT COUNT(*) FROM table_name;

-- Filter data
SELECT * FROM counties WHERE name LIKE '%Nairobi%';

-- Join tables
SELECT c.name, ta.name as thematic_area
FROM counties c
LEFT JOIN thematic_areas ta ON c.thematic_area_id = ta.id;
```

---

## 🛠️ How the App Uses SQLite

### In the Code:

**Database Connection** (`server/db/setup.ts`):
```typescript
import Database from 'better-sqlite3';
const db = new Database("./ndc.db");
```

**Querying Data** (example from routes):
```typescript
const counties = db.prepare('SELECT * FROM counties').all();
const county = db.prepare('SELECT * FROM counties WHERE id = ?').get(id);
```

**Inserting Data**:
```typescript
const result = db.prepare('INSERT INTO counties (name) VALUES (?)').run('Nairobi');
const newId = result.lastInsertRowid;
```

---

## ⚠️ Important Notes for Learning

### 1. **Concurrency Limitations**
SQLite handles one write at a time. For this app, that's fine, but for high-traffic apps, you'd use PostgreSQL.

### 2. **File Location**
The database file is in the project root. Don't commit it to git if it contains sensitive data (add to `.gitignore`).

### 3. **Backup**
To backup your database:
```bash
cp ndc.db ndc.db.backup
```

### 4. **File Size**
SQLite files can grow large. Currently yours is 252KB. If it gets very large (>1GB), consider archiving old data.

---

## 🎓 Learning Resources

### SQLite Documentation:
- Official Docs: https://www.sqlite.org/docs.html
- SQL Tutorial: https://www.sqlite.org/lang.html

### Interactive Learning:
- SQLite Tutorial: https://www.sqlitetutorial.net/
- W3Schools SQL: https://www.w3schools.com/sql/ (works with SQLite)

### Practice Queries for This Project:

```sql
-- 1. Find all counties with performance data
SELECT DISTINCT c.name 
FROM counties c
JOIN county_performance cp ON c.id = cp.county_id;

-- 2. Average score by sector
SELECT sector, AVG(sector_score) as avg_score
FROM county_performance
GROUP BY sector;

-- 3. Counties with highest water scores
SELECT c.name, cp.sector_score, cp.year
FROM county_performance cp
JOIN counties c ON cp.county_id = c.id
WHERE cp.sector = 'water'
ORDER BY cp.sector_score DESC
LIMIT 5;

-- 4. Count indicators by thematic area
SELECT thematic_area, COUNT(*) as indicator_count
FROM indicators
WHERE sector = 'water'
GROUP BY thematic_area;
```

---

## ✅ Checklist: Getting Started

- [x] Database file exists (`ndc.db`)
- [x] Tables are created (6 tables)
- [x] Initial data loaded (indicators)
- [ ] Install DB Browser for SQLite (optional but helpful)
- [ ] Try running some SQL queries
- [ ] Explore the database schema

---

## 🆘 Troubleshooting

### Database file not found?
- Start the server: `pnpm dev`
- The database is created automatically on first run

### Can't open database?
- Make sure the server isn't running (SQLite locks the file)
- Check file permissions: `ls -l ndc.db`

### Want to see what's in the database?
- Use DB Browser for SQLite (GUI tool)
- Or use: `sqlite3 ndc.db` in terminal

---

## 🎉 You're Ready!

That's it! SQLite requires **zero configuration**. Just run `pnpm dev` and the database is ready to use. Start exploring with the queries above or use a GUI tool to browse visually.

**Next Steps:**
1. Open the app in browser: http://localhost:8080
2. Install DB Browser for SQLite to explore the database
3. Try running some SQL queries
4. Check out the code in `server/db/setup.ts` to see how tables are created

Happy learning! 🚀

