create table user (
  id int unsigned primary key auto_increment not null,
  email varchar(255) not null unique,
  name varchar(255) not null,
  created_at datetime default current_timestamp,
  updated_at datetime default current_timestamp on update current_timestamp,
  deleted_at datetime default null
);

create table magic_link_token (
  id int unsigned primary key auto_increment not null,
  user_id int unsigned not null,
  token_hash char(64) not null,
  expires_at datetime not null,
  consumed_at datetime default null,
  foreign key(user_id) references user(id) on delete cascade
);

create table item (
  id int unsigned primary key auto_increment not null,
  title varchar(255) not null,
  created_at datetime default current_timestamp,
  updated_at datetime default current_timestamp on update current_timestamp,
  deleted_at datetime default null,
  user_id int unsigned not null,
  foreign key(user_id) references user(id) on delete cascade
);
