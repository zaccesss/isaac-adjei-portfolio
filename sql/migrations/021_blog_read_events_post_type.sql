-- Add post_type ('blog' | 'til') to blog_read_events so scroll-depth can
-- be tracked across all post types, not just /blog. The unique constraint
-- is widened to include post_type so a TIL and blog post that share a slug
-- do not collide.

alter table blog_read_events
  add column if not exists post_type varchar(10) not null default 'blog';

-- Widen the unique index to include post_type.
drop index if exists blog_read_events_unique;

create unique index if not exists blog_read_events_unique
  on blog_read_events (slug, depth, ip_hash, post_type);

-- Recreate the RPC to include post_type in the grouping and output.
-- Must drop first because the return type changes (adding post_type column).
drop function if exists blog_read_funnel();
create or replace function blog_read_funnel()
returns table (
  slug            text,
  post_type       text,
  reached_25      bigint,
  reached_50      bigint,
  reached_75      bigint,
  reached_100     bigint,
  completion_rate float
)
language sql stable as $$
  select
    slug,
    post_type,
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
  group by slug, post_type
  order by reached_25 desc;
$$;

-- Down:
-- alter table blog_read_events drop column if exists post_type;
-- drop index if exists blog_read_events_unique;
-- create unique index blog_read_events_unique on blog_read_events (slug, depth, ip_hash);
-- (restore old blog_read_funnel from migration 007)
