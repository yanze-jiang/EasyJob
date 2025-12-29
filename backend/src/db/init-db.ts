import { getDbPool } from '../config/db'

async function initDatabase() {
  const pool = getDbPool()

  try {
    // 创建用户表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // 创建索引
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `)

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `)

    console.log('✅ 数据库表初始化成功！')
  } catch (error) {
    console.error('❌ 数据库表初始化失败:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// 如果直接运行此文件，执行初始化
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('数据库初始化完成')
      process.exit(0)
    })
    .catch((error) => {
      console.error('数据库初始化失败:', error)
      process.exit(1)
    })
}

export default initDatabase

