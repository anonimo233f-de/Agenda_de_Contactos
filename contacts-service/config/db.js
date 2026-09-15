@ -1,15 +1,35 @@
import pg from 'pg'
import 'dotenv/config'

const { Pool } = pg

export const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
const connectionString = process.env.DATABASE_URL;
const hasIndividualConfig = process.env.DB_HOST || process.env.PGHOST;

const isLocalhost = (connectionString && connectionString.includes('localhost')) ||
  (process.env.DB_HOST === 'localhost' || process.env.PGHOST === 'localhost' || process.env.DB_HOST === '127.0.0.1');

const poolConfig = connectionString
  ? {
      connectionString,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    })
  : null
    }
  : hasIndividualConfig
  ? {
      host: process.env.DB_HOST || process.env.PGHOST,
      port: Number(process.env.DB_PORT || process.env.PGPORT || 5432),
      user: process.env.DB_USER || process.env.PGUSER,
      password: process.env.DB_PASSWORD || process.env.PGPASSWORD,
      database: process.env.DB_NAME || process.env.PGDATABASE,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    }
  : null;

export const pool = poolConfig ? new Pool(poolConfig) : null;

let isConnected = false

