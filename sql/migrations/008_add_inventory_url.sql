-- 008_add_inventory_url.sql
-- Adds a product URL field to inventory_items so each item can link to its purchase page.
-- Safe to run on existing databases (ALTER TABLE is non-destructive).
--
-- Run in Supabase SQL Editor:
--   SELECT * FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'url';
--   -- If the above returns no rows, run this migration.

ALTER TABLE inventory_items
  ADD COLUMN IF NOT EXISTS url TEXT;
