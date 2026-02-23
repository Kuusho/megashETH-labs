/**
 * Database Connection - Vercel Postgres + Drizzle ORM
 */

import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql as sqlVercel } from '@vercel/postgres';
import * as schema from './schema';

// Initialize Drizzle with Vercel Postgres
export const db = drizzle(sqlVercel, { schema });

// Export schema for use in queries
export { schema };

// Export sql helper for raw queries if needed
export { sql } from 'drizzle-orm';
