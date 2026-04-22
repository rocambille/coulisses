import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import express, { type ErrorRequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import supertest from "supertest";

import database from "../../src/database";
import {
  allPlays,
  allUsers,
  deletedUser,
  emptyPlay,
  emptyPlayMembers,
  mainCastings,
  mainPlay,
  mainPlayMembers,
  mainPreferences,
  mainRoles,
  mainScenes,
  openingNightEvent,
} from "../data";

// -------------------------
// DB mock
// -------------------------

vi.mock("../../src/database", () => ({
  default: new DatabaseSync(":memory:"),
}));

const mockDatabase = () => {
  /* drop existing tables */
  const existingTables = database
    .prepare(`
    select name 
    from sqlite_schema 
    where type ='table' and name not like 'sqlite_%'`)
    .all();

  /* prevent errors because of cascade deletion */
  database.exec("PRAGMA foreign_keys = OFF");

  for (const table of existingTables) {
    database.exec(`drop table ${table.name}`);
  }

  /* re-enable cascade deletion */
  database.exec("PRAGMA foreign_keys = ON");

  /* load schema */
  const schema = path.join(
    import.meta.dirname,
    "../../src/database/schema.sql",
  );

  const schemaSql = fs.readFileSync(schema, "utf8");
  database.exec(schemaSql);

  /* insert all users */
  const insertUser = database.prepare(
    "insert into user(id, email, name) values(?, ?, ?)",
  );
  for (const user of allUsers) {
    insertUser.run(user.id, user.email, user.name);
  }

  /* soft delete one user for tests */
  const deleteUser = database.prepare(
    "update user set deleted_at = datetime('now') where id = ?",
  );
  deleteUser.run(deletedUser.id);

  /* insert all plays */
  const insertPlay = database.prepare(
    "insert into play(id, title, description) values(?, ?, ?)",
  );
  for (const play of allPlays) {
    insertPlay.run(play.id, play.title, play.description ?? null);
  }

  /* insert play members */
  const insertPlayMember = database.prepare(
    "insert into member_play(play_id, user_id, role) values(?, ?, ?)",
  );
  for (const member of mainPlayMembers) {
    insertPlayMember.run(mainPlay.id, member.id, member.role);
  }
  for (const member of emptyPlayMembers) {
    insertPlayMember.run(emptyPlay.id, member.id, member.role);
  }

  /* insert all scenes */
  const insertScene = database.prepare(
    "insert into scene(id, play_id, title, description, duration, scene_order, is_active) values(?, ?, ?, ?, ?, ?, ?)",
  );
  for (const scene of mainScenes) {
    insertScene.run(
      scene.id,
      scene.play_id,
      scene.title,
      scene.description ?? null,
      scene.duration ?? null,
      scene.scene_order,
      scene.is_active ? 1 : 0,
    );
  }

  /* insert all roles */
  const insertRole = database.prepare(
    "insert into role(id, play_id, name, description) values(?, ?, ?, ?)",
  );
  const insertRoleScene = database.prepare(
    "insert into role_scene(role_id, scene_id) values(?, ?)",
  );
  for (const role of mainRoles) {
    insertRole.run(role.id, role.play_id, role.name, role.description ?? null);
    for (const scene of role.scenes) {
      insertRoleScene.run(role.id, scene.id);
    }
  }

  /* insert castings */
  const insertCasting = database.prepare(
    "insert into casting(user_id, role_id) values(?, ?)",
  );
  for (const casting of mainCastings) {
    insertCasting.run(casting.user_id, casting.role_id);
  }

  /* insert all events */
  database
    .prepare(
      "insert into event(id, play_id, type, title, description, location, start_time, end_time) values(?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .run(
      openingNightEvent.id,
      openingNightEvent.play_id,
      openingNightEvent.type,
      openingNightEvent.title,
      openingNightEvent.description ?? null,
      openingNightEvent.location ?? null,
      openingNightEvent.start_time,
      openingNightEvent.end_time,
    );

  /* insert preferences */
  const insertPreference = database.prepare(
    "insert into preference(user_id, scene_id, level) values(?, ?, ?)",
  );
  for (const preference of mainPreferences) {
    insertPreference.run(
      preference.user_id,
      preference.scene_id,
      preference.level,
    );
  }

  /* insert magic link tokens */
  const insertMagicLinkToken = database.prepare(
    "insert into magic_link_token(user_id, token_hash, expires_at, consumed_at) values(?, ?, ?, ?)",
  );

  const hash = (token: string) =>
    crypto.createHash("sha256").update(token).digest("hex");

  /* valid token for testing valid token scenarios */
  const validDate = new Date(Date.now() + 100000);
  insertMagicLinkToken.run(
    allUsers[0].id,
    hash(requestValue("auth", "verify", "teacher", "token")),
    validDate.toISOString(),
    null,
  );

  /* expired token for testing expired token scenarios */
  const expiredDate = new Date(Date.now() - 100000);
  insertMagicLinkToken.run(
    allUsers[0].id,
    hash(requestValue("auth", "verify", "expired", "token")),
    expiredDate.toISOString(),
    null,
  );

  /* consumed token for testing consumed token scenarios */
  insertMagicLinkToken.run(
    allUsers[0].id,
    hash(requestValue("auth", "verify", "consumed", "token")),
    expiredDate.toISOString(),
    expiredDate.toISOString(),
  );

  /* deleted user for testing deleted user scenarios */
  insertMagicLinkToken.run(
    deletedUser.id,
    hash(requestValue("auth", "verify", "deleted_user", "token")),
    validDate.toISOString(),
    null,
  );
};

// -------------------------
// Nodemailer mock
// -------------------------

vi.mock("nodemailer", async (importActual) => {
  const actual = await importActual<typeof import("nodemailer")>();
  return {
    ...actual,
    default: {
      ...actual,
      createTransport: vi.fn(() =>
        actual.createTransport({ jsonTransport: true }),
      ),
    },
  };
});

// -------------------------
// Helpers
// -------------------------

import { type Contract, contracts, type Test } from "../contracts";

export const setupMocks = () => {
  mockDatabase();

  vi.spyOn(jwt, "sign").mockImplementation(() => "fake_jwt_token");
};

export const requestValue = (
  contractName: keyof typeof contracts,
  testName: keyof Contract,
  caseName: keyof Test["cases"],
  field: string,
) => {
  const body = contracts[contractName][testName].cases[caseName].request.body;
  if (typeof body === "object" && body !== null && !Array.isArray(body)) {
    return body[field]?.toString() ?? "";
  }
  throw new Error(`Case body is not an object: ${JSON.stringify(body)}`);
};

// -------------------------
// Express app for tests
// -------------------------
import routes from "../../src/express/routes";

const app = express();
app.use(routes);

// Log server-side errors for debugging
const logErrors: ErrorRequestHandler = (err, req, _res, next) => {
  console.error("Express error:", err);
  console.error("Request:", req.method, req.path);
  next(err);
};

app.use(logErrors);

// Wrapper for supertest
const api = supertest(app);

// Helper to check a test case
export const check = async (test: Test, caseName: keyof Test["cases"]) => {
  const c = test.cases[caseName];

  const apiCall = api[test.method](c.specialPath ?? test.path);

  if (c.request.body != null) {
    apiCall.send(c.request.body);
  }

  const cookies = [];

  if (c.request.jwtPayload !== undefined) {
    cookies.push("__Host-auth=jwt");

    vi.spyOn(jwt, "verify").mockImplementation((): JwtPayload => {
      if (c.request.jwtPayload == null) {
        throw new Error("Invalid token");
      }

      return { sub: c.request.jwtPayload.sub.toString() };
    });
  }

  if (apiCall.method !== "GET" && !c.request.withoutCsrfProtection) {
    apiCall.set("X-CSRF-Token", "a-b-c-d-e");
    cookies.push("__Host-x-csrf-token=a-b-c-d-e");
  }

  const response = await apiCall.set("Cookie", cookies);

  expect(response.status).toBe(c.response.status);
  expect(response.body).toEqual(c.response.body);

  if (c.response.and) {
    c.response.and(response);
  }

  return response;
};
