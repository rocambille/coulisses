insert into user(id, email, name)
values
  (1, 'teacher@mail.com', 'Professeur Tournesol'),
  (2, 'actor1@mail.com', 'Comédien Romain');

insert into troupe(id, name, description, external_discussion_link)
values
  (1, 'Les Joyeux Lurons', 'Troupe amatrice du jeudi soir', 'https://chat.whatsapp.com/123');

insert into troupe_member(user_id, troupe_id, role)
values
  (1, 1, 'ADMIN'),
  (2, 1, 'ACTOR');

insert into play(id, troupe_id, title, description)
values
  (1, 1, 'Hamlet', 'Tragédie de Shakespeare');

insert into play_preference(user_id, play_id, level)
values
  (2, 1, 'HIGH');

insert into scene(id, play_id, title, description, cut_notes, order_in_play, duration_estimated_seconds, is_active)
values
  (1, 1, 'Acte 1 Scène 1', 'Sur les remparts', 'Couper le monologue du début', 1, 900, 1),
  (2, 1, 'Acte 1 Scène 2', 'Salle d''Audience', '', 2, 1200, 1);

insert into role(id, play_id, name, description)
values
  (1, 1, 'Hamlet', 'Prince du Danemark'),
  (2, 1, 'Claudius', 'Roi du Danemark');

insert into role_scene(role_id, scene_id)
values
  (1, 1),
  (1, 2),
  (2, 2);

insert into scene_preference(user_id, scene_id, level)
values
  (2, 1, 'HIGH');

insert into role_preference(user_id, scene_id, role_id, level)
values
  (2, 1, 1, 'HIGH');

insert into casting(user_id, scene_id, role_id)
values
  (2, 1, 1),
  (2, 2, 1);

insert into event(id, troupe_id, owner_id, type, title, start_time, end_time, location, description)
values
  (1, 1, 1, 'COURSE', 'Cours du jeudi', '2026-06-04 19:00:00', '2026-06-04 21:00:00', 'Salle des fêtes', 'Répétition de l''acte 1');

insert into event_presence(event_id, user_id, status)
values
  (1, 2, 'PENDING');
