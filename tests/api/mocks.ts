import express, { type ErrorRequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { QueryOptions } from "mysql2";
import supertest, { type Test } from "supertest";

import databaseClient from "../../src/database/client";
import routes from "../../src/express/routes";
import {
  actorUser,
  allUsers,
  insertId,
  mainCastings,
  mainPlay,
  mainPreferences,
  mainRoles,
  mainScenes,
  openingNightEvent,
  teacherUser,
} from "../mocks";

export * from "../mocks";

// -------------------------
// Mocked DB content
// -------------------------

const playMembersDb: PlayMember[] = [
  {
    id: 1,
    user_id: teacherUser.id,
    play_id: mainPlay.id,
    role: "TEACHER" as const,
  },
  {
    id: 2,
    user_id: actorUser.id,
    play_id: mainPlay.id,
    role: "ACTOR" as const,
  },
];

const sceneRolesDb: { scene_id: number; role_id: number }[] = [
  { scene_id: 1, role_id: 1 },
];

const mockedData = {
  user: allUsers,
  play: [mainPlay],
  play_member: playMembersDb,
  scene: mainScenes,
  role: mainRoles,
  scene_role: sceneRolesDb,
  preference: mainPreferences,
  casting: mainCastings,
  event: [openingNightEvent],
};

export const members = (play: { id: number }) =>
  mockedData.play_member
    .filter((pm) => pm.play_id === play.id)
    .map((pm) => ({
      ...mockedData.user.find((u) => u.id === pm.user_id),
      role: pm.role,
    }));

// -------------------------
// DB mock
// -------------------------

/**
 * Normalizes SQL queries by collapsing whitespace and newlines.
 * This ensures robustness against formatting changes while remaining
 * sensitive to structural SQL changes.
 */
const normalize = (sql: string) => sql.replace(/\s+/g, " ").trim();

export const mockDatabaseClient = () => {
  databaseClient.query = vi
    .fn()
    .mockImplementation(
      async (sqlOrOptions: string | QueryOptions, values?: unknown) => {
        let sql =
          typeof sqlOrOptions === "string" ? sqlOrOptions : sqlOrOptions.sql;

        // Interpolate ? placeholders with actual values for strict matching
        if (Array.isArray(values)) {
          for (const value of values) {
            if (typeof value === "string") {
              sql = sql.replace(/\?/, `'${value}'`);
            } else {
              sql = sql.replace(/\?/, String(value));
            }
          }
        }

        const normalizedSql = normalize(sql);

        // --- INSERT / UPDATE / DELETE (Generic handlers) ---

        if (/^insert\b/i.test(normalizedSql)) {
          return [{ insertId }, []];
        }

        if (/^update\b/i.test(normalizedSql)) {
          return [{ affectedRows: 1 }, []];
        }

        if (/^delete\b/i.test(normalizedSql)) {
          return [{ affectedRows: 1 }, []];
        }

        // --- SELECT (Strict Registry) ---

        // playRepository.findByUser
        if (
          /select p\.id, p\.title, p\.description from play p join play_member pm on p\.id = pm\.play_id where pm\.user_id =/i.test(
            normalizedSql,
          )
        ) {
          const userId = Number(
            normalizedSql.match(/user_id\s*=\s*([^\s]+)/i)?.[1],
          );
          const plays = mockedData.play_member
            .filter((pm) => pm.user_id === userId)
            .map((pm) => mockedData.play.find((p) => p.id === pm.play_id))
            .filter(Boolean);
          return [plays, []];
        }

        // playRepository.getMembers
        if (
          /select u\.id, u\.email, pm\.role, u\.name from user u join play_member pm on u\.id = pm\.user_id where pm\.play_id =/i.test(
            normalizedSql,
          )
        ) {
          const playId = Number(
            normalizedSql.match(/play_id\s*=\s*([^\s]+)/i)?.[1],
          );
          return [members({ id: playId }), []];
        }

        // roleRepository.findByPlay (Role with scenes)
        if (
          /select r\.id, r\.name, r\.description, r\.play_id, json_arrayagg\(json_object\(/i.test(
            normalizedSql,
          )
        ) {
          const playId = Number(
            normalizedSql.match(/play_id\s*=\s*([^\s]+)/i)?.[1],
          );
          return [mockedData.role.filter((r) => r.play_id === playId), []];
        }

        // castingRepository.getPlayCastingMatrix (Multiple queries for matrix)
        if (/select \* from scene where play_id =/i.test(normalizedSql)) {
          const playId = Number(
            normalizedSql.match(/play_id\s*=\s*([^\s]+)/i)?.[1],
          );
          return [mockedData.scene.filter((s) => s.play_id === playId), []];
        }
        if (/select \* from role where play_id =/i.test(normalizedSql)) {
          const playId = Number(
            normalizedSql.match(/play_id\s*=\s*([^\s]+)/i)?.[1],
          );
          return [mockedData.role.filter((r) => r.play_id === playId), []];
        }
        if (
          /select scene_id, role_id from scene_role where role_id in/i.test(
            normalizedSql,
          )
        ) {
          const roleIds = normalizedSql
            .match(/role_id in \(([^)]+)\)/i)?.[1]
            ?.split(",")
            .map(Number);
          return [
            mockedData.scene_role.filter((sr) => roleIds?.includes(sr.role_id)),
            [],
          ];
        }
        if (
          /select role_id, user_id from casting where role_id in/i.test(
            normalizedSql,
          )
        ) {
          const roleIds = normalizedSql
            .match(/role_id in \(([^)]+)\)/i)?.[1]
            ?.split(",")
            .map(Number);
          return [
            mockedData.casting.filter((c) => roleIds?.includes(c.role_id)),
            [],
          ];
        }
        if (
          /select p\.* from preference p join scene s on p\.scene_id = s\.id where s\.play_id =/i.test(
            normalizedSql,
          )
        ) {
          const playId = Number(
            normalizedSql.match(/play_id\s*=\s*([^\s]+)/i)?.[1],
          );
          const scenes = mockedData.scene
            .filter((s) => s.play_id === playId)
            .map((s) => s.id);
          const preferences = mockedData.preference.filter((p) =>
            scenes.includes(p.scene_id),
          );
          return [preferences, []];
        }

        // Generic Table Selects (Single Table, e.g., browse, findById)
        const table = normalizedSql.match(/\bfrom\s+(\w+)\b/i)?.[1];

        if (table && Object.hasOwn(mockedData, table)) {
          const rows = mockedData[table as keyof typeof mockedData];

          // WHERE id = ?
          if (/\bwhere id =/i.test(normalizedSql)) {
            const id = Number(normalizedSql.match(/where id = ([^\s]+)/i)?.[1]);
            return [rows.filter((row) => "id" in row && row.id === id), []];
          }

          // WHERE email = ? (for auth)
          if (/\bwhere email =/i.test(normalizedSql)) {
            const email = normalizedSql.match(/where email = '([^']+)'/i)?.[1];
            return [
              rows.filter((row) => "email" in row && row.email === email),
              [],
            ];
          }

          return [rows, []];
        }

        throw new Error(`[Strict Mock] Unhandled SQL query: ${normalizedSql}`);
      },
    );
};

export const setupDatabaseMocks = () => {
  mockDatabaseClient();
};

// -------------------------
// JWT.verify mock
// -------------------------

export const setupApiAuth = (
  user: { id: number } | { email: string } | null,
) => {
  vi.spyOn(jwt, "verify").mockImplementation((): JwtPayload => {
    if (user == null) {
      throw new Error("Invalid token");
    }

    if ("id" in user) {
      return { sub: user.id.toString() };
    }

    return { sub: user.email };
  });
};

// -------------------------
// Express app for tests
// -------------------------
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
export const api = supertest(app);

// Helper for call options
export const using = (
  apiCall: Test,
  {
    withAuth = true,
    withCsrf = true,
  }: {
    withAuth?: boolean;
    withCsrf?: boolean;
  } = {},
) => {
  const cookies = [];
  if (withAuth) {
    cookies.push("__Host-auth=jwt");
  }
  if (apiCall.method !== "GET" && withCsrf) {
    apiCall.set("X-CSRF-Token", "a-b-c-d-e");
    cookies.push("__Host-x-csrf-token=a-b-c-d-e");
  }
  return apiCall.set("Cookie", cookies);
};
