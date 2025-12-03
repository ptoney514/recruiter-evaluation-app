import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { join } from 'path';

// Database file location - relative to project root
const DB_PATH = join(process.cwd(), 'data', 'recruiter.db');

// Create database connection
const sqlite = new Database(DB_PATH);

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

// Export drizzle instance with schema
export const db = drizzle(sqlite, { schema });

// Export raw sqlite connection for advanced use cases
export { sqlite };

// Export schema for use in queries
export * from './schema';
