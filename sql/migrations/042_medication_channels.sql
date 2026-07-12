-- Let a medication reminder use more than one channel at once (for example email and SMS together), with
-- a separate recipient field per type. Backfills the new columns from the old single channel/recipient,
-- which stay in place until the dashboard and the send job have fully moved over.

alter table medication_reminders add column if not exists channels text[] not null default '{}';
alter table medication_reminders add column if not exists email text;
alter table medication_reminders add column if not exists phone text;

update medication_reminders set channels = array[channel]::text[] where channels = '{}' and channel is not null;
update medication_reminders set email = recipient where channel = 'email' and email is null;
update medication_reminders set phone = recipient where channel = 'sms' and phone is null;
