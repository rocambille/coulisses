import { act, render, renderHook } from "@testing-library/react";
import { createRoutesStub } from "react-router";

import { AuthProvider } from "../../src/react/components/auth/AuthContext";
import { RefreshProvider } from "../../src/react/components/RefreshContext";
import { contracts } from "../contracts";

export * from "../mocks";

// -------------------------
// Fetch mock (contract-based)
// -------------------------

const respond = (data: unknown, status: number) => {
  const json = JSON.stringify(data);

  if (json === "{}") {
    return Promise.resolve(new Response(null, { status }));
  }

  return Promise.resolve(
    new Response(json, {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
};

const fromContract = (c: { status: number; body: unknown }) =>
  respond(c.body, c.status);

export const mockFetch = (
  custom?: (path: string, method: string) => Promise<Response> | undefined,
) => {
  globalThis.fetch = vi
    .fn<typeof globalThis.fetch>()
    .mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const path =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.pathname
            : input.url;

      const method = init?.method?.toLowerCase() ?? "get";

      // Allow per-test overrides
      if (custom) {
        const customResult = custom(path, method);
        if (customResult != null) return customResult;
      }

      // --- Auth ---
      if (path === "/api/auth/magic-link" && method === "post")
        return fromContract(contracts.auth.magicLink);
      if (path === "/api/auth/verify" && method === "post")
        return fromContract(contracts.auth.verifySuccess);
      if (path === "/api/auth/logout" && method === "post")
        return fromContract(contracts.auth.logout);
      if (path === "/api/me" && method === "get")
        return fromContract(contracts.auth.me);

      // --- Plays (collection) ---
      if (path === "/api/plays" && method === "get")
        return fromContract(contracts.plays.browse);
      if (path === "/api/plays" && method === "post")
        return fromContract(contracts.plays.create);

      // --- Play sub-resources (must be matched before /api/plays/:id) ---
      if (path.match(/\/api\/plays\/\d+\/castings/) && method === "get")
        return fromContract(contracts.plays.castings.browse);
      if (path.match(/\/api\/plays\/\d+\/castings/) && method === "post")
        return fromContract(contracts.plays.castings.assign);
      if (path.match(/\/api\/plays\/\d+\/castings/) && method === "delete")
        return fromContract(contracts.plays.castings.unassign);

      if (path.match(/\/api\/plays\/\d+\/events/) && method === "get")
        return fromContract(contracts.plays.events.browse);
      if (path.match(/\/api\/plays\/\d+\/events/) && method === "post")
        return fromContract(contracts.plays.events.create);

      if (path.match(/\/api\/plays\/\d+\/members/) && method === "get")
        return fromContract(contracts.plays.members.browse);
      if (path.match(/\/api\/plays\/\d+\/members/) && method === "post")
        return fromContract(contracts.plays.members.invite);

      if (path.match(/\/api\/plays\/\d+\/preferences/) && method === "get")
        return fromContract(contracts.plays.preferences.browse);
      if (path.match(/\/api\/scenes\/\d+\/preferences/) && method === "post")
        return fromContract(contracts.scenes.preferences.upsert);

      if (path.match(/\/api\/plays\/\d+\/roles/) && method === "get")
        return fromContract(contracts.plays.roles.browse);
      if (path.match(/\/api\/plays\/\d+\/roles/) && method === "post")
        return fromContract(contracts.plays.roles.create);

      if (path.match(/\/api\/plays\/\d+\/scenes/) && method === "get")
        return fromContract(contracts.plays.scenes.browse);
      if (path.match(/\/api\/plays\/\d+\/scenes/) && method === "post")
        return fromContract(contracts.plays.scenes.create);

      // --- Standalone resources ---
      if (path.match(/\/api\/events\/\d+/) && method === "put")
        return fromContract(contracts.events.update);
      if (path.match(/\/api\/events\/\d+/) && method === "delete")
        return fromContract(contracts.events.delete);

      if (path.match(/\/api\/scenes\/\d+/) && method === "get")
        return fromContract(contracts.scenes.get);
      if (path.match(/\/api\/scenes\/\d+/) && method === "put")
        return fromContract(contracts.scenes.update);
      if (path.match(/\/api\/scenes\/\d+/) && method === "delete")
        return fromContract(contracts.scenes.delete);

      if (path.match(/\/api\/users\/\d+/) && method === "get")
        return fromContract(contracts.users.get);

      // --- Plays (single) ---
      if (path.match(/\/api\/plays\/\d+$/) && method === "get")
        return fromContract(contracts.plays.get);
      if (path.match(/\/api\/plays\/\d+$/) && method === "put")
        return fromContract(contracts.plays.update);
      if (path.match(/\/api\/plays\/\d+$/) && method === "delete")
        return fromContract(contracts.plays.delete);

      // --- 404 test ---
      if (path === "/api/404") return fromContract(contracts.errors.notFound);

      throw new Error(
        `[Contract Mock] Unhandled fetch: ${method.toUpperCase()} ${path}`,
      );
    });
};

// Wrapping render in act is required here because useItems is suspending
// see https://github.com/testing-library/react-testing-library/issues/1375#issuecomment-2582198933
export const renderHookAsync = async <
  Result,
  Props,
  RenderHookParameters extends Parameters<typeof renderHook<Result, Props>>,
>(
  render: RenderHookParameters[0],
  options?: RenderHookParameters[1],
) => await act(async () => renderHook<Result, Props>(render, options));

type StubRouteObject = Parameters<typeof createRoutesStub>[0][number];

const stubRoute = (
  path: StubRouteObject["path"],
  Component: StubRouteObject["Component"],
  options: { user?: User | null } = {},
) =>
  createRoutesStub([
    {
      path,
      Component: (props) => {
        if (Component == null) {
          return null;
        }
        return (
          <AuthProvider initialUser={options.user}>
            <RefreshProvider>
              <Component {...props} />
            </RefreshProvider>
          </AuthProvider>
        );
      },
      ErrorBoundary:
        // Catch component errors and report them to the test runner
        ({ error }) => {
          throw error;
        },
    },
  ]);

// Wrapping render in act is required here because we use Suspense (cache)
// see https://github.com/testing-library/react-testing-library/issues/1375#issuecomment-2582198933
export const renderWithStub = async (
  path: StubRouteObject["path"],
  Component: StubRouteObject["Component"],
  initialEntries: string[],
  options: { user?: User | null } = {},
) => {
  const Stub = stubRoute(path, Component, options);
  return await act(async () =>
    render(<Stub initialEntries={initialEntries} />),
  );
};

const mockedRandomUUID = "a-b-c-d-e";

export const setupApiMocks = (
  customFetch?: (path: string, method: string) => Promise<Response> | undefined,
) => {
  vi.stubGlobal("cookieStore", { get: vi.fn(), set: vi.fn() });
  vi.spyOn(crypto, "randomUUID").mockImplementation(() => mockedRandomUUID);
  mockFetch(customFetch);
};

export const expectCsrfCookie = () => {
  expect(globalThis.cookieStore.set).toHaveBeenCalledWith({
    expires: expect.any(Number),
    name: "__Host-x-csrf-token",
    path: "/",
    sameSite: "strict",
    value: mockedRandomUUID,
  });
};

export const expectFetch = (path: string, method: string, body?: unknown) => {
  const headers: Record<string, string> = {};

  if (method !== "get") {
    headers["X-CSRF-Token"] = mockedRandomUUID;
  }
  if (body) {
    headers["Content-Type"] = "application/json";
  }

  const fetchArgs: Parameters<typeof globalThis.fetch> = [path];

  if (Object.keys(headers).length > 0 || method !== "get" || body) {
    fetchArgs.push({
      ...(method !== "get" ? { method } : {}),
      ...(Object.keys(headers).length > 0 ? { headers } : {}),
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  }

  expect(globalThis.fetch).toHaveBeenCalledWith(...fetchArgs);
};

export const expectNoFetch = (path: string, method: string) => {
  expect(globalThis.fetch).not.toHaveBeenCalledWith(
    path,
    expect.objectContaining({
      method,
    }),
  );
};
