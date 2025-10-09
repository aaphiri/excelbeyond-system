/*
  # Fix Security Issues - Part 1: Indexes
  
  1. Add Missing Foreign Key Indexes
    - event_registrations.event_id
    - impact_stories.student_id
    - issue_comments.issue_id
  
  2. Remove Duplicate Indexes
    - password_reset_tokens duplicate indexes
  
  3. Performance Optimization
    - Ensures foreign key lookups are fast
    - Removes redundant index maintenance overhead
*/

-- Add missing foreign key indexes
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id 
  ON event_registrations(event_id);

CREATE INDEX IF NOT EXISTS idx_impact_stories_student_id 
  ON impact_stories(student_id);

CREATE INDEX IF NOT EXISTS idx_issue_comments_issue_id 
  ON issue_comments(issue_id);

-- Remove duplicate indexes on password_reset_tokens
DROP INDEX IF EXISTS idx_reset_tokens_expires;
DROP INDEX IF EXISTS idx_reset_tokens_staff;
DROP INDEX IF EXISTS idx_reset_tokens_token;
