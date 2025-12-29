import { getDbPool } from '../config/db'

export interface UserStats {
  projectsPolished: number
  cvsEdited: number
  coverLettersGenerated: number
  totalTokensUsed: number
}

/**
 * 获取用户统计数据
 */
export async function getUserStats(userId: string): Promise<UserStats | null> {
  const pool = getDbPool()
  const result = await pool.query(
    `SELECT 
      projects_polished,
      cvs_edited,
      cover_letters_generated,
      total_tokens_used
    FROM users 
    WHERE id = $1`,
    [userId]
  )

  if (result.rows.length === 0) {
    return null
  }

  const row = result.rows[0]
  return {
    projectsPolished: row.projects_polished || 0,
    cvsEdited: row.cvs_edited || 0,
    coverLettersGenerated: row.cover_letters_generated || 0,
    totalTokensUsed: Number(row.total_tokens_used) || 0,
  }
}

/**
 * 增加项目润色计数
 */
export async function incrementProjectsPolished(userId: string): Promise<void> {
  const pool = getDbPool()
  await pool.query(
    'UPDATE users SET projects_polished = projects_polished + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
    [userId]
  )
}

/**
 * 增加简历编辑计数
 */
export async function incrementCvsEdited(userId: string): Promise<void> {
  const pool = getDbPool()
  await pool.query(
    'UPDATE users SET cvs_edited = cvs_edited + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
    [userId]
  )
}

/**
 * 增加求职信生成计数
 */
export async function incrementCoverLettersGenerated(userId: string): Promise<void> {
  const pool = getDbPool()
  await pool.query(
    'UPDATE users SET cover_letters_generated = cover_letters_generated + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
    [userId]
  )
}

/**
 * 增加token使用量
 */
export async function addTokensUsed(userId: string, tokens: number): Promise<void> {
  if (tokens <= 0) return
  
  const pool = getDbPool()
  await pool.query(
    'UPDATE users SET total_tokens_used = total_tokens_used + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [tokens, userId]
  )
}

