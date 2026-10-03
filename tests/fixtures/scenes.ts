/*
  Purpose:
  Centralize all mocked data for both API and React tests.
  This ensures consistency and eliminates duplication.

  Naming:
  Use descriptive names (e.g., teacherUser, mainPlay, mainTroupe) to make tests more readable.
*/

import type { DatabaseSync } from "node:sqlite";

import { mainPlay } from "./plays";

export const mainScenes: Scene[] = [
  {
    id: 1,
    play_id: mainPlay.id,
    title: "Scene 1",
    description: "First scene",
    cut_notes: "Couper la fin",
    duration_estimated_seconds: 600,
    order_in_play: 1,
    is_active: true,
  },
  {
    id: 2,
    play_id: mainPlay.id,
    title: "Scene 2",
    description: "Second scene",
    cut_notes: "",
    duration_estimated_seconds: 1200,
    order_in_play: 2,
    is_active: false,
  },
  {
    id: 3,
    play_id: mainPlay.id,
    title: "Scene 3",
    description: "",
    cut_notes: "",
    duration_estimated_seconds: 900,
    order_in_play: 3,
    is_active: true,
  },
];

export const seedScenes = (db: DatabaseSync) => {
  const insertScene = db.prepare(
    "insert into scene(id, play_id, title, description, cut_notes, duration_estimated_seconds, order_in_play, is_active) values(?, ?, ?, ?, ?, ?, ?, ?)",
  );
  for (const scene of mainScenes) {
    insertScene.run(
      scene.id,
      scene.play_id,
      scene.title,
      scene.description,
      scene.cut_notes,
      scene.duration_estimated_seconds,
      scene.order_in_play,
      scene.is_active ? 1 : 0,
    );
  }
};
