-- Health activity subtypes: extend health_sections with a subtype field for activity sections.
-- subtype: 'running' | 'walking' | 'cycling' | 'swimming' | 'football' | 'basketball' | 'tennis' | 'gym' | 'custom'
-- metadata JSONB for future extension (e.g. target pace, distance goal).
alter table health_sections
  add column if not exists subtype  text default null,
  add column if not exists metadata jsonb default null;

-- Down:
-- alter table health_sections drop column if exists subtype;
-- alter table health_sections drop column if exists metadata;
