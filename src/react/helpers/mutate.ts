/*
  Purpose:
  Provide a CSRF token helper designed for stateless servers and 
  a mutative fetch wrapper.

  Related docs:
  - https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
*/

import * as cache from "./cache";

/* ************************************************************************ */
/* CSRF Token                                                               */
/* ************************************************************************ */

const csrfTokenExpiresIn = 30 * 1000;
let csrfTokenExpiresAt = Date.now();

/*
  csrfToken():
  - Returns a valid CSRF token
  - Renews or regenerates it if needed
  - Persists it in a secure cookie
*/
const CSRF_COOKIE = "__Host-x-csrf-token";

// 32 random bytes as hex — works on any browser with Web Crypto
const generateToken = (): string =>
  Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");

const readCookie = (name: string): string | null => {
  const prefix = `${name}=`;
  const entry = document.cookie
    .split("; ")
    .find((part) => part.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
};

const writeCookie = (name: string, value: string, expiresAt: number) => {
  // __Host- prefix requires Secure + Path=/ and no Domain
  document.cookie = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "Secure",
    "SameSite=Strict",
    `Expires=${new Date(expiresAt).toUTCString()}`,
  ].join("; ");
};

export const csrfToken = async () => {
  const getToken = () => {
    // Return a new token if expiration date is reached
    if (Date.now() > csrfTokenExpiresAt) {
      return generateToken();
    }

    // Return the stored token, or a new one if not found
    return readCookie(CSRF_COOKIE) ?? generateToken();
  };

  const token = getToken();

  // Update the expiration date for the token
  csrfTokenExpiresAt = Date.now() + csrfTokenExpiresIn;

  // Set/update the token in a secure cookie
  writeCookie(CSRF_COOKIE, token, csrfTokenExpiresAt);

  return token;
};

/* ************************************************************************ */
/* Mutation                                                                 */
/* ************************************************************************ */

/*
  mutate(url, method, body?, paths?):
  - Performs a mutative fetch (POST, PUT, DELETE)
  - Automatically attaches CSRF token
  - Refreshes cache and notifies matching subscribers if paths are provided
  - Returns the Response for status checking

  Usage:
    await mutate("/api/items/1", "put", { title: "New" }, ["/api/items"]);
*/
export const mutate = async (
  url: string,
  method: "post" | "put" | "delete",
  body?: unknown,
  paths?: string | string[],
) => {
  const headers: Record<string, string> = {
    "X-CSRF-Token": await csrfToken(),
  };

  const init: RequestInit = { method, headers };

  if (body != null) {
    if (body instanceof FormData) {
      init.body = body;
    } else {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }
  }

  const response = await fetch(url, init);

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  if (paths != null) {
    cache.refresh(paths);
  }

  return response;
};
