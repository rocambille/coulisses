insert into user(id, email, name)
values
  (1, "teacher@mail.com", "Professeur Tournesol"),
  (2, "actor1@mail.com", "Comédien Romain");

insert into play(id, title, description)
values
  (1, "Hamlet", "Tragédie de Shakespeare");

insert into play_member(id, play_id, user_id, role)
values
  (1, 1, 1, 'TEACHER'),
  (2, 1, 2, 'ACTOR');

insert into scene(id, play_id, title, description, duration, scene_order)
values
  (1, 1, "Acte 1 Scène 1", "Sur les remparts", 15, 1),
  (2, 1, "Acte 1 Scène 2", "Salle d'Audience", 20, 2);

insert into role(id, play_id, name, description)
values
  (1, 1, "Hamlet", "Prince du Danemark"),
  (2, 1, "Claudius", "Roi du Danemark");

insert into scene_role(scene_id, role_id)
values
  (1, 1),
  (2, 1),
  (2, 2);

insert into preference(id, user_id, scene_id, level)
values
  (1, 2, 1, 'HIGH');

insert into casting(role_id, user_id)
values
  (1, 2);
