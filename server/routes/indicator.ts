// routes/indicators.ts
import { Router } from "express";
import type Database from 'better-sqlite3';

export function createIndicatorsRoutes(db: Database) {
    const router = Router()

    // GET all indicators
    router.get("/", (req, res) => {
        try {
            const indicators = db.prepare(`
        SELECT 
          id,
          sector,
          thematic_area AS thematicArea,
          indicator_text AS indicator,
          weight
        FROM indicators 
        ORDER BY sector, thematic_area, id
      `).all()
            res.json(indicators)
        } catch (err) {
            console.error(err)
            res.status(500).json({ error: "Failed to fetch indicators" })
        }
    })

    // CREATE new indicator
    router.post("/", (req, res) => {
        const { sector, thematic_area, indicator_text, weight = 10 } = req.body

        if (!sector || !thematic_area || !indicator_text) {
            return res.status(400).json({ error: "Missing required fields" })
        }

        try {
            const result = db.prepare(
                `INSERT INTO indicators (sector, thematic_area, indicator_text, weight) 
         VALUES (?, ?, ?, ?)`).run
                (sector.toLowerCase(), thematic_area, indicator_text, weight)
            
            res.status(201).json({ id: result.lastID, message: "Indicator added" })
        } catch (err: any) {
            if (err.message.includes("UNIQUE constraint")) {
                return res.status(400).json({ error: "This indicator already exists" })
            }
            res.status(500).json({ error: "Failed to add indicator" })
        }
    })

    // UPDATE indicator
    router.put("/:id", (req, res) => {
        const { id } = req.params
        const { thematic_area, indicator_text, weight } = req.body

        try {
            db.prepare(
                `UPDATE indicators 
         SET thematic_area = ?, indicator_text = ?, weight = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`).run
                (thematic_area, indicator_text, weight, id)
            
            res.json({ message: "Indicator updated" })
        } catch (err) {
            res.status(500).json({ error: "Failed to update" })
        }
    })

    // DELETE indicator
    router.delete("/:id", (req, res) => {
        const { id } = req.params
        try {
            db.prepare(`DELETE FROM indicators WHERE id = ?`).run(id)
            res.json({ message: "Indicator deleted" })
        } catch (err) {
            res.status(500).json({ error: "Failed to delete" })
        }
    })

    return router
}
