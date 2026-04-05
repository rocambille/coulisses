/*
  Purpose:
  Handlers for Event operations.
*/

import type { RequestHandler } from "express";
import eventRepository from "./eventRepository";

const browse: RequestHandler = async (req, res) => {
  const events = await eventRepository.findByPlay(req.play.id);
  res.json(events);
};

const add: RequestHandler = async (req, res) => {
  const insertId = await eventRepository.create({
    ...req.body,
    play_id: req.play.id,
  });

  res.status(201).json({ insertId });
};

const edit: RequestHandler = async (req, res) => {
  await eventRepository.update(req.event.id, req.body);
  res.sendStatus(204);
};

const destroy: RequestHandler = async (req, res) => {
  await eventRepository.destroy(req.event.id);
  res.sendStatus(204);
};

export default { browse, add, edit, destroy };
