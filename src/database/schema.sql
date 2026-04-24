create table user (
  id integer primary key not null,
  email varchar(255) not null unique,
  name varchar(255) not null,
  created_at datetime default current_timestamp,
  deleted_at datetime default null
);

create table play (
  id integer primary key not null,
  title varchar(255) not null,
  description text,
  created_at datetime default current_timestamp
);

create table member_play (
  id integer primary key not null,
  play_id integer not null,
  user_id integer not null,
  role varchar(8) check(role in ('TEACHER', 'ACTOR')) default 'ACTOR',
  joined_at datetime default current_timestamp,
  foreign key(play_id) references play(id) on delete cascade,
  foreign key(user_id) references user(id) on delete cascade,
  unique(play_id, user_id)
);

create table scene (
  id integer primary key not null,
  play_id integer not null,
  title varchar(255) not null,
  description text,
  duration int,
  scene_order int not null,
  is_active boolean default true,
  foreign key(play_id) references play(id) on delete cascade
);

create table role (
  id integer primary key not null,
  play_id integer not null,
  name varchar(255) not null,
  description text,
  foreign key(play_id) references play(id) on delete cascade
);

create table role_scene (
  scene_id integer not null,
  role_id integer not null,
  primary key(scene_id, role_id),
  foreign key(scene_id) references scene(id) on delete cascade,
  foreign key(role_id) references role(id) on delete cascade
);

create table preference (
  user_id integer not null,
  scene_id integer not null,
  level varchar(16) check(level in ('HIGH', 'MEDIUM', 'LOW', 'NOT_INTERESTED')) not null,
  created_at datetime default current_timestamp,
  primary key(user_id, scene_id),
  foreign key(user_id) references user(id) on delete cascade,
  foreign key(scene_id) references scene(id) on delete cascade
);

create table casting (
  role_id integer primary key not null,
  user_id integer not null,
  assigned_at datetime default current_timestamp,
  foreign key(role_id) references role(id) on delete cascade,
  foreign key(user_id) references user(id) on delete cascade
);

create table event (
  id integer primary key not null,
  play_id integer not null,
  type varchar(16) check(type in ('SHOW', 'FIXED_REHEARSAL', 'AUTO_REHEARSAL')) not null,
  title varchar(255) not null,
  description text,
  location varchar(255),
  start_time datetime not null,
  end_time datetime not null,
  foreign key(play_id) references play(id) on delete cascade
);

create table magic_link_token (
  user_id integer primary key not null,
  token_hash char(64) not null,
  expires_at datetime not null,
  consumed_at datetime default null,
  foreign key(user_id) references user(id) on delete cascade
);
