import { Request, Response, Router } from 'express';
import { Database } from 'better-sqlite3';

export function createPublicationsRoutes(db: Database): Router {
  const router = Router();

  // List publications (metadata only)
  router.get('/', (_req: Request, res: Response) => {
    try {
      const rows = db.prepare('SELECT id, title, date, summary, filename FROM publications ORDER BY date DESC');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch publications' });
    }
  });

  // Get publication metadata
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const pub = db.prepare('SELECT id, title, date, summary, filename FROM publications WHERE id = ?').all(req.params.id);
      if (pub) res.json(pub);
      else res.status(404).json({ error: 'Publication not found' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch publication' });
    }
  });

  // Download the file
  router.get('/:id/download', (req: Request, res: Response) => {
    try {
      const row: any = db.prepare('SELECT filename, file_blob FROM publications WHERE id = ?').all(req.params.id);
      if (!row) return res.status(404).json({ error: 'Publication not found' });

      const { filename, file_blob } = row;
      if (!file_blob) return res.status(404).json({ error: 'File not found' });

      // Try to infer content type from filename extension
      const ext = filename?.split('.')?.pop()?.toLowerCase() ?? '';
      let contentType = 'application/octet-stream';
      if (ext === 'pdf') contentType = 'application/pdf';
      else if (ext === 'txt') contentType = 'text/plain';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(file_blob);
    } catch (error) {
      res.status(500).json({ error: 'Failed to download file' });
    }
  });

  // Create a publication with file uploaded as base64 in JSON
  router.post('/', (req: Request, res: Response) => {
    try {
      const { title, date, summary, filename, contentBase64 } = req.body;
      if (!title || !filename || !contentBase64) {
        return res.status(400).json({ error: 'title, filename and contentBase64 are required' });
      }

      const buffer = Buffer.from(contentBase64, 'base64');
      const result = db.prepare(
        'INSERT INTO publications (title, date, summary, filename, file_blob) VALUES (?, ?, ?, ?, ?)').all(
        title, date ?? null, summary ?? null, filename, buffer)

      res.status(201).json({ id: result.lastID, title, date, summary, filename });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create publication' });
    }
  });

  // Delete publication
  router.delete('/:id', (req: Request, res: Response) => {
    try {
      const result = db.prepare('DELETE FROM publications WHERE id = ?').all(req.params.id);
      if (result.changes > 0) res.status(204).send();
      else res.status(404).json({ error: 'Publication not found' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete publication' });
    }
  });

  return router;
}
