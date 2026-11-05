-- Sessions: bumping the version invalidates every session of the user
alter table user add column session_version integer not null default 0;

-- magic_link_token now holds every one-time secret sent by email:
-- - token_hash: the link (login only)
-- - code_hash: the 6-digit code, an HMAC keyed with APP_SECRET
-- - new_email: set for an email change, null for a login
alter table magic_link_token add column code_hash char(64) default null;
alter table magic_link_token add column failed_attempts integer not null default 0;
alter table magic_link_token add column new_email varchar(255) default null;
-- Filled by the application: SQLite refuses expression defaults here
alter table magic_link_token add column created_at datetime default null;

create index magic_link_token_user_id on magic_link_token(user_id);
