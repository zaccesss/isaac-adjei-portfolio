-- Adds a resolved city + ISO country code to location_geocodes, extracted from the same
-- OpenCage/Nominatim response that already provides lat/lng (isaac-adjei-automations'
-- geocode-locations.mjs). The Applications map and Top 10 cities charts (dashboard and public)
-- were displaying the raw scraped location string verbatim - some are genuinely messy source
-- data (fab/site codes, "N Locations" placeholders from a job board's own multi-site listing),
-- not just inconsistent formatting, so a real "City, Country code" label needs a real geocode
-- result behind it rather than any amount of text cleanup on the original string.

alter table location_geocodes
  add column if not exists city text,
  add column if not exists country_code text;
