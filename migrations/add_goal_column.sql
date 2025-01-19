-- Add goal column to users table
ALTER TABLE users 
ADD COLUMN goal TEXT;

-- Set default values for existing users
UPDATE users 
SET goal = 'stay-fit' 
WHERE goal IS NULL;
