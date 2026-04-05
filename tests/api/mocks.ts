import express, { type ErrorRequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { QueryOptions } from "mysql2";
import supertest, { type Test } from "supertest";

import databaseClient from "../../src/database/client";
import routes from "../../src/express/routes";
import { initialMockedData, insertId } from "../mocks";

export * from "../mocks";

// -------------------------
// Mocked DB content
// -------------------------
export const mockedData = { ...initialMockedData };

// Allows a clean slate per test
export const resetMockData = () => {
  mockedData.user = [...initialMockedData.user];
  mockedData.play = [...initialMockedData.play];
  mockedData.play_member = [...initialMockedData.play_member];
  mockedData.scene = [...initialMockedData.scene];
  mockedData.role = [...initialMockedData.role];
  mockedData.scene_role = [...initialMockedData.scene_role];
  mockedData.preference = [...initialMockedData.preference];
  mockedData.casting = [...initialMockedData.casting];
  mockedData.event = [...initialMockedData.event];
};

export const setupApiMocks = () => {
  resetMockData();
  mockDatabaseClient();
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
export const mockDatabaseClient = () => {
  databaseClient.query = vi
    .fn()
    .mockImplementation(
      async (sqlOrOptions: string | QueryOptions, values?: unknown) => {
        let sql =
          typeof sqlOrOptions === "string" ? sqlOrOptions : sqlOrOptions.sql;

        if (Array.isArray(values)) {
          for (const value of values as unknown[]) {
            sql = sql.replace(/\?/, new Object(value).toString());
          }
        }

        // INSERT -----------------------------------
        if (/\binsert\b/i.test(sql)) {
          return [{ insertId }, []];
        }

        // SELECT -----------------------------------
        if (/\bselect\b/i.test(sql)) {
          // Custom handler for playRepository.getMembers
          if (
            /\bjoin\s+play_member\s+pm\b/i.test(sql) &&
            /\bfrom\s+user\s+u\b/i.test(sql)
          ) {
            const playIdMatch = sql.match(/pm\.play_id\s*=\s*([^\s]+)/i);
            const playId = playIdMatch ? Number(playIdMatch[1]) : NaN;

            return [members({ id: playId }), []];
          }

          // Custom handler for playRepository.browseForUser
          if (
            /\bjoin\s+play_member\s+pm\b/i.test(sql) &&
            /\bfrom\s+play\s+p\b/i.test(sql)
          ) {
            const userIdMatch = sql.match(/pm\.user_id\s*=\s*([^\s]+)/i);
            const userId = userIdMatch ? Number(userIdMatch[1]) : null;

            const plays = mockedData.play_member
              .filter((pm) => pm.user_id === userId)
              .map((pm) => mockedData.play.find((p) => p.id === pm.play_id))
              .filter(Boolean);

            return [plays, []];
          }

          // Custom handler for roleRepository.browseByPlay
          if (
            /\bjoin\s+scene_role\s+sr\b/i.test(sql) &&
            /\bfrom\s+role\s+r\b/i.test(sql)
          ) {
            const playIdMatch = sql.match(/r\.play_id\s*=\s*([^\s]+)/i);
            const playId = playIdMatch ? Number(playIdMatch[1]) : null;

            const roles = mockedData.role
              .filter((r) => r.play_id === playId)
              .map((r) => {
                const roleId = (r as { id: number }).id;
                const scenes = mockedData.scene_role
                  .filter((sr) => sr.role_id === roleId)
                  .map((sr) =>
                    mockedData.scene.find((s) => s.id === sr.scene_id),
                  )
                  .filter(Boolean);
                return { ...r, scenes: JSON.stringify(scenes) };
              });

            return [roles, []];
          }

          const mayBeTableMatch = sql.match(/\bfrom\s+(\w+)/i);
          const mayBeTable = mayBeTableMatch ? mayBeTableMatch[1] : null;

          if (!mayBeTable || !Object.hasOwn(mockedData, mayBeTable)) {
            throw new Error(`Unrecognized table in query: ${sql}`);
          }

          const table: keyof typeof mockedData =
            mayBeTable as keyof typeof mockedData;

          // WHERE id = ?
          if (/\bwhere\s+id\s*=/i.test(sql)) {
            const id = sql.match(/\s+id\s*=\s*([^\s]+)/)?.at(1);

            if (table === "casting") {
              return [
                mockedData[table].filter((row) => row.role_id === Number(id)),
                [],
              ];
            }

            return [
              mockedData[table].filter((row) => row.id === Number(id)),
              [],
            ];
          }

          // WHERE email = ?
          if (/\bwhere\s+email\s*=/i.test(sql)) {
            const email = sql.match(/\s+email\s*=\s*([^\s]+)/)?.at(1);

            return [
              mockedData[table].filter(
                (row) =>
                  ((
                    row as {
                      email?: string;
                    }
                  ).email ?? "") === email,
              ),
              [],
            ];
          }

          return [mockedData[table], []];
        }

        // UPDATE -----------------------------------
        if (/\bupdate\b/i.test(sql)) {
          const mayBeTable = sql.match(/\bupdate\s+(\w+)/i)?.[1];

          if (!mayBeTable || !Object.hasOwn(mockedData, mayBeTable)) {
            throw new Error(`Unrecognized table in query: ${sql}`);
          }

          const table: keyof typeof mockedData =
            mayBeTable as keyof typeof mockedData;

          const id = sql.match(/\s+id\s*=\s*([^\s]+)/)?.at(1);

          if (table === "casting") {
            return [
              {
                affectedRows: mockedData[table].some(
                  (row) => row.role_id === Number(id),
                )
                  ? 1
                  : 0,
              },
              [],
            ];
          }

          return [
            {
              affectedRows: mockedData[table].some(
                (row) => row.id === Number(id),
              )
                ? 1
                : 0,
            },
            [],
          ];
        }

        // DELETE -----------------------------------
        if (/\bdelete\b/i.test(sql)) {
          const mayBeTable = sql.match(/\bfrom\s+(\w+)/i)?.[1];

          if (!mayBeTable || !Object.hasOwn(mockedData, mayBeTable)) {
            throw new Error(`Unrecognized table in query: ${sql}`);
          }

          const table: keyof typeof mockedData =
            mayBeTable as keyof typeof mockedData;

          const id = sql.match(/\s+id\s*=\s*([^\s]+)/)?.at(1);

          if (table === "casting") {
            return [
              {
                affectedRows: mockedData[table].some(
                  (row) => row.role_id === Number(id),
                )
                  ? 1
                  : 0,
              },
              [],
            ];
          }

          return [
            {
              affectedRows: mockedData[table].some(
                (row) => row.id === Number(id),
              )
                ? 1
                : 0,
            },
            [],
          ];
        }

        throw new Error(`Unhandled SQL query: ${sql}`);
      },
    );
};

// -------------------------
// JWT.verify mock
// -------------------------
export const mockJwtVerify = (sub: string | null) => {
  return vi.spyOn(jwt, "verify").mockImplementation((): JwtPayload => {
    if (sub == null) {
      throw new Error("Invalid token");
    }

    return { sub };
  });
};

export const setupApiAuth = (user: { id: number } | null) => {
  mockJwtVerify(user ? user.id.toString() : null);
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
    withAuth,
    withCsrf,
  }: {
    withAuth: boolean;
    withCsrf: boolean;
  },
) =>
  withAuth && withCsrf
    ? apiCall
        .set("Cookie", ["__Host-auth=jwt", "__Host-x-csrf-token=a-b-c-d-e"])
        .set("X-CSRF-Token", "a-b-c-d-e")
    : withAuth
      ? apiCall.set("Cookie", ["__Host-auth=jwt"])
      : withCsrf
        ? apiCall
            .set("Cookie", ["__Host-x-csrf-token=a-b-c-d-e"])
            .set("X-CSRF-Token", "a-b-c-d-e")
        : apiCall;
