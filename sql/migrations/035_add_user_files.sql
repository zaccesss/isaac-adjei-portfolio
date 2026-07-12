-- User file manager (Supabase Storage backed)
create table if not exists user_files (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  user_id       uuid references auth.users(id) on delete cascade,
  name          text not null,
  original_name text not null,
  folder        text not null default 'General',
  size_bytes    bigint not null default 0,
  mime_type     text not null default '',
  storage_path  text not null,
  is_deleted    boolean not null default false,
  deleted_at    timestamptz
);
alter table user_files enable row level security;
create policy "users manage own files"
  on user_files for all
  using (auth.uid() = user_id);
create index if not exists user_files_user_folder on user_files(user_id, folder);
