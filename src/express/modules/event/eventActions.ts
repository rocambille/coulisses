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

const read: RequestHandler = (req, res) => {
  res.json(req.event);
};

const add: RequestHandler = (req, res) => {
  const insertId = eventRepository.create(req.troupe.id, req.me.id, req.body);
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

const setPresence: RequestHandler = (req, res) => {
  const { status } = req.body;
  eventRepository.setPresence(req.event.id, req.me.id, status);
  res.sendStatus(204);
};

export default {
  browse,
  read,
  add,
  edit,
  destroy,
  setPresence,
};
