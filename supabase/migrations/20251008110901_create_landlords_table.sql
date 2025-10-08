/*
  # Create Landlords Table

  1. New Tables
    - `landlords`
      - `id` (uuid, primary key) - Unique identifier
      - `name` (text) - Name of the landlord
      - `boarding_house_name` (text) - Name of the boarding house
      - `cell_line` (text) - Landlord's cell phone number
      - `landline` (text) - Landlord's landline number
      - `address` (text) - Physical address
      - `email` (text) - Landlord's email address
      - `geolocation` (text) - Google Maps location URL or coordinates
      - `total_students` (integer) - Total students at the residence
      - `lease_agreement_signed` (boolean) - Whether lease agreement is signed
      - `comments` (text) - Additional notes or comments
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record last update timestamp

  2. Security
    - Enable Row Level Security (RLS) on `landlords` table
    - Add policy for authenticated users to view all landlords
    - Add policy for authenticated users to insert landlords
    - Add policy for authenticated users to update landlords
    - Add policy for authenticated users to delete landlords

  3. Notes
    - All authenticated users can manage landlords
    - Default values set for numeric and boolean fields
    - Timestamps automatically managed
*/

CREATE TABLE IF NOT EXISTS landlords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  boarding_house_name text NOT NULL,
  cell_line text,
  landline text,
  address text,
  email text,
  geolocation text,
  total_students integer DEFAULT 0,
  lease_agreement_signed boolean DEFAULT false,
  comments text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE landlords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view landlords"
  ON landlords FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert landlords"
  ON landlords FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update landlords"
  ON landlords FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete landlords"
  ON landlords FOR DELETE
  TO authenticated
  USING (true);