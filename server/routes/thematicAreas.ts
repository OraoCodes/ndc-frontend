
import { Request, Response, Router } from 'express';
import { Database } from 'sqlite';

export function createThematicAreasRoutes(db: Database): Router {
  const router = Router();

  // Get all thematic areas
  router.get('/', async (req: Request, res: Response) => {
    try {
      const areas = await db.all('SELECT * FROM thematic_areas');
      res.json(areas);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch thematic areas' });
    }
  });

  // Get a single thematic area by id
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const area = await db.get('SELECT * FROM thematic_areas WHERE id = ?', [req.params.id]);
      if (area) {
        res.json(area);
      } else {
        res.status(404).json({ error: 'Thematic area not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch thematic area' });
    }
  });

  // Create a new thematic area
  router.post('/', async (req: Request, res: Response) => {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    try {
      const result = await db.run('INSERT INTO thematic_areas (name, description) VALUES (?, ?)', [name, description]);
      res.status(201).json({ id: result.lastID, name, description });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create thematic area' });
    }
  });

  // Update a thematic area
  router.put('/:id', async (req: Request, res: Response) => {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    try {
      const result = await db.run('UPDATE thematic_areas SET name = ?, description = ? WHERE id = ?', [name, description, req.params.id]);
      if (result.changes > 0) {
        res.json({ id: req.params.id, name, description });
      } else {
        res.status(404).json({ error: 'Thematic area not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to update thematic area' });
    }
  });

  // Delete a thematic area
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const result = await db.run('DELETE FROM thematic_areas WHERE id = ?', [req.params.id]);
      if (result.changes > 0) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Thematic area not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete thematic area' });
    }
  });

  return router;
}
