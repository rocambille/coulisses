/*
  Purpose:
  Define HTTP request handlers for Play-related operations.
*/

import type { RequestHandler } from "express";
import notificationHelper from "../notification/notificationHelper";
import playRepository from "./playRepository";

const browse: RequestHandler = (req, res) => {
  const plays = playRepository.findByTroupe(req.troupe.id);
  res.json(plays);
};

const read: RequestHandler = (req, res) => {
  res.json(req.play);
};

const add: RequestHandler = (req, res) => {
  const play = { ...req.body, troupe_id: req.troupe.id };

  const insertId = req.file
    ? playRepository.createWithDocument(play, {
        file_url: `/uploads/plays/${req.file.filename}`,
        mime_type: req.file.mimetype,
        original_name: req.file.originalname,
      })
    : playRepository.create(play);

  notificationHelper.playAdded(
    { ...play, id: insertId },
    req.file != null,
    req.me.id,
  );

  res.status(201).json({ insertId });
};

const edit: RequestHandler = (req, res) => {
  playRepository.update(req.body);
  res.sendStatus(204);
};

const destroy: RequestHandler = (req, res) => {
  playRepository.hardDelete(req.play.id);
  res.sendStatus(204);
};

export default {
  browse,
  read,
  add,
  edit,
  destroy,
};
