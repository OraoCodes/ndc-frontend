
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function setupDatabase() {
  const db = await open({
    filename: './ndc.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS thematic_areas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS counties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      population INTEGER,
      thematic_area_id INTEGER,
      FOREIGN KEY (thematic_area_id) REFERENCES thematic_areas (id)
    );

    CREATE TABLE IF NOT EXISTS publications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT,
      summary TEXT,
      filename TEXT,
      file_blob BLOB
    );

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
      indicators_json TEXT, 
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP, 
      FOREIGN KEY (county_id) REFERENCES counties (id),
      UNIQUE(county_id, year, sector)
    );
  `);

  return db;
}
