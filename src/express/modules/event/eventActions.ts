/*
  Purpose:
  Handlers for Event operations.
*/

import type { RequestHandler } from "express";
import eventRepository from "./eventRepository";

const browse: RequestHandler = (req, res) => {
  const events = eventRepository.findByPlay(req.play.id);
  res.json(events);
};

const add: RequestHandler = (req, res) => {
  const insertId = eventRepository.create({
    ...req.body,
    play_id: req.play.id,
  });

  res.status(201).json({ insertId });
};

const edit: RequestHandler = (req, res) => {
  eventRepository.update(req.event.id, req.body);
  res.sendStatus(204);
};

const destroy: RequestHandler = (req, res) => {
  eventRepository.destroy(req.event.id);
  res.sendStatus(204);
};

export default { browse, add, edit, destroy };
