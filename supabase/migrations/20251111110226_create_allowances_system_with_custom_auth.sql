/*
  # Create Allowances System with Custom Authentication

  1. Tables Created
    - `allowances` - Main allowances table with multi-stage approval workflow
    - `allowance_comments` - Comments and audit trail for allowances
  
  2. Allowances Table Columns
    - Basic Info: student_id, student_name, month, year, program_level
    - Financial: stipend, medical, transportation, school_supplies, accommodation, total
    - Workflow: approval_stage, submitted_by, submitted_date
    - DPM Approval: dpm_approved_by, dpm_status, dpm_comments, dpm_approved_date
    - FLMI Approval: flmi_approved_by, flmi_status, flmi_comments, flmi_approved_date
    - PM Approval: pm_approved_by, pm_status, pm_comments, pm_approved_date
    - Rejection: rejection_reason, rejected_at_stage, rejected_by, rejected_date
  
  3. Security
    - RLS enabled on both tables
    - Policies allow public access (custom auth at application level)
    - This matches the pattern used for students table
*/

-- Create allowances table
CREATE TABLE IF NOT EXISTS allowances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  student_name text NOT NULL,
  month text NOT NULL,
  year integer NOT NULL,
  program_level text DEFAULT 'university' CHECK (program_level IN ('launch_year', 'university', 'college')),
  stipend numeric(10, 2) DEFAULT 0,
  medical numeric(10, 2) DEFAULT 0,
  transportation numeric(10, 2) DEFAULT 0,
  school_supplies numeric(10, 2) DEFAULT 0,
  accommodation numeric(10, 2) DEFAULT 0,
  total numeric(10, 2) NOT NULL,
  approval_stage text DEFAULT 'pending_dpm' CHECK (approval_stage IN ('pending_dpm', 'pending_flmi', 'pending_pm', 'approved', 'rejected', 'paid')),
  submitted_by text NOT NULL,
  submitted_by_id uuid,
  submitted_date timestamptz DEFAULT now(),
  dpm_approved_by text,
  dpm_approved_by_id uuid,
  dpm_approved_date timestamptz,
  dpm_status text CHECK (dpm_status IN ('approved', 'denied')),
  dpm_comments text,
  flmi_approved_by text,
  flmi_approved_by_id uuid,
  flmi_approved_date timestamptz,
  flmi_status text CHECK (flmi_status IN ('approved', 'denied')),
  flmi_comments text,
  pm_approved_by text,
  pm_approved_by_id uuid,
  pm_approved_date timestamptz,
  pm_status text CHECK (pm_status IN ('approved', 'denied')),
  pm_comments text,
  rejection_reason text,
  rejected_at_stage text,
  rejected_by text,
  rejected_date timestamptz,
  flmz_comments text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create allowance_comments table
CREATE TABLE IF NOT EXISTS allowance_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  allowance_id uuid NOT NULL,
  user_id uuid NOT NULL,
  user_name text NOT NULL,
  user_role text NOT NULL,
  action text NOT NULL,
  comment_text text,
  stage text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_allowances_student_id ON allowances(student_id);
CREATE INDEX IF NOT EXISTS idx_allowances_approval_stage ON allowances(approval_stage);
CREATE INDEX IF NOT EXISTS idx_allowances_program_level ON allowances(program_level);
CREATE INDEX IF NOT EXISTS idx_allowances_year_month ON allowances(year, month);
CREATE INDEX IF NOT EXISTS idx_allowance_comments_allowance_id ON allowance_comments(allowance_id);

-- Enable Row Level Security
ALTER TABLE allowances ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowance_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for allowances table (public access for custom auth)
CREATE POLICY "Allow all to view allowances"
ON allowances FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow all to create allowances"
ON allowances FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow all to update allowances"
ON allowances FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all to delete allowances"
ON allowances FOR DELETE
TO public
USING (true);

-- Create RLS Policies for allowance_comments table
CREATE POLICY "Allow all to view comments"
ON allowance_comments FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow all to create comments"
ON allowance_comments FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow all to update comments"
ON allowance_comments FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all to delete comments"
ON allowance_comments FOR DELETE
TO public
USING (true);

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
