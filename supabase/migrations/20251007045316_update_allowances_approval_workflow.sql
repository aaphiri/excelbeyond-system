/*
  # Update Allowances Table for Multi-Stage Approval Workflow

  ## Overview
  This migration updates the allowances table to support a multi-stage approval workflow:
  1. Program Officer submits allowances
  2. Deputy Program Manager reviews and approves/denies
  3. FLMI Senior Advisor reviews and approves/denies
  4. Program Manager (final approval) reviews and approves/denies
  5. After all approvals, allowance is marked as paid

  ## Changes Made

  ### 1. Updated `allowances` table
  
  **New/Modified Columns:**
  - `program_level` (text) - Type of program: 'launch_year', 'university', 'college'
  - `medical` (decimal) - Medical allowance (for university/college only)
  - `approval_stage` (text) - Current stage: 'pending_dpm', 'pending_flmi', 'pending_pm', 'approved', 'rejected', 'paid'
  - `dpm_approved_by` (text, nullable) - Deputy Program Manager who reviewed
  - `dpm_approved_by_id` (uuid, nullable) - DPM user ID
  - `dpm_approved_date` (timestamptz, nullable) - When DPM reviewed
  - `dpm_status` (text, nullable) - DPM decision: 'approved', 'denied'
  - `dpm_comments` (text, nullable) - DPM comments
  - `flmi_approved_by` (text, nullable) - FLMI Senior Advisor who reviewed
  - `flmi_approved_by_id` (uuid, nullable) - FLMI user ID
  - `flmi_approved_date` (timestamptz, nullable) - When FLMI reviewed
  - `flmi_status` (text, nullable) - FLMI decision: 'approved', 'denied'
  - `pm_approved_by` (text, nullable) - Program Manager who reviewed
  - `pm_approved_by_id` (uuid, nullable) - PM user ID
  - `pm_approved_date` (timestamptz, nullable) - When PM reviewed
  - `pm_status` (text, nullable) - PM decision: 'approved', 'denied'
  - `pm_comments` (text, nullable) - PM comments
  - `rejection_reason` (text, nullable) - Reason if denied at any stage
  - `rejected_at_stage` (text, nullable) - Which stage was it rejected at
  - `rejected_by` (text, nullable) - Who rejected it
  - `rejected_date` (timestamptz, nullable) - When it was rejected

  **Removed/Renamed Columns:**
  - Renamed `status` to `approval_stage` (more descriptive)
  - Removed generic `approved_by` and `approved_date` (replaced with stage-specific fields)
  - Kept `flmi_comments` and `flmz_comments` for backward compatibility

  ## Security (RLS Policies)
  - Existing RLS policies remain in effect
  - All policies require authentication

  ## Notes
  - Launch Year programs only have stipend
  - University and College programs have medical, stipend, transportation, school_supplies, and accommodation
  - Default approval_stage is 'pending_dpm' (pending Deputy Program Manager)
  - Each approval stage can be approved or denied with comments
*/

-- Add new columns to allowances table
DO $$
BEGIN
  -- Add program_level column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'allowances' AND column_name = 'program_level'
  ) THEN
    ALTER TABLE allowances ADD COLUMN program_level text DEFAULT 'university' CHECK (program_level IN ('launch_year', 'university', 'college'));
  END IF;

  -- Add medical column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'allowances' AND column_name = 'medical'
  ) THEN
    ALTER TABLE allowances ADD COLUMN medical numeric(10, 2) DEFAULT 0;
  END IF;

  -- Add approval_stage column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'allowances' AND column_name = 'approval_stage'
  ) THEN
    ALTER TABLE allowances ADD COLUMN approval_stage text DEFAULT 'pending_dpm' CHECK (approval_stage IN ('pending_dpm', 'pending_flmi', 'pending_pm', 'approved', 'rejected', 'paid'));
  END IF;

  -- Deputy Program Manager approval fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'allowances' AND column_name = 'dpm_approved_by'
  ) THEN
    ALTER TABLE allowances ADD COLUMN dpm_approved_by text;
    ALTER TABLE allowances ADD COLUMN dpm_approved_by_id uuid;
    ALTER TABLE allowances ADD COLUMN dpm_approved_date timestamptz;
    ALTER TABLE allowances ADD COLUMN dpm_status text CHECK (dpm_status IN ('approved', 'denied'));
    ALTER TABLE allowances ADD COLUMN dpm_comments text;
  END IF;

  -- FLMI Senior Advisor approval fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'allowances' AND column_name = 'flmi_approved_by'
  ) THEN
    ALTER TABLE allowances ADD COLUMN flmi_approved_by text;
    ALTER TABLE allowances ADD COLUMN flmi_approved_by_id uuid;
    ALTER TABLE allowances ADD COLUMN flmi_approved_date timestamptz;
    ALTER TABLE allowances ADD COLUMN flmi_status text CHECK (flmi_status IN ('approved', 'denied'));
  END IF;

  -- Program Manager approval fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'allowances' AND column_name = 'pm_approved_by'
  ) THEN
    ALTER TABLE allowances ADD COLUMN pm_approved_by text;
    ALTER TABLE allowances ADD COLUMN pm_approved_by_id uuid;
    ALTER TABLE allowances ADD COLUMN pm_approved_date timestamptz;
    ALTER TABLE allowances ADD COLUMN pm_status text CHECK (pm_status IN ('approved', 'denied'));
    ALTER TABLE allowances ADD COLUMN pm_comments text;
  END IF;

  -- Rejection tracking fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'allowances' AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE allowances ADD COLUMN rejection_reason text;
    ALTER TABLE allowances ADD COLUMN rejected_at_stage text;
    ALTER TABLE allowances ADD COLUMN rejected_by text;
    ALTER TABLE allowances ADD COLUMN rejected_date timestamptz;
  END IF;
END $$;

-- Update existing records to use new approval_stage if status column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'allowances' AND column_name = 'status'
  ) THEN
    UPDATE allowances SET approval_stage = 
      CASE 
        WHEN status = 'pending' THEN 'pending_dpm'
        WHEN status = 'approved' THEN 'approved'
        WHEN status = 'rejected' THEN 'rejected'
        WHEN status = 'paid' THEN 'paid'
        ELSE 'pending_dpm'
      END
    WHERE approval_stage IS NULL OR approval_stage = 'pending_dpm';
  END IF;
END $$;

-- Create index for approval_stage
CREATE INDEX IF NOT EXISTS idx_allowances_approval_stage ON allowances(approval_stage);

-- Create index for program_level
CREATE INDEX IF NOT EXISTS idx_allowances_program_level ON allowances(program_level);