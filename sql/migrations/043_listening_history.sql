-- Stores every Spotify play (from the recently-played endpoint) so I can build real listening
-- analytics - play counts, active hours, streaks - that the Spotify API alone cannot give (it only
-- returns top-N and the last 50 plays). A scheduled job upserts new plays, deduped by played_at.
-- Feeds both the private music analytics page and the public lab Spotify card.

create table if not exists listening_history (
  id          bigint generated always as identity primary key,
  played_at   timestamptz not null unique,
  track_id    text,
  track_name  text not null,
  artist_name text not null,
  album_name  text,
  album_art   text,
  duration_ms integer,
  url         text,
  created_at  timestamptz not null default now()
);

create index if not exists listening_history_played_at_idx on listening_history (played_at desc);
create index if not exists listening_history_artist_idx on listening_history (lower(artist_name));

-- Service-role only, like the other tables. No public policies.
alter table listening_history enable row level security;
