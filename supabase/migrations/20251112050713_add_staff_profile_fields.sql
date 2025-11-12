/*
  # Add Staff Profile Fields

  1. Changes
    - Add first_name, middle_name, last_name fields (split from name)
    - Add gender field
    - Add username field for login
    - Add profile_photo_url field
    - Add account_status field (active, inactive, pending_verification, suspended)
    - Keep existing name field for backward compatibility
    - Update indexes for new fields

  2. Security
    - All fields follow existing RLS policies
    - Gender uses check constraint
    - Account status uses check constraint
*/

-- Add new profile fields
DO $$
BEGIN
  -- Add first_name if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE staff ADD COLUMN first_name text;
  END IF;

  -- Add middle_name if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff' AND column_name = 'middle_name'
  ) THEN
    ALTER TABLE staff ADD COLUMN middle_name text;
  END IF;

  -- Add last_name if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE staff ADD COLUMN last_name text;
  END IF;

  -- Add gender if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff' AND column_name = 'gender'
  ) THEN
    ALTER TABLE staff ADD COLUMN gender text;
  END IF;

  -- Add username if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff' AND column_name = 'username'
  ) THEN
    ALTER TABLE staff ADD COLUMN username text;
  END IF;

  -- Add profile_photo_url if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff' AND column_name = 'profile_photo_url'
  ) THEN
    ALTER TABLE staff ADD COLUMN profile_photo_url text;
  END IF;

  -- Add account_status if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff' AND column_name = 'account_status'
  ) THEN
    ALTER TABLE staff ADD COLUMN account_status text DEFAULT 'active';
  END IF;
END $$;

-- Add check constraints
DO $$
BEGIN
  -- Gender constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'staff_gender_check'
  ) THEN
    ALTER TABLE staff ADD CONSTRAINT staff_gender_check 
      CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'));
  END IF;

  -- Account status constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'staff_account_status_check'
  ) THEN
    ALTER TABLE staff ADD CONSTRAINT staff_account_status_check 
      CHECK (account_status IN ('active', 'inactive', 'pending_verification', 'suspended'));
  END IF;
END $$;

-- Add unique constraint on username
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'staff_username_unique'
  ) THEN
    ALTER TABLE staff ADD CONSTRAINT staff_username_unique UNIQUE (username);
  END IF;
END $$;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_staff_first_name ON staff(first_name);
CREATE INDEX IF NOT EXISTS idx_staff_last_name ON staff(last_name);
CREATE INDEX IF NOT EXISTS idx_staff_username ON staff(username);
CREATE INDEX IF NOT EXISTS idx_staff_account_status ON staff(account_status);
