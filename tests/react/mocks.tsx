import { act, render, renderHook } from "@testing-library/react";
import { createRoutesStub } from "react-router";

import * as AuthContext from "../../src/react/components/auth/AuthContext";
import { AuthProvider } from "../../src/react/components/auth/AuthContext";
import { RefreshProvider } from "../../src/react/components/RefreshContext";
import {
  insertId,
  mainMatrix,
  mainPlay,
  mainPlayMembers,
  mainPreferences,
  mainRoles,
  mainScenes,
  openingNightEvent,
} from "../mocks";

export * from "../mocks";

export const mockedRandomUUID = "a-b-c-d-e";

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

      if (custom) {
        const customResult = custom(path, method);

        if (customResult != null) {
          return customResult;
        }
      }
      if (path === "/api/auth/magic-link" && method === "post") {
        return Promise.resolve().then(
          () =>
            new Response(JSON.stringify({ message: "Magic link sent" }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }),
        );
      }
      if (path === "/api/auth/verify" && method === "post") {
        return Promise.resolve().then(
          () =>
            new Response(
              JSON.stringify({ id: 1, email: "foo@mail.com", name: "foo" }),
              {
                status: 200,
                headers: { "Content-Type": "application/json" },
              },
            ),
        );
      }
      if (path === "/api/auth/logout" && method === "post") {
        return Promise.resolve().then(
          () => new Response(null, { status: 204 }),
        );
      }
      if (path === "/api/me" && method === "get") {
        return Promise.resolve().then(
          () =>
            new Response(
              JSON.stringify({ id: 1, email: "foo@mail.com", name: "foo" }),
              {
                status: 200,
                headers: { "Content-Type": "application/json" },
              },
            ),
        );
      }
      if (path === "/api/plays" && method === "get") {
        return Promise.resolve().then(
          () =>
            new Response(JSON.stringify([mainPlay]), {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            }),
        );
      }
      if (path === "/api/plays" && method === "post") {
        return Promise.resolve().then(
          () =>
            new Response(JSON.stringify({ insertId }), {
              status: 201,
            }),
        );
      }
      if (path.match(/\/api\/plays\/\d+\/members/) && method === "get") {
        return Promise.resolve().then(
          () =>
            new Response(JSON.stringify(mainPlayMembers), {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            }),
        );
      }
      if (path.match(/\/api\/plays\/\d+\/members/) && method === "post") {
        return Promise.resolve().then(
          () => new Response(null, { status: 204 }),
        );
      }
      if (path.match(/\/api\/plays\/\d+\/roles/) && method === "get") {
        return Promise.resolve().then(
          () =>
            new Response(JSON.stringify(mainRoles), {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            }),
        );
      }
      if (path.match(/\/api\/plays\/\d+\/roles/) && method === "post") {
        return Promise.resolve().then(
          () =>
            new Response(JSON.stringify({ insertId }), {
              status: 201,
            }),
        );
      }
      if (path.match(/\/api\/plays\/\d+\/scenes/) && method === "get") {
        return Promise.resolve().then(
          () =>
            new Response(JSON.stringify(mainScenes), {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            }),
        );
      }
      if (path.match(/\/api\/plays\/\d+\/scenes/) && method === "post") {
        return Promise.resolve().then(
          () =>
            new Response(JSON.stringify({ insertId }), {
              status: 201,
            }),
        );
      }
      if (path.match(/\/api\/scenes\/\d+/) && method === "put") {
        return Promise.resolve().then(
          () => new Response(null, { status: 204 }),
        );
      }
      if (path.match(/\/api\/scenes\/\d+/) && method === "delete") {
        return Promise.resolve().then(
          () => new Response(null, { status: 204 }),
        );
      }
      if (path.match(/\/api\/plays\/\d+\/preferences/) && method === "get") {
        return Promise.resolve().then(
          () =>
            new Response(JSON.stringify(mainPreferences), {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            }),
        );
      }
      if (path.match(/\/api\/scenes\/\d+\/preferences/) && method === "post") {
        return Promise.resolve().then(
          () => new Response(null, { status: 204 }),
        );
      }
      if (path.match(/\/api\/plays\/\d+\/castings/) && method === "get") {
        return Promise.resolve().then(
          () =>
            new Response(JSON.stringify(mainMatrix), {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            }),
        );
      }
      if (path.match(/\/api\/plays\/\d+\/castings/) && method === "post") {
        return Promise.resolve().then(
          () => new Response(null, { status: 204 }),
        );
      }
      if (path.match(/\/api\/plays\/\d+\/castings/) && method === "delete") {
        return Promise.resolve().then(
          () => new Response(null, { status: 204 }),
        );
      }
      if (path.match(/\/api\/plays\/\d+\/events/) && method === "get") {
        return Promise.resolve().then(
          () =>
            new Response(JSON.stringify([openingNightEvent]), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }),
        );
      }
      if (path.match(/\/api\/plays\/\d+\/events/) && method === "post") {
        return Promise.resolve().then(
          () => new Response(JSON.stringify({ insertId: 1 }), { status: 201 }),
        );
      }
      if (path.match(/\/api\/events\/\d+/) && method === "delete") {
        return Promise.resolve().then(
          () => new Response(null, { status: 204 }),
        );
      }
      if (path.match(/\/api\/events\/\d+/) && method === "put") {
        return Promise.resolve().then(
          () => new Response(null, { status: 204 }),
        );
      }
      if (path.match(/\/api\/plays\/\d+/) && method === "get") {
        return Promise.resolve().then(
          () =>
            new Response(JSON.stringify(mainPlay), {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            }),
        );
      }
      if (path.match(/\/api\/plays\/\d+/) && method === "put") {
        return Promise.resolve().then(
          () => new Response(null, { status: 204 }),
        );
      }
      if (path.match(/\/api\/plays\/\d+/) && method === "post") {
        return Promise.resolve().then(
          () =>
            new Response(JSON.stringify({ insertId: 1 }), {
              status: 201,
              headers: {
                "Content-Type": "application/json",
              },
            }),
        );
      }
      if (path.match(/\/api\/plays\/\d+/) && method === "delete") {
        return Promise.resolve().then(
          () => new Response(null, { status: 204 }),
        );
      }
      if (path === "/api/404" && method === "get") {
        return Promise.resolve().then(
          () => new Response(null, { status: 404 }),
        );
      }

      throw new Error(
        `Unhandled fetch call to ${input}${init ? ` with: ${JSON.stringify(init)}` : ""}`,
      );
    });
};

export const mockUseAuth = (user: User | null) => {
  const auth: ReturnType<typeof AuthContext.useAuth> = {
    me: user,
    check: () => user != null,
    sendMagicLink: vi.fn(),
    verifyMagicLink: vi.fn(),
    logout: vi.fn(),
  };

  const spy = vi.spyOn(AuthContext, "useAuth").mockImplementation(() => auth);

  const result: [typeof auth, typeof spy] = [auth, spy];

  return result;
};

type StubRouteObject = Parameters<typeof createRoutesStub>[0][number];

export const stubRoute = (
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
export const renderAsync = async (
  ui: Parameters<typeof render>[0],
  options?: Parameters<typeof render>[1],
) => await act(async () => render(ui, options));

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

export const setupMocks = (
  customFetch?: (path: string, method: string) => Promise<Response> | undefined,
) => {
  vi.stubGlobal("cookieStore", { get: vi.fn(), set: vi.fn() });
  vi.spyOn(crypto, "randomUUID").mockImplementation(() => mockedRandomUUID);
  mockFetch(customFetch);
};

export const renderWithStub = async (
  path: StubRouteObject["path"],
  Component: StubRouteObject["Component"],
  initialEntries: string[],
  options: { user?: User | null } = {},
) => {
  const Stub = stubRoute(path, Component, options);
  return await renderAsync(<Stub initialEntries={initialEntries} />);
};
