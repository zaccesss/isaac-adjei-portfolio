-- Geocode cache for applications.location, fed by isaac-adjei-automations' new
-- geocode-locations.mjs job (dispatched infrequently via cron-ops). Keyed on the exact free-text
-- location string already stored on each application, so the same value never gets re-geocoded.
-- A location OpenCage/Nominatim cannot resolve still gets a row (lat/lng null) so it is never
-- retried forever - the Applications map reads this table only, it never calls a geocoder itself.

create table if not exists location_geocodes (
  location     text primary key,
  lat          double precision,
  lng          double precision,
  resolved_at  timestamptz not null default now()
);

-- Service-role only, like every other table. No public policies.
alter table location_geocodes enable row level security;
