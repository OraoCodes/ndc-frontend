// server/routes/scores.ts
import { Router } from 'express'
const router = Router()
import Database from 'better-sqlite3'
const db = new Database('./ndc.db')

// GET /api/scores/water → All county water scores
router.get('/water', (req, res) => {
  try {
    const scores = db.prepare(`
      SELECT 
        c.name as county_name,
        COALESCE(SUM(s.governance_score), 0) as governance,
        COALESCE(SUM(s.mrv_score), 0) as mrv,
        COALESCE(SUM(s.mitigation_score), 0) as mitigation,
        COALESCE(SUM(s.adaptation_score), 0) as adaptation_resilience,
        COALESCE(SUM(s.finance_score), 0) as finance,
        COALESCE(SUM(s.total_score), 0) as total_score
      FROM counties c
      LEFT JOIN county_scores s ON c.id = s.county_id AND s.sector = 'water'
      GROUP BY c.id, c.name
      ORDER BY total_score DESC
    `).all()

    res.json(scores)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Failed to fetch water scores" })
  }
});

// WASTE SCORES — NEW
router.get('/waste', (req, res) => {
  try {
    const scores = db.prepare(`
      SELECT 
        c.name AS county_name,
        COALESCE(SUM(cs.governance_score), 0) AS governance,
        COALESCE(SUM(cs.mrv_score), 0) AS mrv,
        COALESCE(SUM(cs.mitigation_score), 0) AS mitigation,
        COALESCE(SUM(cs.adaptation_score), 0) AS adaptation_resilience,
        COALESCE(SUM(cs.finance_score), 0) AS finance,
        COALESCE(SUM(cs.total_score), 0) AS total_score
      FROM counties c
      LEFT JOIN county_scores cs ON c.id = cs.county_id AND cs.sector = 'waste'
      GROUP BY c.id, c.name
      ORDER BY total_score DESC
    `).all();
    res.json(scores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load waste data" });
  }
});
export default router
