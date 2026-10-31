create table push_subscription (
  id integer primary key,
  user_id integer not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at datetime default (strftime('%Y-%m-%dT%H:%M:%SZ')),
  foreign key (user_id) references user(id) on delete cascade
);

create index push_subscription_user_id on push_subscription(user_id);
