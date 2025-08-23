-- Migration: Add tags column to projects table
-- Execute this in Supabase SQL Editor to add the missing tags column

-- Add tags column to projects table
ALTER TABLE projects 
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Add tags column to conversations table (if needed)
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add tags column to custom_bots table (if needed)  
ALTER TABLE custom_bots
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add tags column to generated_images table (if needed)
ALTER TABLE generated_images
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Optional: Create index on tags for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_tags ON projects USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_conversations_tags ON conversations USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_custom_bots_tags ON custom_bots USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_generated_images_tags ON generated_images USING GIN(tags);

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'projects' 
  AND column_name = 'tags';