/*
  # Create Students Table with Program Categories

  1. New Tables
    - `students`
      - `id` (uuid, primary key) - Unique identifier
      - `full_name` (text) - Student's full name
      - `first_name` (text) - Student's first name
      - `last_name` (text) - Student's last name
      - `email` (text) - Student's email address
      - `contact_number` (text) - Phone number
      - `community` (text) - Student's community
      - `guardian_full_name` (text) - Guardian's full name
      - `guardian_community` (text) - Guardian's community
      - `guardian_contact_number` (text) - Guardian's phone number
      - `chl_number` (text) - CHL identification number
      - `school_id_number` (text) - School ID number
      - `nrc_number` (text) - National Registration Card number
      - `gender` (text) - Gender (male/female/other)
      - `date_of_birth` (date) - Date of birth
      - `age` (integer) - Age calculated from date of birth
      - `current_program` (text) - Current program/course enrolled in
      - `program_level` (text) - Level: university, diploma, launch_year
      - `program_status` (text) - Status: enrolled, graduated, discharged, suspended, transferred
      - `academic_standing` (text) - Standing: excellent, good, probation, warning
      - `institution_name` (text) - Name of institution
      - `institution_location` (text) - Location of institution
      - `area_of_study` (text) - Field/area of study
      - `program_length` (text) - Duration (e.g., "4 years")
      - `start_date` (date) - Program start date
      - `expected_end_date` (date) - Expected completion date
      - `actual_graduation_date` (date) - Actual graduation date
      - `is_on_track` (boolean) - Whether student is on track
      - `assigned_officer_id` (text) - ID of assigned program officer
      - `assigned_officer_name` (text) - Name of assigned program officer
      - `join_date` (date) - Date student joined the program
      - `program_notes` (text) - Additional notes about the program
      - `overall_gpa` (numeric) - Overall GPA
      - `profile_picture` (text) - URL to profile picture
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record last update timestamp

  2. Security
    - Enable Row Level Security (RLS) on `students` table
    - Add policy for admins and deputy managers to view all students
    - Add policy for program officers to view only their assigned students
    - Add policy for authenticated users to insert students
    - Add policy for authenticated users to update students (with restrictions)
    - Add policy for admins to delete students

  3. Indexes
    - Create index on assigned_officer_id for efficient filtering
    - Create index on program_level for category filtering

  4. Notes
    - Program officers can only see students assigned to them
    - Admins and deputy managers have full access to all students
    - Three program categories: University, College/Diploma, Launch Year
*/

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  contact_number text,
  community text,
  guardian_full_name text,
  guardian_community text,
  guardian_contact_number text,
  chl_number text,
  school_id_number text,
  nrc_number text,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth date,
  age integer,
  current_program text,
  program_level text CHECK (program_level IN ('university', 'diploma', 'launch_year')) DEFAULT 'university',
  program_status text CHECK (program_status IN ('enrolled', 'graduated', 'discharged', 'suspended', 'transferred')) DEFAULT 'enrolled',
  academic_standing text CHECK (academic_standing IN ('excellent', 'good', 'probation', 'warning')) DEFAULT 'good',
  institution_name text,
  institution_location text,
  area_of_study text,
  program_length text,
  start_date date,
  expected_end_date date,
  actual_graduation_date date,
  is_on_track boolean DEFAULT true,
  assigned_officer_id text,
  assigned_officer_name text,
  join_date date DEFAULT CURRENT_DATE,
  program_notes text,
  overall_gpa numeric(3, 2) DEFAULT 0.00,
  profile_picture text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_students_assigned_officer ON students(assigned_officer_id);
CREATE INDEX IF NOT EXISTS idx_students_program_level ON students(program_level);
CREATE INDEX IF NOT EXISTS idx_students_program_status ON students(program_status);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and deputy managers can view all students"
  ON students FOR SELECT
  TO authenticated
  USING (
    auth.jwt()->>'role' IN ('admin', 'deputy_manager')
  );

CREATE POLICY "Program officers can view assigned students"
  ON students FOR SELECT
  TO authenticated
  USING (
    auth.jwt()->>'role' = 'program_officer' AND
    assigned_officer_id = auth.jwt()->>'user_id'
  );

CREATE POLICY "Authenticated users can insert students"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update students"
  ON students FOR UPDATE
  TO authenticated
  USING (
    auth.jwt()->>'role' IN ('admin', 'deputy_manager') OR
    (auth.jwt()->>'role' = 'program_officer' AND assigned_officer_id = auth.jwt()->>'user_id')
  )
  WITH CHECK (
    auth.jwt()->>'role' IN ('admin', 'deputy_manager') OR
    (auth.jwt()->>'role' = 'program_officer' AND assigned_officer_id = auth.jwt()->>'user_id')
  );

CREATE POLICY "Admins can delete students"
  ON students FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin');