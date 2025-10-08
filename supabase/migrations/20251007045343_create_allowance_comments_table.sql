/*
  # Create Allowance Comments Table

  ## Overview
  This migration creates a dedicated table for tracking all comments and actions taken on allowances
  throughout the approval workflow. This provides a complete audit trail.

  ## Tables Created
  
  ### 1. `allowance_comments`
  Stores all comments, approvals, denials, and actions on allowances
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier
  - `allowance_id` (uuid, foreign key) - Reference to the allowance
  - `user_id` (uuid) - ID of user making the comment
  - `user_name` (text) - Name of user making the comment
  - `user_role` (text) - Role of user: 'program_officer', 'deputy_manager', 'flmi_advisor', 'program_manager', 'admin'
  - `action` (text) - Action taken: 'comment', 'approved', 'denied', 'submitted', 'paid'
  - `comment_text` (text) - The actual comment
  - `stage` (text) - Stage where action occurred: 'submission', 'dpm_review', 'flmi_review', 'pm_review', 'payment'
  - `created_at` (timestamptz) - When comment was made

  ## Security (RLS Policies)
  
  ### Row Level Security
  - RLS is ENABLED on the allowance_comments table
  - All policies require authentication
  
  ### Policies Created
  
  1. **Select Policy**: "Authenticated users can view comments"
     - All authenticated users can view all comments
  
  2. **Insert Policy**: "Authenticated users can create comments"
     - Authenticated users can add comments

  ## Indexes
  - Primary key index on `id`
  - Index on `allowance_id` for efficient lookups
  - Index on `stage` for filtering by approval stage
  - Index on `created_at` for chronological sorting

  ## Notes
  - Provides complete audit trail of all actions
  - Comments are immutable once created (no update/delete policies)
  - Chronologically ordered by created_at
*/

-- Create allowance_comments table
CREATE TABLE IF NOT EXISTS allowance_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  allowance_id uuid NOT NULL,
  user_id uuid,
  user_name text NOT NULL,
  user_role text CHECK (user_role IN ('program_officer', 'deputy_manager', 'flmi_advisor', 'program_manager', 'admin')),
  action text NOT NULL CHECK (action IN ('comment', 'approved', 'denied', 'submitted', 'paid', 'revised')),
  comment_text text,
  stage text NOT NULL CHECK (stage IN ('submission', 'dpm_review', 'flmi_review', 'pm_review', 'payment')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_allowance_comments_allowance_id ON allowance_comments(allowance_id);
CREATE INDEX IF NOT EXISTS idx_allowance_comments_stage ON allowance_comments(stage);
CREATE INDEX IF NOT EXISTS idx_allowance_comments_created_at ON allowance_comments(created_at DESC);

-- Add foreign key constraint if allowances table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'allowances') THEN
    ALTER TABLE allowance_comments 
    ADD CONSTRAINT fk_allowance_comments_allowance 
    FOREIGN KEY (allowance_id) 
    REFERENCES allowances(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE allowance_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Select: Authenticated users can view comments
CREATE POLICY "Authenticated users can view comments"
  ON allowance_comments
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Insert: Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON allowance_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);