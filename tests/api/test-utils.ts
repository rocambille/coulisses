import crypto from "node:crypto";
import express, { type ErrorRequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { QueryOptions } from "mysql2";
import supertest from "supertest";

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

import databaseClient from "../../src/database/client";
import routes from "../../src/express/routes";
import { type Contract, contracts, type Test } from "../contracts";
import { allItems, allUsers, fooUser, insertId } from "../data";

// -------------------------
// Mocked DB content
// -------------------------
export const mockedData = {
  item: allItems,
  user: allUsers,
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

        // --- AUTH SPECIAL (Magic link token) ---
        if (
          /select id, user_id, token_hash, expires_at, consumed_at from magic_link_token where token_hash =/i.test(
            normalizedSql,
          )
        ) {
          const hash = normalizedSql.match(/token_hash = '([^']+)'/i)?.[1];
          if (
            hash ===
            crypto
              .createHash("sha256")
              .update(requestValue("auth", "verify", "teacher", "token"))
              .digest("hex")
          ) {
            return [
              [
                {
                  id: 1,
                  user_id: fooUser.id,
                  token_hash: hash,
                  expires_at: new Date(Date.now() + 100000),
                  consumed_at: null,
                },
              ],
              [],
            ];
          }
          if (
            hash ===
            crypto
              .createHash("sha256")
              .update(requestValue("auth", "verify", "unauthorized", "token"))
              .digest("hex")
          ) {
            return [[], []];
          }
          if (
            hash ===
            crypto
              .createHash("sha256")
              .update(requestValue("auth", "verify", "consumed", "token"))
              .digest("hex")
          ) {
            return [
              [
                {
                  id: 1,
                  user_id: fooUser.id,
                  token_hash: hash,
                  expires_at: new Date(Date.now() + 100000),
                  consumed_at: new Date(),
                },
              ],
              [],
            ];
          }
          if (
            hash ===
            crypto
              .createHash("sha256")
              .update(requestValue("auth", "verify", "expired", "token"))
              .digest("hex")
          ) {
            return [
              [
                {
                  id: 1,
                  user_id: fooUser.id,
                  token_hash: hash,
                  expires_at: new Date(Date.now() - 100000),
                  consumed_at: null,
                },
              ],
              [],
            ];
          }
          if (
            hash ===
            crypto
              .createHash("sha256")
              .update(requestValue("auth", "verify", "deleted_user", "token"))
              .digest("hex")
          ) {
            return [
              [
                {
                  id: 1,
                  user_id: NaN,
                  token_hash: hash,
                  expires_at: new Date(Date.now() + 100000),
                  consumed_at: null,
                },
              ],
              [],
            ];
          }
        }

        // --- SELECT (Strict Registry) ---

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

export const setupMocks = () => {
  mockDatabaseClient();
  vi.spyOn(jwt, "sign").mockImplementation(() => "fake_jwt_token");
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
const api = supertest(app);

// Helper to check a test case
export const check = async (test: Test, caseName: keyof Test["cases"]) => {
  const c = test.cases[caseName];

  const apiCall = api[test.method](c.path ?? test.path);

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
