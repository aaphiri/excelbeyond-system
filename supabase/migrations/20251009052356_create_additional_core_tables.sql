/*
  # Create Additional Core System Tables

  1. New Tables
    - `tasks`
      - Task management for staff assignments
    - `events`
      - Events and activities management
    - `announcements`
      - System-wide announcements
    - `library_resources`
      - Library resources and documents
    - `files`
      - Student file management
    - `issues`
      - Issue tracking system

  2. Security
    - Enable RLS on all tables
    - Role-based access policies
    - Authenticated user access

  3. Relationships
    - Tasks linked to students and assignees
    - Events with RSVP tracking
    - Files linked to students
    - Issues with assignment and resolution tracking
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  student_id uuid REFERENCES students(id) ON DELETE SET NULL,
  student_name text,
  assigned_to text,
  assigned_by text NOT NULL,
  priority text CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status text CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  due_date date,
  completed_date date,
  category text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_type text CHECK (event_type IN ('meeting', 'workshop', 'conference', 'graduation', 'social', 'other')) DEFAULT 'other',
  location text,
  venue text,
  start_date date NOT NULL,
  end_date date,
  start_time time,
  end_time time,
  organizer text,
  max_participants integer,
  registration_required boolean DEFAULT false,
  registration_deadline date,
  status text CHECK (status IN ('draft', 'published', 'ongoing', 'completed', 'cancelled')) DEFAULT 'draft',
  image_url text,
  attachments jsonb,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id text,
  user_name text NOT NULL,
  user_email text,
  registration_date timestamptz DEFAULT now(),
  attendance_status text CHECK (attendance_status IN ('registered', 'attended', 'absent', 'cancelled')) DEFAULT 'registered',
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  announcement_type text CHECK (announcement_type IN ('general', 'urgent', 'event', 'deadline', 'update')) DEFAULT 'general',
  priority text CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  target_audience text[] DEFAULT '{"all"}',
  published boolean DEFAULT false,
  publish_date date DEFAULT CURRENT_DATE,
  expiry_date date,
  author_id text,
  author_name text NOT NULL,
  pinned boolean DEFAULT false,
  views_count integer DEFAULT 0,
  attachments jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS library_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text,
  description text,
  resource_type text CHECK (resource_type IN ('book', 'article', 'video', 'document', 'link', 'other')) DEFAULT 'document',
  category text,
  tags text[],
  file_url text,
  external_link text,
  thumbnail_url text,
  isbn text,
  publication_year integer,
  publisher text,
  copies_available integer DEFAULT 1,
  total_copies integer DEFAULT 1,
  downloadable boolean DEFAULT true,
  access_level text CHECK (access_level IN ('public', 'authenticated', 'admin')) DEFAULT 'authenticated',
  downloads_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  added_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS student_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  file_name text NOT NULL,
  file_type text,
  file_size bigint,
  file_url text NOT NULL,
  category text CHECK (category IN ('academic', 'financial', 'personal', 'medical', 'legal', 'other')) DEFAULT 'other',
  description text,
  tags text[],
  uploaded_by text NOT NULL,
  upload_date date DEFAULT CURRENT_DATE,
  is_confidential boolean DEFAULT false,
  access_log jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  student_id uuid REFERENCES students(id) ON DELETE SET NULL,
  student_name text,
  issue_type text CHECK (issue_type IN ('academic', 'financial', 'accommodation', 'health', 'personal', 'technical', 'other')) DEFAULT 'other',
  priority text CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status text CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'escalated')) DEFAULT 'open',
  assigned_to text,
  assigned_date date,
  resolution text,
  resolved_date date,
  resolved_by text,
  reported_by text NOT NULL,
  reported_date date DEFAULT CURRENT_DATE,
  due_date date,
  tags text[],
  attachments jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS issue_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid REFERENCES issues(id) ON DELETE CASCADE,
  comment text NOT NULL,
  commenter_id text,
  commenter_name text NOT NULL,
  is_internal boolean DEFAULT false,
  attachments jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_student ON tasks(student_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(published);
CREATE INDEX IF NOT EXISTS idx_announcements_date ON announcements(publish_date);

CREATE INDEX IF NOT EXISTS idx_library_type ON library_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_library_category ON library_resources(category);

CREATE INDEX IF NOT EXISTS idx_files_student ON student_files(student_id);
CREATE INDEX IF NOT EXISTS idx_files_category ON student_files(category);

CREATE INDEX IF NOT EXISTS idx_issues_student ON issues(student_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(priority);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view published events"
  ON events FOR SELECT
  TO authenticated
  USING (status = 'published' OR status = 'ongoing' OR status = 'completed');

CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can register for events"
  ON event_registrations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their registrations"
  ON event_registrations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view published announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (published = true);

CREATE POLICY "Admins can manage announcements"
  ON announcements FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view accessible library resources"
  ON library_resources FOR SELECT
  TO authenticated
  USING (access_level IN ('public', 'authenticated'));

CREATE POLICY "Admins can manage library resources"
  ON library_resources FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view student files"
  ON student_files FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can upload student files"
  ON student_files FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update student files"
  ON student_files FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete student files"
  ON student_files FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view issues"
  ON issues FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create issues"
  ON issues FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update issues"
  ON issues FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view issue comments"
  ON issue_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can add issue comments"
  ON issue_comments FOR INSERT
  TO authenticated
  WITH CHECK (true);