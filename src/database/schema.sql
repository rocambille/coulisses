create table user (
  id integer primary key,
  email varchar(255) not null unique,
  name varchar(255) not null,
  created_at datetime default current_timestamp,
  deleted_at datetime default null
);

create table magic_link_token (
  user_id integer primary key,
  token_hash char(64) not null,
  expires_at datetime not null,
  consumed_at datetime default null,
  foreign key(user_id) references user(id) on delete cascade
);

create table troupe (
  id integer primary key,
  name varchar(255) not null,
  description text,
  external_discussion_link varchar(255),
  created_at datetime default current_timestamp
);

create table troupe_member (
  user_id integer not null,
  troupe_id integer not null,
  role varchar(16) check(role in ('ADMIN', 'ACTOR')) not null,
  joined_at datetime default current_timestamp,
  primary key(user_id, troupe_id),
  foreign key(user_id) references user(id) on delete cascade,
  foreign key(troupe_id) references troupe(id) on delete cascade
);

create table play (
  id integer primary key,
  troupe_id integer not null,
  title varchar(255) not null,
  description text,
  foreign key(troupe_id) references troupe(id) on delete cascade
);

create table play_preference (
  user_id integer not null,
  play_id integer not null,
  level varchar(16) check(level in ('HIGH', 'MEDIUM', 'LOW', 'NOT_INTERESTED')) not null,
  created_at datetime default current_timestamp,
  primary key(user_id, play_id),
  foreign key(user_id) references user(id) on delete cascade,
  foreign key(play_id) references play(id) on delete cascade
);

create table scene (
  id integer primary key,
  play_id integer not null,
  title varchar(255) not null,
  description text,
  cut_notes text,
  order_in_play integer not null default 0,
  duration_estimated_seconds integer not null default 0,
  is_active boolean default true,
  foreign key(play_id) references play(id) on delete cascade
);

create table role (
  id integer primary key,
  play_id integer not null,
  name varchar(255) not null,
  description text,
  foreign key(play_id) references play(id) on delete cascade
);

create table role_scene (
  role_id integer not null,
  scene_id integer not null,
  primary key(role_id, scene_id),
  foreign key(role_id) references role(id) on delete cascade,
  foreign key(scene_id) references scene(id) on delete cascade
);

create table scene_preference (
  user_id integer not null,
  scene_id integer not null,
  level varchar(16) check(level in ('HIGH', 'MEDIUM', 'LOW', 'NOT_INTERESTED')) not null,
  created_at datetime default current_timestamp,
  primary key(user_id, scene_id),
  foreign key(user_id) references user(id) on delete cascade,
  foreign key(scene_id) references scene(id) on delete cascade
);

create table role_preference (
  user_id integer not null,
  scene_id integer not null,
  role_id integer not null,
  level varchar(16) check(level in ('HIGH', 'MEDIUM', 'LOW', 'NOT_INTERESTED')) not null,
  created_at datetime default current_timestamp,
  primary key(user_id, scene_id, role_id),
  foreign key(user_id) references user(id) on delete cascade,
  foreign key(scene_id) references scene(id) on delete cascade,
  foreign key(role_id) references role(id) on delete cascade
);

create table casting (
  user_id integer not null,
  scene_id integer not null,
  role_id integer not null,
  assigned_at datetime default current_timestamp,
  primary key(scene_id, role_id),
  foreign key(user_id) references user(id) on delete cascade,
  foreign key(scene_id) references scene(id) on delete cascade,
  foreign key(role_id) references role(id) on delete cascade
);

create table event (
  id integer primary key,
  troupe_id integer not null,
  owner_id integer not null,
  type varchar(16) check(type in ('COURSE', 'REHEARSAL', 'SHOW', 'OTHER')) not null,
  title varchar(255) not null,
  start_time datetime not null,
  end_time datetime not null,
  location varchar(255),
  description text,
  foreign key(troupe_id) references troupe(id) on delete cascade,
  foreign key(owner_id) references user(id) on delete cascade
);

create table event_presence (
  event_id integer not null,
  user_id integer not null,
  status varchar(16) check(status in ('PENDING', 'PRESENT', 'ABSENT')) not null default 'PENDING',
  updated_at datetime default current_timestamp,
  primary key(event_id, user_id),
  foreign key(event_id) references event(id) on delete cascade,
  foreign key(user_id) references user(id) on delete cascade
);
