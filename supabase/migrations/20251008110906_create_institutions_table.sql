/*
  # Create Institutions Table

  1. New Tables
    - `institutions`
      - `id` (uuid, primary key) - Unique identifier
      - `liaison_name` (text) - Name of the liaison person
      - `liaison_role` (text) - Role/position of the liaison
      - `cell_line` (text) - Liaison's cell phone number
      - `institution_direct_line` (text) - Institution's direct phone line
      - `institution_name` (text) - Name of the institution
      - `department` (text) - Department within the institution
      - `liaison_email` (text) - Liaison's email address
      - `institution_email` (text) - Institution's official email
      - `geolocation` (text) - Google Maps location URL or coordinates
      - `mou_signed` (boolean) - Whether Memorandum of Understanding is signed
      - `comments` (text) - Additional notes or comments
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record last update timestamp

  2. Security
    - Enable Row Level Security (RLS) on `institutions` table
    - Add policy for authenticated users to view all institutions
    - Add policy for authenticated users to insert institutions
    - Add policy for authenticated users to update institutions
    - Add policy for authenticated users to delete institutions

  3. Notes
    - All authenticated users can manage institutions
    - Default values set for boolean fields
    - Timestamps automatically managed
*/

CREATE TABLE IF NOT EXISTS institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  liaison_name text NOT NULL,
  liaison_role text,
  cell_line text,
  institution_direct_line text,
  institution_name text NOT NULL,
  department text,
  liaison_email text,
  institution_email text,
  geolocation text,
  mou_signed boolean DEFAULT false,
  comments text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view institutions"
  ON institutions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert institutions"
  ON institutions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update institutions"
  ON institutions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete institutions"
  ON institutions FOR DELETE
  TO authenticated
  USING (true);