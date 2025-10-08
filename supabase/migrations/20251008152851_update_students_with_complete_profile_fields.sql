/*
  # Update Students Table with Complete Profile Fields

  1. New Columns Added
    - Guardian Information:
      - `guardian_relationship` (text) - Relationship with guardian
    
    - Accommodation Information:
      - `accommodation_type` (text) - Type of accommodation
      - `accommodation_monthly_rent` (numeric) - Monthly rent amount
      - `accommodation_payment_method` (text) - Payment method
      - `accommodation_address` (text) - Address
      - `accommodation_landlord_name` (text) - Landlord name
      - `accommodation_landlord_contact` (text) - Landlord contact
    
    - Digital Resources:
      - `laptop_plan` (text) - Laptop plan: rent_to_return or rent_to_own
      - `laptop_serial_number` (text) - Laptop serial number
      - `laptop_monthly_deduction` (numeric) - Monthly deduction for rent to own
      - `laptop_inspection_date` (date) - For rent to return
      - `laptop_submission_date` (date) - For rent to return
      - `laptop_collection_date` (date) - For rent to return
    
    - Profile:
      - `profile_photo_url` (text) - URL to profile photo

  2. Notes
    - All new fields are optional to maintain backward compatibility
    - Laptop monthly deduction will be used to calculate adjusted stipend
    - Accommodation types: institution_hostel, boarding_house, self_paying, other
    - Laptop plans: rent_to_return, rent_to_own
*/

DO $$
BEGIN
  -- Guardian Information
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'guardian_relationship'
  ) THEN
    ALTER TABLE students ADD COLUMN guardian_relationship text;
  END IF;

  -- Accommodation Information
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'accommodation_type'
  ) THEN
    ALTER TABLE students ADD COLUMN accommodation_type text CHECK (accommodation_type IN ('institution_hostel', 'boarding_house', 'self_paying', 'other'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'accommodation_monthly_rent'
  ) THEN
    ALTER TABLE students ADD COLUMN accommodation_monthly_rent numeric(10, 2) DEFAULT 0.00;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'accommodation_payment_method'
  ) THEN
    ALTER TABLE students ADD COLUMN accommodation_payment_method text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'accommodation_address'
  ) THEN
    ALTER TABLE students ADD COLUMN accommodation_address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'accommodation_landlord_name'
  ) THEN
    ALTER TABLE students ADD COLUMN accommodation_landlord_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'accommodation_landlord_contact'
  ) THEN
    ALTER TABLE students ADD COLUMN accommodation_landlord_contact text;
  END IF;

  -- Digital Resources
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'laptop_plan'
  ) THEN
    ALTER TABLE students ADD COLUMN laptop_plan text CHECK (laptop_plan IN ('rent_to_return', 'rent_to_own', 'none'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'laptop_serial_number'
  ) THEN
    ALTER TABLE students ADD COLUMN laptop_serial_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'laptop_monthly_deduction'
  ) THEN
    ALTER TABLE students ADD COLUMN laptop_monthly_deduction numeric(10, 2) DEFAULT 0.00;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'laptop_inspection_date'
  ) THEN
    ALTER TABLE students ADD COLUMN laptop_inspection_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'laptop_submission_date'
  ) THEN
    ALTER TABLE students ADD COLUMN laptop_submission_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'laptop_collection_date'
  ) THEN
    ALTER TABLE students ADD COLUMN laptop_collection_date date;
  END IF;

  -- Profile Photo
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'profile_photo_url'
  ) THEN
    ALTER TABLE students ADD COLUMN profile_photo_url text;
  END IF;
END $$;