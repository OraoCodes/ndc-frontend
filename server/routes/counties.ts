import express from 'express'; // Import the default express value
import type { Request, Response, Router } from 'express'; // Import types separately to avoid CJS/ESM conflict
import { Database } from 'sqlite';

export function createCountiesRoutes(db: Database): Router {
  const router = express.Router();

  // ==================================================================
  // 1. Dynamic Summary Performance (replaces hardcoded data)
  // ==================================================================
  router.get('/summary-performance/:sector', async (req: Request, res: Response) => {
    const { sector } = req.params;
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();

    if (!['water', 'waste'].includes(sector)) {
      return res.status(400).json({ error: 'Sector must be "water" or "waste"' });
    }

    try {
      const rows = await db.all(`
        SELECT 
          c.name as county,
          cp.sector_score as indexScore,
          ROW_NUMBER() OVER (ORDER BY cp.sector_score DESC) as rank
        FROM county_performance cp
        JOIN counties c ON cp.county_id = c.id
        WHERE cp.sector = ? AND cp.year = ?
        ORDER BY cp.sector_score DESC
        LIMIT 20
      `, [sector, year]);

      const performanceMap: Record<string, string> = {
        '90-100': 'Outstanding',
        '75-89': 'Satisfactory',
        '60-74': 'Good',
        '40-59': 'Average',
        '0-39': 'Poor'
      };

      const result = rows.map(row => {
        const score = row.indexScore || 0;
        let performance = 'Poor';
        for (const [range, label] of Object.entries(performanceMap)) {
          const [min, max] = range.split('-').map(Number);
          if (score >= min && score <= max) {
            performance = label;
            break;
          }
        }
        return {
          rank: row.rank,
          county: row.county,
          indexScore: Number(score.toFixed(1)),
          performance
        };
      });

      res.json(result);
    } catch (error) {
      console.error('Failed to fetch summary performance:', error);
      res.status(500).json({ error: 'Failed to load rankings' });
    }
  });

  // ==================================================================
  // 2. Get detailed county performance by name (for public county page)
  // ==================================================================
  router.get('/:name/performance', async (req: Request, res: Response) => {
    const { name } = req.params;
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();

    try {
      const county = await db.get(
        'SELECT id, name FROM counties WHERE LOWER(name) = LOWER(?)',
        [name]
      );

      if (!county) {
        return res.status(404).json({ error: 'County not found' });
      }

      const performance = await db.all(`
        SELECT 
          sector,
          overall_score,
          sector_score,
          governance,
          mrv,
          mitigation,
          adaptation,
          finance,
          indicators_json
        FROM county_performance 
        WHERE county_id = ? AND year = ?
      `, [county.id, year]);

      if (performance.length === 0) {
        return res.status(404).json({ error: 'No data available for this year' });
      }

      const water = performance.find(p => p.sector === 'water') || {};
      const waste = performance.find(p => p.sector === 'waste') || {};

      res.json({
        county: county.name,
        year,
        // Calculate overall average of scores, ensuring no division by zero or NaN results
        overallScore: Number(((water.overall_score || 0) + (waste.overall_score || 0)) / (water.overall_score && waste.overall_score ? 2 : 1) || 0).toFixed(1),
        waterScore: Number(water.sector_score || 0).toFixed(1),
        wasteScore: Number(waste.sector_score || 0).toFixed(1),
        indicators: {
          // Average the thematic scores (Governance, MRV, etc.) across sectors
          governance: Number(((water.governance || 0) + (waste.governance || 0)) / (water.governance && waste.governance ? 2 : 1) || 0).toFixed(1),
          mrv: Number(((water.mrv || 0) + (waste.mrv || 0)) / (water.mrv && waste.mrv ? 2 : 1) || 0).toFixed(1),
          mitigation: Number(((water.mitigation || 0) + (waste.mitigation || 0)) / (water.mitigation && waste.mitigation ? 2 : 1) || 0).toFixed(1),
          adaptation: Number(((water.adaptation || 0) + (waste.adaptation || 0)) / (water.adaptation && waste.adaptation ? 2 : 1) || 0).toFixed(1),
          finance: Number(((water.finance || 0) + (waste.finance || 0)) / (water.finance && waste.finance ? 2 : 1) || 0).toFixed(1),
        },
        waterIndicators: water.indicators_json ? JSON.parse(water.indicators_json) : [],
        wasteIndicators: waste.indicators_json ? JSON.parse(waste.indicators_json) : [],
      });
    } catch (error) {
      console.error('Error fetching county performance:', error);
      res.status(500).json({ error: 'Failed to load county data' });
    }
  });

  // ==================================================================
  // 3. Save / Update county performance (from admin dashboard)
  // ==================================================================
  router.post('/:id/performance', async (req: Request, res: Response) => {
    const countyId = Number(req.params.id);
    const {
      year,
      sector, // 'water' or 'waste'
      overall_score,
      sector_score,
      governance,
      mrv,
      mitigation,
      adaptation,
      finance,
      indicators // array of { indicator: string, description: string, score: number }
    } = req.body;

    if (!countyId || !year || !sector || !indicators) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      await db.run(`
        INSERT INTO county_performance (
          county_id, year, sector,
          overall_score, sector_score,
          governance, mrv, mitigation, adaptation, finance,
          indicators_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(county_id, year, sector) DO UPDATE SET
          overall_score = excluded.overall_score,
          sector_score = excluded.sector_score,
          governance = excluded.governance,
          mrv = excluded.mrv,
          mitigation = excluded.mitigation,
          adaptation = excluded.adaptation,
          finance = excluded.finance,
          indicators_json = excluded.indicators_json,
          updated_at = CURRENT_TIMESTAMP
      `, [
        countyId, year, sector,
        overall_score ?? null,
        sector_score ?? null,
        governance ?? null,
        mrv ?? null,
        mitigation ?? null,
        adaptation ?? null,
        finance ?? null,
        JSON.stringify(indicators)
      ]);

      res.json({ success: true, message: 'Performance data saved' });
    } catch (error) {
      console.error('Failed to save performance:', error);
      res.status(500).json({ error: 'Failed to save data' });
    }
  });

  // ==================================================================
  // Existing CRUD routes (unchanged, just cleaned up)
  // ==================================================================
  router.get('/', async (req: Request, res: Response) => {
    try {
      const counties = await db.all('SELECT * FROM counties ORDER BY name');
      res.json(counties);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch counties' });
    }
  });

  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const county = await db.get('SELECT * FROM counties WHERE id = ?', [req.params.id]);
      if (county) res.json(county);
      else res.status(404).json({ error: 'County not found' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch county' });
    }
  });

  router.post('/', async (req: Request, res: Response) => {
    const { name, population, thematic_area_id } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    try {
      const result = await db.run(
        'INSERT INTO counties (name, population, thematic_area_id) VALUES (?, ?, ?)',
        [name, population || null, thematic_area_id || null]
      );
      res.status(201).json({ id: result.lastID, name, population, thematic_area_id });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        res.status(400).json({ error: 'County already exists' });
      } else {
        res.status(500).json({ error: 'Failed to create county' });
      }
    }
  });

  router.put('/:id', async (req: Request, res: Response) => {
    const { name, population, thematic_area_id } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    try {
      const result = await db.run(
        'UPDATE counties SET name = ?, population = ?, thematic_area_id = ? WHERE id = ?',
        [name, population || null, thematic_area_id || null, req.params.id]
      );
      if (result.changes > 0) {
        res.json({ id: req.params.id, name, population, thematic_area_id });
      } else {
        res.status(404).json({ error: 'County not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to update county' });
    }
  });

  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const result = await db.run('DELETE FROM counties WHERE id = ?', [req.params.id]);
      if (result.changes > 0) res.status(204).send();
      else res.status(404).json({ error: 'County not found' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete county' });
    }
  });

  return router;
}

