create table user (
  id int unsigned primary key auto_increment not null,
  email varchar(255) not null unique,
  name varchar(255) not null,
  created_at datetime default current_timestamp,
  updated_at datetime default current_timestamp on update current_timestamp,
  deleted_at datetime default null
);

create table play (
  id int unsigned primary key auto_increment not null,
  title varchar(255) not null,
  description text,
  created_at datetime default current_timestamp,
  updated_at datetime default current_timestamp on update current_timestamp
);

create table play_member (
  id int unsigned primary key auto_increment not null,
  play_id int unsigned not null,
  user_id int unsigned not null,
  role enum('TEACHER', 'ACTOR') default 'ACTOR',
  joined_at datetime default current_timestamp,
  foreign key(play_id) references play(id) on delete cascade,
  foreign key(user_id) references user(id) on delete cascade,
  unique(play_id, user_id)
);

create table scene (
  id int unsigned primary key auto_increment not null,
  play_id int unsigned not null,
  title varchar(255) not null,
  description text,
  duration int,
  order int not null,
  is_active boolean default true,
  foreign key(play_id) references play(id) on delete cascade
);

create table role (
  id int unsigned primary key auto_increment not null,
  play_id int unsigned not null,
  name varchar(255) not null,
  description text,
  foreign key(play_id) references play(id) on delete cascade
);

create table scene_role (
  scene_id int unsigned not null,
  role_id int unsigned not null,
  primary key(scene_id, role_id),
  foreign key(scene_id) references scene(id) on delete cascade,
  foreign key(role_id) references role(id) on delete cascade
);

create table preference (
  id int unsigned primary key auto_increment not null,
  user_id int unsigned not null,
  scene_id int unsigned not null,
  level enum('HIGH', 'MEDIUM', 'LOW', 'NOT_INTERESTED') not null,
  created_at datetime default current_timestamp,
  foreign key(user_id) references user(id) on delete cascade,
  foreign key(scene_id) references scene(id) on delete cascade,
  unique(user_id, scene_id)
);

create table casting (
  role_id int unsigned primary key not null,
  user_id int unsigned not null,
  assigned_at datetime default current_timestamp,
  foreign key(role_id) references role(id) on delete cascade,
  foreign key(user_id) references user(id) on delete cascade
);

create table event (
  id int unsigned primary key auto_increment not null,
  play_id int unsigned not null,
  type enum('SHOW', 'FIXED_REHEARSAL', 'AUTO_REHEARSAL') not null,
  title varchar(255) not null,
  description text,
  location varchar(255),
  start_time datetime not null,
  end_time datetime not null,
  foreign key(play_id) references play(id) on delete cascade
);
