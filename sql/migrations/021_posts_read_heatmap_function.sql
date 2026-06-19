-- Aggregates blog_read_events by day-of-week and UTC hour so the dashboard
-- can render a 7x24 "When posts are read" heatmap. Returns one row per
-- (dow, hour) pair that has at least one event; missing pairs are filled
-- client-side with 0. dow follows PostgreSQL convention: 0=Sunday, 1=Monday,
-- ..., 6=Saturday.
create or replace function posts_read_heatmap()
returns table (
  dow   smallint,
  hour  smallint,
  count bigint
)
language sql stable as $$
  select
    extract(dow from created_at)::smallint  as dow,
    extract(hour from created_at)::smallint as hour,
    count(*)                                as count
  from blog_read_events
  group by dow, hour
  order by dow, hour;
$$;

-- Down:
-- drop function if exists posts_read_heatmap();
