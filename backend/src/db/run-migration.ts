/**
 * 数据库迁移脚本运行器
 * 用于在部署时自动运行数据库迁移
 * 
 * 使用方法：
 * ts-node src/db/run-migration.ts
 * 或
 * npm run migrate
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { getDbPool } from '../config/db'

async function runMigration() {
  try {
    console.log('开始运行数据库迁移...')
    
    const pool = getDbPool()
    const migrationSQL = readFileSync(
      join(__dirname, 'migrate-stats.sql'),
      'utf-8'
    )

    // 执行迁移 SQL
    await pool.query(migrationSQL)
    
    console.log('✅ 数据库迁移完成！')
    process.exit(0)
  } catch (error) {
    console.error('❌ 数据库迁移失败:', error)
    process.exit(1)
  }
}

runMigration()

