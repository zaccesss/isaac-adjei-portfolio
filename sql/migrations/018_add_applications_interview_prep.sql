-- Add interview_prep JSONB column to applications.
-- Stores { notes: string, questions: {id, text, done}[], company_research: string } per application.
-- Null until the user opens the prep panel and saves anything.
alter table applications
  add column if not exists interview_prep jsonb default null;
