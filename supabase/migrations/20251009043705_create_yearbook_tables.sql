/*
  # Create Graduation Yearbook Tables

  1. New Tables
    - `yearbooks`
      - `id` (uuid, primary key) - Unique identifier
      - `year` (integer) - Graduation year
      - `title` (text) - Yearbook title
      - `theme` (text) - Theme or tagline
      - `cover_image_url` (text) - Cover image URL
      - `status` (text) - draft, published, archived
      - `published_date` (date) - Date published
      - `created_by` (text) - User who created
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Update timestamp
    
    - `yearbook_entries`
      - `id` (uuid, primary key) - Unique identifier
      - `yearbook_id` (uuid, foreign key) - Reference to yearbook
      - `student_id` (uuid, foreign key) - Reference to student
      - `student_name` (text) - Student name
      - `student_photo_url` (text) - Student photo URL
      - `program` (text) - Program/course
      - `quote` (text) - Personal quote
      - `achievements` (text) - Achievements/highlights
      - `status` (text) - pending, approved, rejected
      - `approved_by` (text) - Admin who approved
      - `approved_date` (date) - Approval date
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Update timestamp
    
    - `memory_wall_posts`
      - `id` (uuid, primary key) - Unique identifier
      - `yearbook_id` (uuid, foreign key) - Reference to yearbook
      - `author_name` (text) - Author name
      - `author_id` (text) - Author user ID
      - `message` (text) - Message content
      - `photo_url` (text) - Optional photo URL
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable Row Level Security (RLS) on all tables
    - Public can view published yearbooks
    - Students can create/update their own entries
    - Admins can manage all content
    - Memory wall posts visible to all authenticated users

  3. Indexes
    - Index on yearbook year for filtering
    - Index on yearbook_id for quick lookups
    - Index on student_id for student entries

  4. Notes
    - Yearbooks can be in draft, published, or archived status
    - Entries must be approved by admin before appearing in published yearbook
    - Memory wall allows community engagement
*/

CREATE TABLE IF NOT EXISTS yearbooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  title text NOT NULL,
  theme text,
  cover_image_url text,
  status text CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  published_date date,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(year)
);

CREATE TABLE IF NOT EXISTS yearbook_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  yearbook_id uuid REFERENCES yearbooks(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  student_photo_url text,
  program text,
  quote text,
  achievements text,
  status text CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  approved_by text,
  approved_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS memory_wall_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  yearbook_id uuid REFERENCES yearbooks(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_id text,
  message text NOT NULL,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_yearbooks_year ON yearbooks(year);
CREATE INDEX IF NOT EXISTS idx_yearbooks_status ON yearbooks(status);
CREATE INDEX IF NOT EXISTS idx_yearbook_entries_yearbook ON yearbook_entries(yearbook_id);
CREATE INDEX IF NOT EXISTS idx_yearbook_entries_student ON yearbook_entries(student_id);
CREATE INDEX IF NOT EXISTS idx_yearbook_entries_status ON yearbook_entries(status);
CREATE INDEX IF NOT EXISTS idx_memory_wall_yearbook ON memory_wall_posts(yearbook_id);

ALTER TABLE yearbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE yearbook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_wall_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published yearbooks"
  ON yearbooks FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can manage all yearbooks"
  ON yearbooks FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' IN ('admin', 'deputy_manager'))
  WITH CHECK (auth.jwt()->>'role' IN ('admin', 'deputy_manager'));

CREATE POLICY "Anyone can view approved entries in published yearbooks"
  ON yearbook_entries FOR SELECT
  USING (
    status = 'approved' AND
    EXISTS (
      SELECT 1 FROM yearbooks
      WHERE yearbooks.id = yearbook_entries.yearbook_id
      AND yearbooks.status = 'published'
    )
  );

CREATE POLICY "Students can view their own entries"
  ON yearbook_entries FOR SELECT
  TO authenticated
  USING (student_id::text = auth.jwt()->>'user_id');

CREATE POLICY "Students can create their own entries"
  ON yearbook_entries FOR INSERT
  TO authenticated
  WITH CHECK (student_id::text = auth.jwt()->>'user_id');

CREATE POLICY "Students can update their pending entries"
  ON yearbook_entries FOR UPDATE
  TO authenticated
  USING (student_id::text = auth.jwt()->>'user_id' AND status = 'pending')
  WITH CHECK (student_id::text = auth.jwt()->>'user_id' AND status = 'pending');

CREATE POLICY "Admins can manage all entries"
  ON yearbook_entries FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' IN ('admin', 'deputy_manager'))
  WITH CHECK (auth.jwt()->>'role' IN ('admin', 'deputy_manager'));

CREATE POLICY "Anyone can view memory wall posts for published yearbooks"
  ON memory_wall_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM yearbooks
      WHERE yearbooks.id = memory_wall_posts.yearbook_id
      AND yearbooks.status = 'published'
    )
  );

CREATE POLICY "Authenticated users can create memory wall posts"
  ON memory_wall_posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own memory wall posts"
  ON memory_wall_posts FOR UPDATE
  TO authenticated
  USING (author_id = auth.jwt()->>'user_id')
  WITH CHECK (author_id = auth.jwt()->>'user_id');

CREATE POLICY "Admins can manage all memory wall posts"
  ON memory_wall_posts FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' IN ('admin', 'deputy_manager'))
  WITH CHECK (auth.jwt()->>'role' IN ('admin', 'deputy_manager'));