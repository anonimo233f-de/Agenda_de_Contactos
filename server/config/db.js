import pg from 'pg'
import 'dotenv/config'

const { Pool } = pg

export const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
    })
  : null

let isConnected = false

export async function checkDbConnection() {
  if (!pool) return false
  try {
    const client = await pool.connect()
    client.release()
    isConnected = true
    return true
  } catch (error) {
    isConnected = false
    console.warn('PostgreSQL no disponible, usando almacenamiento en memoria:', error.message)
    return false
  }
}

export function isDbConnected() {
  return isConnected
}

