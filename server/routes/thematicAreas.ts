// routes/thematicAreas.ts  ← FULL FIXED VERSION
import express from 'express';
import type { Request, Response, Router } from 'express';
import { Database } from 'better-sqlite3';

export function createThematicAreasRoutes(db: Database): Router {
  const router = express.Router();

  // GET all
  router.get('/', (req: Request, res: Response) => {
    try {
      const areas = db.prepare('SELECT * FROM thematic_areas').all();
      res.json(areas);
    } catch (error) {
      console.error("Error fetching thematic areas:", error);
      res.status(500).json({ error: 'Failed to fetch thematic areas' });
    }
  });

  // POST — THIS IS THE FIX
  router.post('/', (req: Request, res: Response) => {
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }

    try {
      const stmt = db.prepare('INSERT INTO thematic_areas (name, description) VALUES (?, ?)');
      const result = stmt.run(name.trim(), description || null);   // ← .run() instead of .all()

      res.status(201).json({
        id: result.lastInsertRowid,
        name: name.trim(),
        description: description || null
      });
    } catch (error: any) {
      console.error("Error creating thematic area:", error);
      // Optional: detect duplicate name
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Thematic area with this name already exists' });
      }
      res.status(500).json({ error: 'Failed to create thematic area' });
    }
  });

  // DELETE — also fix this one (bonus)
  router.delete('/:id', (req: Request, res: Response) => {
    try {
      const result = db.prepare('DELETE FROM thematic_areas WHERE id = ?').run(req.params.id);
      if (result.changes > 0) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Thematic area not found' });
      }
    } catch (error) {
      console.error("Error deleting thematic area:", error);
      res.status(500).json({ error: 'Failed to delete thematic area' });
    }
  });

  // PUT — also fix this one (bonus)
  router.put('/:id', (req: Request, res: Response) => {
    const { name, description } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }
    try {
      const result = db.prepare('UPDATE thematic_areas SET name = ?, description = ? WHERE id = ?')
        .run(name.trim(), description || null, req.params.id);

      if (result.changes > 0) {
        res.json({ id: req.params.id, name: name.trim(), description: description || null });
      } else {
        res.status(404).json({ error: 'Thematic area not found' });
      }
    } catch (error) {
      console.error("Error updating thematic area:", error);
      res.status(500).json({ error: 'Failed to update thematic area' });
    }
  });

  // GET single and other routes stay the same
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const area = db.prepare('SELECT * FROM thematic_areas WHERE id = ?').get(req.params.id);
      if (area) {
        res.json(area);
      } else {
        res.status(404).json({ error: 'Thematic area not found' });
      }
    } catch (error) {
      console.error("Error fetching thematic area:", error);
      res.status(500).json({ error: 'Failed to fetch thematic area' });
    }
  });

  return router;
}
