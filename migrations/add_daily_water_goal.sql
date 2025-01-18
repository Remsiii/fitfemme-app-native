-- Add daily_water_goal_ml column to users table
ALTER TABLE users 
ADD COLUMN daily_water_goal_ml INTEGER DEFAULT 2000;

-- Update existing users to have the default goal of 2000ml
UPDATE users 
SET daily_water_goal_ml = 2000 
WHERE daily_water_goal_ml IS NULL;
