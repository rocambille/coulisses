/*
  Purpose:
  Define HTTP request handlers for Play-related operations.
*/

import type { RequestHandler } from "express";
import userRepository from "../user/userRepository";
import playRepository from "./playRepository";

const browse: RequestHandler = (req, res) => {
  const plays = playRepository.findByUser(req.me);
  res.json(plays);
};

const read: RequestHandler = (req, res) => {
  res.json(req.play);
};

const edit: RequestHandler = (req, res) => {
  playRepository.update(req.play.id, req.body);
  res.sendStatus(204);
};

const add: RequestHandler = (req, res) => {
  const insertId = playRepository.create(req.body);

  // Directly add the creator as TEACHER
  playRepository.addMember(insertId, req.me.id, "TEACHER");

  res.status(201).json({ insertId });
};

const destroy: RequestHandler = (req, res) => {
  playRepository.hardDelete(req.play.id);
  res.sendStatus(204);
};

const browseMembers: RequestHandler = (req, res) => {
  const members = playRepository.getMembers(req.play.id);
  res.json(members);
};

const addMember: RequestHandler = (req, res) => {
  const { email, role } = req.body;
  const { play } = req;

  const user = userRepository.findOrCreateByEmail(email);
  playRepository.addMember(play.id, user.id, role);

  res.sendStatus(204);
};

export default {
  browse,
  read,
  edit,
  add,
  destroy,
  browseMembers,
  addMember,
};
