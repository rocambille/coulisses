/*
  Purpose:
  Define HTTP request handlers for Event-related operations.
*/

import type { RequestHandler } from "express";
import eventRepository from "./eventRepository";

const browse: RequestHandler = (req, res) => {
  const events = eventRepository.findByTroupe(req.troupe.id);
  res.json(events);
};

const add: RequestHandler = (req, res) => {
  const insertId = eventRepository.create(req.body);
  res.status(201).json({ insertId });
};

const edit: RequestHandler = (req, res) => {
  eventRepository.update(req.body);
  res.sendStatus(204);
};

const destroy: RequestHandler = (req, res) => {
  eventRepository.destroy(req.event.id);
  res.sendStatus(204);
};

const setPresence: RequestHandler = (req, res) => {
  eventRepository.setPresence(req.body);
  res.sendStatus(204);
};

export default {
  browse,
  add,
  edit,
  destroy,
  setPresence,
};
