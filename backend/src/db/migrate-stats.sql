-- 迁移脚本：为现有用户表添加统计字段
-- 如果字段已存在，则不会报错（使用 IF NOT EXISTS 逻辑）

-- 添加统计字段（如果不存在）
DO $$ 
BEGIN
  -- 添加 projects_polished 字段
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'projects_polished'
  ) THEN
    ALTER TABLE users ADD COLUMN projects_polished INTEGER DEFAULT 0;
  END IF;

  -- 添加 cvs_edited 字段
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'cvs_edited'
  ) THEN
    ALTER TABLE users ADD COLUMN cvs_edited INTEGER DEFAULT 0;
  END IF;

  -- 添加 cover_letters_generated 字段
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'cover_letters_generated'
  ) THEN
    ALTER TABLE users ADD COLUMN cover_letters_generated INTEGER DEFAULT 0;
  END IF;

  -- 添加 total_tokens_used 字段
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'total_tokens_used'
  ) THEN
    ALTER TABLE users ADD COLUMN total_tokens_used BIGINT DEFAULT 0;
  END IF;
END $$;

-- 更新现有用户的统计字段为默认值 0（如果为 NULL）
UPDATE users 
SET 
  projects_polished = COALESCE(projects_polished, 0),
  cvs_edited = COALESCE(cvs_edited, 0),
  cover_letters_generated = COALESCE(cover_letters_generated, 0),
  total_tokens_used = COALESCE(total_tokens_used, 0)
WHERE 
  projects_polished IS NULL 
  OR cvs_edited IS NULL 
  OR cover_letters_generated IS NULL 
  OR total_tokens_used IS NULL;

