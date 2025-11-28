import express from 'express'; // Import the default express value
import type { Request, Response, Router } from 'express'; // Import types separately for type safety
import type { Database } from "better-sqlite3";

/**
 * Creates API routes for fetching aggregated summary performance data.
 * @param db The initialized SQLite database instance.
 * @returns An Express Router instance.
 */
export function createSummaryRoutes(db: Database): Router {
  const router = express.Router(); // Use express.Router()

  // WATER SUMMARY - Fetches all counties' water scores for the specified year (hardcoded to 2025 in the SQL for now)
  router.get("/summary-performance/water", (req: Request, res: Response) => {
    // Note: I added leading '/' to fix the route path
    try {
      const rows = db.prepare(`
        SELECT 
          c.name,
          COALESCE(cp.sector_score, 0) as score
        FROM counties c
        LEFT JOIN county_performance cp 
          ON c.id = cp.county_id 
          AND cp.year = 2025 
          AND cp.sector = 'water'
        ORDER BY c.name
      `).all()
      res.json(rows)
    } catch (err) {
      console.error("Database error fetching water summary:", err);
      res.status(500).json({ error: "Database error" })
    }
  })

  // WASTE SUMMARY - Fetches all counties' waste scores for the specified year (hardcoded to 2025 in the SQL for now)
  router.get("/summary-performance/waste", (req: Request, res: Response) => {
    // Note: I added leading '/' to fix the route path
    try {
      const rows = db.prepare(`
        SELECT 
          c.name,
          COALESCE(cp.sector_score, 0) as score
        FROM counties c
        LEFT JOIN county_performance cp 
          ON c.id = cp.county_id 
          AND cp.year = 2025 
          AND cp.sector = 'waste'
        ORDER BY c.name
      `).all()
      res.json(rows)
    } catch (err) {
      console.error("Database error fetching waste summary:", err);
      res.status(500).json({ error: "Database error" })
    }
  })

  return router
}
