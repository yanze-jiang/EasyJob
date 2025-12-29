import { Pool, PoolClient } from 'pg'
import { config } from './env'

let pool: Pool | null = null

export function getDbPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: config.DATABASE_URL,
      ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err)
    })
  }

  return pool
}

export async function getDbClient(): Promise<PoolClient> {
  const pool = getDbPool()
  return pool.connect()
}

export async function testConnection(): Promise<boolean> {
  try {
    const client = await getDbClient()
    await client.query('SELECT NOW()')
    client.release()
    return true
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}

