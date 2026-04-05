import { act, render, renderHook } from "@testing-library/react";
import { createRoutesStub } from "react-router";

import * as AuthContext from "../../src/react/components/auth/AuthContext";
import * as itemHooks from "../../src/react/components/item/hooks";

export const mockedRandomUUID = "a-b-c-d-e";

export const mockCsrfToken = () => {
  vi.stubGlobal("cookieStore", { get: vi.fn(), set: vi.fn() });
  vi.spyOn(crypto, "randomUUID").mockImplementation(() => mockedRandomUUID);
};

export const mockedUsers: User[] = [
  { id: 1, email: "foo@mail.com", name: "foo" },
  { id: 2, email: "bar@mail.com", name: "bar" },
  { id: 3, email: "baz@mail.com", name: "baz" },
];

export const mockedItems: Item[] = [{ id: 1, title: "foo", user_id: 1 }];

export const mockedPlays: (Play & {
  members: (User & { role: string })[];
  roles: RoleWithScenes[];
  scenes: Scene[];
  preferences: PreferenceWithUser[];
  matrix: CastingMatrix;
  events: EventData[];
})[] = [
  {
    id: 1,
    title: "foo",
    description: "foo ipsum",
    members: [
      { id: 1, email: "foo@mail.com", name: "foo", role: "TEACHER" },
      { id: 2, email: "bar@mail.com", name: "bar", role: "ACTOR" },
    ],
    roles: [],
    scenes: [
      {
        id: 1,
        title: "foo.1",
        description: "foo ipsum",
        duration: 1,
        play_id: 1,
        scene_order: 1,
        is_active: true,
      },
      {
        id: 2,
        title: "foo.2",
        description: "foo ipsum",
        duration: 2,
        play_id: 1,
        scene_order: 2,
        is_active: false,
      },
      {
        id: 3,
        title: "foo.3",
        description: "foo ipsum",
        duration: 3,
        play_id: 1,
        scene_order: 3,
        is_active: true,
      },
    ],
    preferences: [
      {
        user_id: mockedUsers[0].id,
        name: mockedUsers[0].name,
        email: mockedUsers[0].email,
        scene_id: 1,
        level: "HIGH",
      },
      {
        user_id: mockedUsers[1].id,
        name: mockedUsers[1].name,
        email: mockedUsers[1].email,
        scene_id: 1,
        level: "MEDIUM",
      },
      {
        user_id: mockedUsers[0].id,
        name: mockedUsers[0].name,
        email: mockedUsers[0].email,
        scene_id: 2,
        level: "LOW",
      },
      {
        user_id: mockedUsers[1].id,
        name: mockedUsers[1].name,
        email: mockedUsers[1].email,
        scene_id: 2,
        level: "NOT_INTERESTED",
      },
    ],
    matrix: {
      scenes: [],
      roles: [],
      sceneRoles: [],
      castings: [],
      preferences: [],
    },
    events: [
      {
        id: 1,
        title: "Opening Night",
        description: "Opening Night description",
        location: "Opéra de Reims",
        start_time: "2022-01-01T00:00:00.000Z",
        end_time: "2022-01-01T00:00:00.000Z",
        play_id: 1,
        type: "SHOW",
      },
    ],
  },
];

mockedPlays[0].roles.push({
  id: 1,
  name: "foo",
  description: "foo ipsum",
  play_id: 1,
  scenes: [mockedPlays[0].scenes[0]],
});

mockedPlays[0].matrix = {
  scenes: mockedPlays[0].scenes,
  roles: mockedPlays[0].roles,
  sceneRoles: [
    {
      scene_id: 1,
      role_id: 1,
    },
  ],
  castings: [
    {
      user_id: mockedUsers[1].id,
      role_id: 1,
    },
  ],
  preferences: mockedPlays[0].preferences.map(
    ({ user_id, scene_id, level }) => ({
      user_id,
      scene_id,
      level,
    }),
  ),
};

export const mockedInsertId = 42;

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
      if (path === "/api/items" && method === "get") {
        return Promise.resolve().then(
          () =>
            new Response(JSON.stringify(mockedItems), {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            }),
        );
      }
      if (path === "/api/items" && method === "post") {
        return Promise.resolve().then(
          () =>
            new Response(JSON.stringify({ insertId: mockedInsertId }), {
              status: 201,
              headers: {
                "Content-Type": "application/json",
              },
            }),
        );
      }
      if (path.match(/\/api\/items\/\d+/) && method === "put") {
        return Promise.resolve().then(
          () => new Response(null, { status: 204 }),
        );
      }
      if (path.match(/\/api\/items\/\d+/) && method === "delete") {
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
            new Response(JSON.stringify(mockedPlays), {
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
            new Response(JSON.stringify({ insertId: mockedInsertId }), {
              status: 201,
            }),
        );
      }
      if (path.match(/\/api\/plays\/\d+\/members/) && method === "get") {
        return Promise.resolve().then(
          () =>
            new Response(JSON.stringify(mockedPlays[0].members), {
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
            new Response(JSON.stringify(mockedPlays[0].roles), {
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
            new Response(JSON.stringify({ insertId: mockedInsertId }), {
              status: 201,
            }),
        );
      }
      if (path.match(/\/api\/plays\/\d+\/scenes/) && method === "get") {
        return Promise.resolve().then(
          () =>
            new Response(JSON.stringify(mockedPlays[0].scenes), {
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
            new Response(JSON.stringify({ insertId: mockedInsertId }), {
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
            new Response(JSON.stringify(mockedPlays[0].preferences), {
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
            new Response(JSON.stringify(mockedPlays[0].matrix), {
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
            new Response(JSON.stringify(mockedPlays[0].events), {
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
      if (path.match(/\/api\/plays\/\d+/) && method === "get") {
        return Promise.resolve().then(
          () =>
            new Response(JSON.stringify(mockedPlays[0]), {
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

export const mockUseItems = (params?: { id: string }) => {
  const itemsStub: ReturnType<typeof itemHooks.useItems> = {
    items: mockedItems,
    item: mockedItems.find((item) => item.id === Number(params?.id)),
    editItem: vi.fn(),
    addItem: vi.fn(),
    deleteItem: vi.fn(),
  };

  const spy = vi
    .spyOn(itemHooks, "useItems")
    .mockImplementation(() => itemsStub);

  const result: [typeof itemsStub, typeof spy] = [itemsStub, spy];

  return result;
};

export const mockWindowLocation = () => {
  const locationStub = {
    ...window.location,
    reload: vi.fn(),
  };

  const spy = vi.spyOn(window, "location", "get").mockReturnValue(locationStub);

  const result: [typeof locationStub, typeof spy] = [locationStub, spy];

  return result;
};

type StubRouteObject = Parameters<typeof createRoutesStub>[0][number];

export const stubRoute = (
  path: StubRouteObject["path"],
  Component: StubRouteObject["Component"],
) =>
  createRoutesStub([
    {
      path,
      Component,
      ErrorBoundary:
        // Catch component errors and report them to the test runner
        ({ error }) => {
          throw error;
        },
    },
  ]);

// Wrapping render in act is required here because useItems is suspending
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
