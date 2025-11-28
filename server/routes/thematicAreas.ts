import express from 'express'; // Import the default express value
import type { Request, Response, Router } from 'express'; // Import types separately to avoid CJS/ESM conflict
import { Database } from 'better-sqlite3';

/**
 * Creates API routes for managing thematic areas.
 * @param db The initialized SQLite database instance.
 * @returns An Express Router instance.
 */
export function createThematicAreasRoutes(db: Database): Router {
  // FIX: Use the recommended CommonJS import structure for Express 
  // to avoid the "Named export not found" error.
  const router = express.Router();

  // Get all thematic areas
  router.get('/', (req: Request, res: Response) => {
    try {
      const areas = db.prepare('SELECT * FROM thematic_areas').all();
      res.json(areas);
    } catch (error) {
      // It's better to log the error for debugging
      console.error("Error fetching thematic areas:", error);
      res.status(500).json({ error: 'Failed to fetch thematic areas' });
    }
  });

  // Get a single thematic area by id
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const area = db.prepare('SELECT * FROM thematic_areas WHERE id = ?').all(req.params.id);
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

  // Create a new thematic area
  router.post('/', (req: Request, res: Response) => {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    try {
      const result = db.prepare('INSERT INTO thematic_areas (name, description) VALUES (?, ?)').all(name, description);
      res.status(201).json({ id: result.lastID, name, description });
    } catch (error) {
      console.error("Error creating thematic area:", error);
      res.status(500).json({ error: 'Failed to create thematic area' });
    }
  });

  // Update a thematic area
  router.put('/:id', (req: Request, res: Response) => {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    try {
      const result = db.prepare('UPDATE thematic_areas SET name = ?, description = ? WHERE id = ?').all(name, description, req.params.id);
      if (result.changes > 0) {
        res.json({ id: req.params.id, name, description });
      } else {
        res.status(404).json({ error: 'Thematic area not found' });
      }
    } catch (error) {
      console.error("Error updating thematic area:", error);
      res.status(500).json({ error: 'Failed to update thematic area' });
    }
  });

  // Delete a thematic area
  router.delete('/:id', (req: Request, res: Response) => {
    try {
      const result = db.prepare('DELETE FROM thematic_areas WHERE id = ?').all(req.params.id);
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

  return router;
}
