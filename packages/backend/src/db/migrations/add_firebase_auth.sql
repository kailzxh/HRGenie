<<<<<<< HEAD
-- Add Firebase UID column to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128) UNIQUE;

-- Add indexes for Firebase UID
=======
-- Add Firebase UID column to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128) UNIQUE;

-- Add indexes for Firebase UID
>>>>>>> 225ed5384cf9eebf7cee947b068a57b523c6c838
CREATE INDEX IF NOT EXISTS idx_employees_firebase_uid ON employees(firebase_uid);