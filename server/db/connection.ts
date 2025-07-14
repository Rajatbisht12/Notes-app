import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();


const databaseUrl = process.env.DATABASE_URL || "";
if (!databaseUrl) {
  throw new Error("❌ DATABASE_URL not set in .env file or not loaded");
}

const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
