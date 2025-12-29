import dotenv from 'dotenv'

dotenv.config()

interface Config {
  PORT: number
  NODE_ENV: string
  DATABASE_URL: string
  LLM_API_KEY?: string
  LLM_API_URL?: string
  DASHSCOPE_API_KEY?: string
  LLM_MODEL?: string
  JWT_SECRET: string
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key]
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is not set`)
  }
  return value || defaultValue!
}

export const config: Config = {
  PORT: parseInt(getEnvVar('PORT', '4000'), 10),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  DATABASE_URL: getEnvVar('DATABASE_URL', 'postgresql://localhost:5432/easyjob'),
  LLM_API_KEY: process.env.LLM_API_KEY,
  LLM_API_URL: process.env.LLM_API_URL,
  DASHSCOPE_API_KEY: process.env.DASHSCOPE_API_KEY,
  LLM_MODEL: process.env.LLM_MODEL || 'qwen-plus',
  JWT_SECRET: getEnvVar('JWT_SECRET', 'your-secret-key-change-in-production'),
}

