
import { Request, Response, Router } from 'express';
import { Database } from 'sqlite';

export function createCountiesRoutes(db: Database): Router {
  const router = Router();

  // Get all counties
  router.get('/', async (req: Request, res: Response) => {
    try {
      const counties = await db.all('SELECT * FROM counties');
      res.json(counties);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch counties' });
    }
  });

  // Get a single county by id
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const county = await db.get('SELECT * FROM counties WHERE id = ?', [req.params.id]);
      if (county) {
        res.json(county);
      } else {
        res.status(404).json({ error: 'County not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch county' });
    }
  });

  // Create a new county
  router.post('/', async (req: Request, res: Response) => {
    const { name, population, thematic_area_id } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    try {
      const result = await db.run('INSERT INTO counties (name, population, thematic_area_id) VALUES (?, ?, ?)', [name, population, thematic_area_id]);
      res.status(201).json({ id: result.lastID, name, population, thematic_area_id });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create county' });
    }
  });

  // Update a county
  router.put('/:id', async (req: Request, res: Response) => {
    const { name, population, thematic_area_id } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    try {
      const result = await db.run('UPDATE counties SET name = ?, population = ?, thematic_area_id = ? WHERE id = ?', [name, population, thematic_area_id, req.params.id]);
      if (result.changes > 0) {
        res.json({ id: req.params.id, name, population, thematic_area_id });
      } else {
        res.status(404).json({ error: 'County not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to update county' });
    }
  });

  // Delete a county
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const result = await db.run('DELETE FROM counties WHERE id = ?', [req.params.id]);
      if (result.changes > 0) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'County not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete county' });
    }
  });

  return router;
}
