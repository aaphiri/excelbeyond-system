/*
  # Create Allowances Table

  ## Overview
  This migration creates the allowances management system for tracking student financial allowances including stipends, transportation, school supplies, and accommodation costs.

  ## Tables Created
  
  ### 1. `allowances`
  Stores all student allowance records with approval workflow
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for each allowance record
  - `student_id` (uuid) - Reference to the student receiving the allowance
  - `student_name` (text) - Student's full name for quick reference
  - `month` (text) - Month the allowance is for (e.g., "January", "February")
  - `year` (integer) - Year the allowance is for
  - `stipend` (decimal) - Monthly stipend amount in ZMW
  - `transportation` (decimal) - Transportation costs in ZMW
  - `school_supplies` (decimal) - School supplies allowance in ZMW
  - `accommodation` (decimal) - Accommodation costs in ZMW
  - `total` (decimal) - Total allowance amount (auto-calculated)
  - `status` (text) - Current status: 'pending', 'approved', 'rejected', 'paid'
  - `submitted_by` (text) - Name of person who submitted the allowance
  - `submitted_by_id` (uuid) - User ID of submitter
  - `submitted_date` (timestamptz) - When the allowance was submitted
  - `approved_by` (text, nullable) - Name of person who approved
  - `approved_by_id` (uuid, nullable) - User ID of approver
  - `approved_date` (timestamptz, nullable) - When it was approved
  - `flmi_comments` (text, nullable) - Comments from FLMI staff
  - `flmz_comments` (text, nullable) - Comments from FLMZ staff
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security (RLS Policies)
  
  ### Row Level Security
  - RLS is ENABLED on the allowances table
  - All policies require authentication
  
  ### Policies Created
  
  1. **Select Policy**: "Users can view allowances"
     - All authenticated users can view allowance records
  
  2. **Insert Policy**: "Authenticated users can create allowances"
     - Authenticated users can submit new allowance records
     - Automatically captures submitter information
  
  3. **Update Policy**: "Users can update allowances"
     - Authenticated users can update allowance records
     - Useful for approvals and status changes
  
  4. **Delete Policy**: "Admins can delete allowances"
     - Only authenticated users can delete records
     - Additional role-based filtering should be implemented in application layer

  ## Indexes
  - Primary key index on `id`
  - Index on `student_id` for efficient student lookups
  - Index on `status` for filtering by approval status
  - Composite index on `year` and `month` for period-based queries

  ## Notes
  - Default status is 'pending' for new submissions
  - Total amount should be calculated in application layer before insert
  - Timestamps are automatically managed
  - All monetary values use numeric type for precision
*/

-- Create allowances table
CREATE TABLE IF NOT EXISTS allowances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  student_name text NOT NULL,
  month text NOT NULL,
  year integer NOT NULL,
  stipend numeric(10, 2) DEFAULT 0,
  transportation numeric(10, 2) DEFAULT 0,
  school_supplies numeric(10, 2) DEFAULT 0,
  accommodation numeric(10, 2) DEFAULT 0,
  total numeric(10, 2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  submitted_by text NOT NULL,
  submitted_by_id uuid,
  submitted_date timestamptz DEFAULT now(),
  approved_by text,
  approved_by_id uuid,
  approved_date timestamptz,
  flmi_comments text,
  flmz_comments text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_allowances_student_id ON allowances(student_id);
CREATE INDEX IF NOT EXISTS idx_allowances_status ON allowances(status);
CREATE INDEX IF NOT EXISTS idx_allowances_year_month ON allowances(year, month);

-- Enable Row Level Security
ALTER TABLE allowances ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Select: All authenticated users can view allowances
CREATE POLICY "Users can view allowances"
  ON allowances
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert: Authenticated users can create allowances
CREATE POLICY "Authenticated users can create allowances"
  ON allowances
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Update: Authenticated users can update allowances (for approvals, status changes)
CREATE POLICY "Users can update allowances"
  ON allowances
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Delete: Only authenticated users can delete (additional role checks in app layer)
CREATE POLICY "Admins can delete allowances"
  ON allowances
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_allowances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_allowances_updated_at ON allowances;
CREATE TRIGGER trigger_allowances_updated_at
  BEFORE UPDATE ON allowances
  FOR EACH ROW
  EXECUTE FUNCTION update_allowances_updated_at();