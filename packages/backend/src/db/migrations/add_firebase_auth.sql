-- Add Firebase UID column to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128) UNIQUE;

-- Add indexes for Firebase UID
CREATE INDEX IF NOT EXISTS idx_employees_firebase_uid ON employees(firebase_uid);