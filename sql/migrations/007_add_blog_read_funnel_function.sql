-- 007_add_blog_read_funnel_function.sql
-- Creates the blog_read_funnel() RPC function that aggregates scroll-depth
-- events into a per-post reading funnel. Requires migration 005 to have run first.
-- Safe to re-run - CREATE OR REPLACE.
-- Run: paste into Supabase SQL Editor and execute.


create or replace function blog_read_funnel()
returns table (
  slug            text,
  reached_25      bigint,
  reached_50      bigint,
  reached_75      bigint,
  reached_100     bigint,
  completion_rate float
)
language sql stable as $$
  select
    slug,
    count(*) filter (where depth = 25)   as reached_25,
    count(*) filter (where depth = 50)   as reached_50,
    count(*) filter (where depth = 75)   as reached_75,
    count(*) filter (where depth = 100)  as reached_100,
    case
      when count(*) filter (where depth = 25) = 0 then null
      else count(*) filter (where depth = 100)::float
           / count(*) filter (where depth = 25)
    end as completion_rate
  from blog_read_events
  group by slug
  order by reached_25 desc;
$$;
