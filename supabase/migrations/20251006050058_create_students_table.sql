/*
  # Create Students Table

  ## Overview
  This migration creates the students table for managing student profiles, academic information, and accommodation details.

  ## Tables Created
  
  ### 1. `students`
  Stores comprehensive student information including personal details, academic status, and program information
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier
  - `full_name` (text) - Student's complete name
  - `first_name` (text) - First name
  - `last_name` (text) - Last name
  - `profile_picture` (text, nullable) - URL to profile photo
  - `email` (text, unique) - Student email address
  - `contact_number` (text) - Phone number
  - `community` (text) - Student's home community
  - `guardian_full_name` (text) - Guardian's name
  - `guardian_community` (text) - Guardian's community
  - `guardian_contact_number` (text) - Guardian's phone
  - `chl_number` (text, unique) - CHL identification number
  - `school_id_number` (text) - School/Institution ID
  - `nrc_number` (text) - National Registration Card number
  - `gender` (text) - Gender: 'male', 'female', 'other'
  - `date_of_birth` (date) - Birth date
  - `age` (integer) - Current age
  - `current_program` (text) - Current academic program
  - `program_level` (text) - Level: 'university', 'diploma', 'trade'
  - `program_status` (text) - Status: 'enrolled', 'graduated', 'discharged', 'suspended', 'transferred'
  - `academic_standing` (text) - Standing: 'good', 'probation', 'warning', 'excellent'
  - `institution_name` (text) - Name of educational institution
  - `institution_location` (text) - Location of institution
  - `area_of_study` (text) - Field of study
  - `program_length` (text) - Duration (e.g., "4 years")
  - `start_date` (date) - Program start date
  - `expected_end_date` (date) - Expected completion date
  - `actual_graduation_date` (date, nullable) - Actual graduation date
  - `is_on_track` (boolean) - Whether student is on track
  - `assigned_officer` (text) - Program officer assigned
  - `assigned_officer_id` (uuid, nullable) - Officer's user ID
  - `join_date` (date) - Date joined program
  - `program_notes` (text) - Additional notes
  - `overall_gpa` (numeric) - Overall GPA
  - `accommodation_type` (text) - Type of accommodation
  - `accommodation_address` (text) - Accommodation address
  - `landlord_name` (text, nullable) - Landlord name if applicable
  - `landlord_contact` (text, nullable) - Landlord contact
  - `monthly_rent` (numeric) - Monthly rent amount
  - `payment_method` (text) - How rent is paid
  - `contract_start_date` (date, nullable) - Contract start
  - `contract_end_date` (date, nullable) - Contract end
  - `accommodation_notes` (text) - Accommodation notes
  - `created_at` (timestamptz) - Record creation
  - `updated_at` (timestamptz) - Last update

  ## Security (RLS Policies)
  
  ### Row Level Security
  - RLS is ENABLED on the students table
  - All policies require authentication
  
  ### Policies Created
  
  1. **Select Policy**: "Authenticated users can view students"
     - All authenticated users can view student records
  
  2. **Insert Policy**: "Authenticated users can create students"
     - Authenticated users can add new student records
  
  3. **Update Policy**: "Authenticated users can update students"
     - Authenticated users can modify student records
  
  4. **Delete Policy**: "Authenticated users can delete students"
     - Authenticated users can delete student records

  ## Indexes
  - Primary key index on `id`
  - Unique index on `email`
  - Unique index on `chl_number`
  - Index on `program_status` for filtering
  - Index on `assigned_officer_id` for officer-based queries

  ## Notes
  - Email and CHL number must be unique
  - Default program status is 'enrolled'
  - Default academic standing is 'good'
  - Timestamps are automatically managed
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  profile_picture text,
  email text UNIQUE NOT NULL,
  contact_number text NOT NULL,
  community text NOT NULL,
  guardian_full_name text NOT NULL,
  guardian_community text NOT NULL,
  guardian_contact_number text NOT NULL,
  chl_number text UNIQUE NOT NULL,
  school_id_number text,
  nrc_number text,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth date,
  age integer,
  current_program text,
  program_level text DEFAULT 'university' CHECK (program_level IN ('university', 'diploma', 'trade')),
  program_status text DEFAULT 'enrolled' CHECK (program_status IN ('enrolled', 'graduated', 'discharged', 'suspended', 'transferred')),
  academic_standing text DEFAULT 'good' CHECK (academic_standing IN ('good', 'probation', 'warning', 'excellent')),
  institution_name text,
  institution_location text,
  area_of_study text,
  program_length text,
  start_date date,
  expected_end_date date,
  actual_graduation_date date,
  is_on_track boolean DEFAULT true,
  assigned_officer text,
  assigned_officer_id uuid,
  join_date date DEFAULT CURRENT_DATE,
  program_notes text,
  overall_gpa numeric(3, 2) DEFAULT 0,
  accommodation_type text CHECK (accommodation_type IN ('university_hostel', 'private_rental', 'family_home', 'other')),
  accommodation_address text,
  landlord_name text,
  landlord_contact text,
  monthly_rent numeric(10, 2) DEFAULT 0,
  payment_method text CHECK (payment_method IN ('direct_to_landlord', 'student_stipend', 'mixed')),
  contract_start_date date,
  contract_end_date date,
  accommodation_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_students_program_status ON students(program_status);
CREATE INDEX IF NOT EXISTS idx_students_assigned_officer ON students(assigned_officer_id);
CREATE INDEX IF NOT EXISTS idx_students_chl_number ON students(chl_number);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Select: Authenticated users can view students
CREATE POLICY "Authenticated users can view students"
  ON students
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Insert: Authenticated users can create students
CREATE POLICY "Authenticated users can create students"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Update: Authenticated users can update students
CREATE POLICY "Authenticated users can update students"
  ON students
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Delete: Authenticated users can delete students
CREATE POLICY "Authenticated users can delete students"
  ON students
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_students_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_students_updated_at ON students;
CREATE TRIGGER trigger_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_students_updated_at();