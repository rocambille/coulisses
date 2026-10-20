/*
  Purpose:
  Define HTTP request handlers for Troupe-related operations.
*/

import type { RequestHandler } from "express";
import userRepository from "../user/userRepository";
import {
  getTroupeInviteToken,
  getTroupeInviteUrl,
  verifyTroupeInviteToken,
} from "./troupeInviteHelper";
import troupeRepository from "./troupeRepository";

const browse: RequestHandler = (req, res) => {
  const troupes = troupeRepository.findByUser(req.me);
  res.json(troupes);
};

const read: RequestHandler = (req, res) => {
  res.json(req.troupe);
};

const getInviteLink: RequestHandler = (req, res) => {
  const token = getTroupeInviteToken(req.troupe.id);
  const inviteUrl = getTroupeInviteUrl(req.troupe.id);
  res.json({ token, inviteUrl });
};

const getJoinInfo: RequestHandler = (req, res) => {
  const token = req.query.token;
  if (!verifyTroupeInviteToken(req.troupe.id, token)) {
    res.sendStatus(403);
    return;
  }

  res.json({
    id: req.troupe.id,
    name: req.troupe.name,
    description: req.troupe.description,
  });
};

const join: RequestHandler = (req, res) => {
  const token = req.body?.token ?? req.query.token;
  if (!verifyTroupeInviteToken(req.troupe.id, token)) {
    res.sendStatus(403);
    return;
  }

  troupeRepository.addMember(req.troupe.id, req.me.id, "ACTOR");
  res.sendStatus(204);
};

const add: RequestHandler = (req, res) => {
  const insertId = troupeRepository.create(req.body, req.me.id);
  res.status(201).json({ insertId });
};

const browseMembers: RequestHandler = (req, res) => {
  const members = troupeRepository.getMembers(req.troupe.id);
  res.json(members);
};

const addMember: RequestHandler = (req, res) => {
  const { email, role } = req.body;
  const { troupe } = req;

  const userId = userRepository.findByEmailOrCreate(email);
  troupeRepository.addMember(troupe.id, userId, role);

  res.sendStatus(204);
};

const updateMember: RequestHandler = (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  try {
    troupeRepository.updateMember(req.troupe.id, Number(userId), role);
    res.sendStatus(204);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ERR_SQLITE_ERROR" &&
      "errstr" in error &&
      error.errstr === "constraint failed"
    ) {
      res.status(409).json({
        error: "Vous devez laisser au moins un administrateur dans la troupe.",
      });
    } else {
      throw error;
    }
  }
};

const removeMember: RequestHandler = (req, res) => {
  const { userId } = req.params;

  try {
    troupeRepository.removeMember(req.troupe.id, Number(userId));
    res.sendStatus(204);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ERR_SQLITE_ERROR" &&
      "errstr" in error &&
      error.errstr === "constraint failed"
    ) {
      res.status(409).json({
        error: "Vous devez laisser au moins un administrateur dans la troupe.",
      });
    } else {
      throw error;
    }
  }
};

export default {
  browse,
  read,
  getInviteLink,
  getJoinInfo,
  join,
  add,
  browseMembers,
  addMember,
  updateMember,
  removeMember,
};
