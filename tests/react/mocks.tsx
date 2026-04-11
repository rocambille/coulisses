import { act, render, renderHook } from "@testing-library/react";
import { createRoutesStub } from "react-router";

import { AuthProvider } from "../../src/react/components/auth/AuthContext";
import { RefreshProvider } from "../../src/react/components/RefreshContext";
import { type Contract, contracts, type Test } from "../contracts";

export * from "../data";

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
  custom?: (
    path: string,
    method: string,
    init?: RequestInit,
  ) => Promise<Response> | undefined,
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

      // --- From contracts ---
      for (const [_contractName, contract] of Object.entries(contracts)) {
        for (const [_testName, test] of Object.entries(contract)) {
          for (const [_caseName, c] of Object.entries(test.cases)) {
            if (path === (c.path ?? test.path) && method === test.method) {
              if (init?.body === JSON.stringify(c.request.body)) {
                return fromContract(c.response);
              }
            }
          }
        }
      }

      if (path === "/api/404" && method === "get") {
        return respond(null, 404);
      }

      throw new Error(
        `[Contract Mock] Unhandled fetch: ${method.toUpperCase()} ${path} with ${JSON.stringify(init)}`,
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

export const fromRequestBody = (
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

const expectFetch = (path: string, method: string, body?: unknown) => {
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

export const expectFetchFrom = (
  contractName: keyof typeof contracts,
  testName: keyof Contract,
  caseName: keyof Test["cases"],
) => {
  const contract = contracts[contractName][testName];
  const c = contract.cases[caseName];
  expectFetch(c.path ?? contract.path, contract.method, c.request.body);
};

export const expectNoFetch = (path: string, method: string) => {
  expect(globalThis.fetch).not.toHaveBeenCalledWith(
    path,
    expect.objectContaining({
      method,
    }),
  );
};
