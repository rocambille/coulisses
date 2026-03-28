/*
  Purpose:
  Define HTTP request handlers for Play-related operations.
*/

import type { RequestHandler } from "express";
import playRepository from "./playRepository";

const browse: RequestHandler = async (req, res) => {
  const userId = Number(req.auth.sub);
  const plays = await playRepository.browseForUser(userId);
  res.json(plays);
};

const read: RequestHandler = (req, res) => {
  res.json(req.play);
};

const edit: RequestHandler = async (req, res) => {
  await playRepository.update(req.play.id, req.body);
  res.sendStatus(204);
};

const add: RequestHandler = async (req, res) => {
  const insertId = await playRepository.create(req.body);

  // Directly add the creator as TEACHER
  await playRepository.addMember(insertId, Number(req.auth.sub), "TEACHER");

  res.status(201).json({ insertId });
};

const destroy: RequestHandler = async (req, res) => {
  await playRepository.hardDelete(req.play.id);
  res.sendStatus(204);
};

const browseMembers: RequestHandler = async (req, res) => {
  const members = await playRepository.getMembers(req.play.id);
  res.json(members);
};

const addMember: RequestHandler = async (req, res) => {
  const { userId, role } = req.body;
  const { play } = req;

  await playRepository.addMember(play.id, userId, role);

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
