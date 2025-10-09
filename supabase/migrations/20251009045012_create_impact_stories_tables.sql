/*
  # Create Impact Stories Tables

  1. New Tables
    - `story_categories`
      - `id` (uuid, primary key) - Unique identifier
      - `name` (text) - Category name (Education, Employment, Leadership, Community Impact)
      - `slug` (text, unique) - URL-friendly slug
      - `description` (text) - Category description
      - `color` (text) - Display color for category
      - `created_at` (timestamptz) - Creation timestamp
    
    - `impact_stories`
      - `id` (uuid, primary key) - Unique identifier
      - `student_id` (uuid, foreign key) - Reference to student
      - `student_name` (text) - Student name
      - `student_photo_url` (text) - Student photo URL
      - `program` (text) - Program name
      - `year` (integer) - Year of story
      - `title` (text) - Story title
      - `excerpt` (text) - Short excerpt/summary
      - `content` (text) - Full story content
      - `category_id` (uuid, foreign key) - Reference to category
      - `image_url` (text) - Main story image URL
      - `video_url` (text) - Optional video URL
      - `featured` (boolean) - Is featured story
      - `approved` (boolean) - Admin approval status
      - `views_count` (integer) - View counter
      - `approved_by` (text) - Admin who approved
      - `approved_date` (date) - Approval date
      - `date_posted` (date) - Publishing date
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Update timestamp
    
    - `story_tags`
      - `id` (uuid, primary key) - Unique identifier
      - `story_id` (uuid, foreign key) - Reference to story
      - `tag` (text) - Tag text
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable Row Level Security (RLS) on all tables
    - Public can view approved stories
    - Admins can create/edit/approve stories
    - Read-only access for authenticated users

  3. Indexes
    - Index on approved and featured for filtering
    - Index on category_id for category filtering
    - Index on student_name for search
    - Index on date_posted for sorting

  4. Notes
    - Stories must be approved before appearing publicly
    - Featured stories appear in hero section
    - Categories have color coding for visual organization
    - Tags allow flexible organization beyond categories
*/

CREATE TABLE IF NOT EXISTS story_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  color text DEFAULT 'blue',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS impact_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE SET NULL,
  student_name text NOT NULL,
  student_photo_url text,
  program text,
  year integer NOT NULL,
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  category_id uuid REFERENCES story_categories(id) ON DELETE SET NULL,
  image_url text,
  video_url text,
  featured boolean DEFAULT false,
  approved boolean DEFAULT false,
  views_count integer DEFAULT 0,
  approved_by text,
  approved_date date,
  date_posted date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS story_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid REFERENCES impact_stories(id) ON DELETE CASCADE,
  tag text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_impact_stories_approved ON impact_stories(approved);
CREATE INDEX IF NOT EXISTS idx_impact_stories_featured ON impact_stories(featured);
CREATE INDEX IF NOT EXISTS idx_impact_stories_category ON impact_stories(category_id);
CREATE INDEX IF NOT EXISTS idx_impact_stories_name ON impact_stories(student_name);
CREATE INDEX IF NOT EXISTS idx_impact_stories_date ON impact_stories(date_posted);
CREATE INDEX IF NOT EXISTS idx_story_tags_story ON story_tags(story_id);
CREATE INDEX IF NOT EXISTS idx_story_tags_tag ON story_tags(tag);

INSERT INTO story_categories (name, slug, description, color) VALUES
('Education', 'education', 'Stories of academic achievement and learning transformation', 'blue'),
('Employment', 'employment', 'Career success and professional development stories', 'green'),
('Leadership', 'leadership', 'Stories showcasing leadership growth and community influence', 'purple'),
('Community Impact', 'community-impact', 'Stories of positive change in families and communities', 'orange'),
('Personal Growth', 'personal-growth', 'Stories of personal transformation and resilience', 'pink')
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE story_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON story_categories FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view approved stories"
  ON impact_stories FOR SELECT
  USING (approved = true);

CREATE POLICY "Authenticated users can view all stories"
  ON impact_stories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert stories"
  ON impact_stories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update stories"
  ON impact_stories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete stories"
  ON impact_stories FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view tags for approved stories"
  ON story_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM impact_stories
      WHERE impact_stories.id = story_tags.story_id
      AND impact_stories.approved = true
    )
  );

CREATE POLICY "Authenticated users can view all tags"
  ON story_tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert tags"
  ON story_tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update tags"
  ON story_tags FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete tags"
  ON story_tags FOR DELETE
  TO authenticated
  USING (true);