import Database from 'better-sqlite3';
import { open } from 'sqlite';

/**
 * Initializes and sets up the SQLite database structure (ndc.db).
 * This includes creating tables for thematic areas, counties, publications, users, 
 * county performance records, and specific indicators, followed by inserting 
 * initial indicator data.
 * @returns {Database} The initialized database instance.
 */
export async function setupDatabase() {
  const db = new Database("./ndc.db");

  // Enable foreign key constraints
  db.exec('PRAGMA foreign_keys = ON;');

  db.exec(`
    -- Table for broad thematic areas (e.g., Water, Waste)
    CREATE TABLE IF NOT EXISTS thematic_areas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT
    );

    -- Table for Kenyan Counties
    CREATE TABLE IF NOT EXISTS counties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      population INTEGER,
      thematic_area_id INTEGER,
      FOREIGN KEY (thematic_area_id) REFERENCES thematic_areas (id)
    );

    -- Table for publications and reports
    CREATE TABLE IF NOT EXISTS publications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT,
      summary TEXT,
      filename TEXT,
      file_blob BLOB -- Stores the file content (binary large object)
    );

    -- Table for application users
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        organisation TEXT,
        phoneNumber TEXT,
        position TEXT,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Table to store annual county performance scores for specific sectors
    CREATE TABLE IF NOT EXISTS county_performance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      county_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      sector TEXT NOT NULL CHECK(sector IN ('water', 'waste')),
      overall_score REAL,
      sector_score REAL,
      governance REAL,
      mrv REAL,
      mitigation REAL,
      adaptation REAL,
      finance REAL,
      indicators_json TEXT, -- JSON string to store scores for individual indicators
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP, 
      FOREIGN KEY (county_id) REFERENCES counties (id),
      UNIQUE(county_id, year, sector) -- Ensures only one performance entry per county, year, and sector
    );

    -- Table to define the scoring indicators used for the index
    CREATE TABLE IF NOT EXISTS indicators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sector TEXT NOT NULL CHECK(sector IN ('water', 'waste')),
    thematic_area TEXT NOT NULL,
    indicator_text TEXT NOT NULL,
    weight REAL NOT NULL DEFAULT 10,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sector, indicator_text)
  );

  -- Initial data insertion for indicators based on the NDC Index document
  INSERT OR IGNORE INTO indicators (sector, thematic_area, indicator_text, weight) VALUES
    -- WATER SECTOR INDICATORS (Default Weight 10)
    
    -- Governance
    ('water', 'Governance', 'Existence of relevant sector policy aligned with NDCs, county action plan or sectoral climate strategy, institution involved in climate governance.', 10),
    ('water', 'Governance', '% of staff trained in climate-related planning.', 10),
    ('water', 'Governance', 'Inclusion of climate targets in county performance contracts', 10),
    ('water', 'Governance', 'Inclusion of climate goals into County Integrated Development Plan (CIDP).', 10),
    ('water', 'Governance', 'Stakeholder participation mechanism established (public forums, workshops).', 10),
    ('water', 'Governance', 'Coordination mechanism established (committees, MoUs)', 10),
    
    -- MRV (Monitoring, Reporting & Verification)
    ('water', 'MRV', 'Existence of MRV system for NDC tracking', 10),
    ('water', 'MRV', 'Frequency of data updates (Annually/Monthly)', 10),
    ('water', 'MRV', '% of indicators with available data', 10),
    ('water', 'MRV', 'Sector emission inventories available', 10),
    ('water', 'MRV', 'County submits climate reports to national MRV system', 10),
    ('water', 'MRV', 'Verification mechanism in place', 10),
    
    -- Mitigation
    ('water', 'Mitigation', 'GHG emission reduction target exists', 10),
    ('water', 'Mitigation', 'Annual GHG reduction achieved (%)', 10),
    ('water', 'Mitigation', 'Renewable energy share in sector (%)', 10),
    ('water', 'Mitigation', '% of climate projects focused on mitigation', 10),
    
    -- Adaptation & Resilience
    ('water', 'Adaptation & Resilience', 'Climate risk assessment conducted', 10),
    ('water', 'Adaptation & Resilience', '% population with climate-resilient infrastructure access', 10),
    ('water', 'Adaptation & Resilience', 'Number of early warning systems operational', 10),
    ('water', 'Adaptation & Resilience', 'Ecosystem restoration area covered (Hectares)', 10),
    ('water', 'Adaptation & Resilience', '% of vulnerable communities supported', 10),
    ('water', 'Adaptation & Resilience', 'Drought/flood response protocols in place', 10),
    
    -- Finance & Resource Mobilization
    ('water', 'Finance & Resource Mobilization', 'Climate budget line exists', 10),
    ('water', 'Finance & Resource Mobilization', 'Disaster risk reduction budget allocation (KES)', 10),
    ('water', 'Finance & Resource Mobilization', '% of county budget allocated to climate actions', 10),
    ('water', 'Finance & Resource Mobilization', 'Amount of climate finance mobilized (donors, PPPs) (KES)', 10),
    ('water', 'Finance & Resource Mobilization', 'Access to international climate finance (GCF, Adaptation Fund, etc.)', 10),
    ('water', 'Finance & Resource Mobilization', 'Private sector participation in climate action', 10),
    ('water', 'Finance & Resource Mobilization', 'Budget absorption rate (allocated vs. spent) (%)', 10),
    ('water', 'Finance & Resource Mobilization', 'Financial reporting system aligned with NDC tracking', 10),

    -- WASTE SECTOR INDICATORS (Default Weight 10)
    
    -- Governance
    ('waste', 'Governance', 'Existence of relevant sector policy aligned with NDCs, county action plan or sectoral climate strategy, institution involved in climate governance.', 10),
    ('waste', 'Governance', '% of staff trained in climate-related planning.', 10),
    ('waste', 'Governance', 'Inclusion of climate targets in county performance contracts', 10),
    ('waste', 'Governance', 'Inclusion of climate goals into County Integrated Development Plan (CIDP).', 10),
    ('waste', 'Governance', 'Stakeholder participation mechanism established (public forums, workshops).', 10),
    ('waste', 'Governance', 'Coordination mechanism established (committees, MoUs)', 10),

    -- MRV (Monitoring, Reporting & Verification)
    ('waste', 'MRV', 'Existence of MRV system for NDC tracking', 10),
    ('waste', 'MRV', 'Frequency of data updates (Annually/Monthly)', 10),
    ('waste', 'MRV', '% of indicators with available data', 10),
    ('waste', 'MRV', 'Sector emission inventories available', 10),
    ('waste', 'MRV', 'County submits climate reports to national MRV system', 10),
    ('waste', 'MRV', 'Verification mechanism in place', 10),

    -- Mitigation
    ('waste', 'Mitigation', 'GHG emission reduction target exists', 10),
    ('waste', 'Mitigation', 'Annual GHG reduction achieved (%)', 10),
    ('waste', 'Mitigation', 'Renewable energy share in sector (%)', 10),
    ('waste', 'Mitigation', 'Waste diverted from landfill (%)', 10),
    ('waste', 'Mitigation', '% of climate projects focused on mitigation', 10),
    ('waste', 'Mitigation', 'Use of methane capture systems (e.g., biogas, flaring)', 10),
    ('waste', 'Mitigation', 'Circular economy initiatives adopted', 10),

    -- Adaptation & Resilience (Reusing water indicators where waste specific ones are missing, based on general climate resilience)
    ('waste', 'Adaptation & Resilience', 'Climate risk assessment conducted', 10),
    ('waste', 'Adaptation & Resilience', '% population with climate-resilient infrastructure access', 10),
    ('waste', 'Adaptation & Resilience', 'Number of early warning systems operational', 10),
    ('waste', 'Adaptation & Resilience', 'Ecosystem restoration area covered (Hectares)', 10),
    ('waste', 'Adaptation & Resilience', '% of vulnerable communities supported', 10),
    ('waste', 'Adaptation & Resilience', 'Drought/flood response protocols in place', 10),
    
    -- Finance & Resource Mobilization
    ('waste', 'Finance & Resource Mobilization', 'Climate budget line exists', 10),
    ('waste', 'Finance & Resource Mobilization', 'Disaster risk reduction budget allocation (KES)', 10),
    ('waste', 'Finance & Resource Mobilization', '% of county budget allocated to climate actions', 10),
    ('waste', 'Finance & Resource Mobilization', 'Amount of climate finance mobilized (donors, PPPs) (KES)', 10),
    ('waste', 'Finance & Resource Mobilization', 'Access to international climate finance (GCF, Adaptation Fund, etc.)', 10),
    ('waste', 'Finance & Resource Mobilization', 'Private sector participation in climate action', 10),
    ('waste', 'Finance & Resource Mobilization', 'Budget absorption rate (allocated vs. spent) (%)', 10),
    ('waste', 'Finance & Resource Mobilization', 'Financial reporting system aligned with NDC tracking', 10);
  `);

  return db;
}
