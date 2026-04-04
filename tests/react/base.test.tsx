import { screen, waitFor } from "@testing-library/react";
import Layout from "../../src/react/components/Layout";
import { cache, mutate } from "../../src/react/components/utils";
import {
  mockCsrfToken,
  mockedPlays,
  mockedRandomUUID,
  mockedUsers,
  mockFetch,
  mockUseAuth,
  renderAsync,
  stubRoute,
} from "./utils";

beforeEach(() => {
  mockCsrfToken();
  mockFetch();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("<Layout />", () => {
  it("should mount successfully", async () => {
    mockUseAuth(mockedUsers[0]);

    const Stub = stubRoute("/", () => <Layout />);

    await renderAsync(<Stub initialEntries={["/"]} />);

    await waitFor(() => screen.getByRole("navigation"));
  });
  it("should render its children when authenticated", async () => {
    mockUseAuth(mockedUsers[0]);

    const Stub = stubRoute("/", () => <Layout>hello, world!</Layout>);

    await renderAsync(<Stub initialEntries={["/"]} />);

    await waitFor(() => screen.getByText("hello, world!"));
  });
  it("should render magic link form when not authenticated", async () => {
    mockUseAuth(null);

    const Stub = stubRoute("/", () => <Layout>hello, world!</Layout>);

    await renderAsync(<Stub initialEntries={["/"]} />);

    await waitFor(() => screen.getByLabelText(/email/i));
  });
});

describe("cache", () => {
  it("should return cached data", async () => {
    const data = await cache("/api/plays/1");
    expect(data).toEqual(mockedPlays[0]);
  });

  it("should return null when data is not available", async () => {
    const data = await cache("/api/404");
    expect(data).toBeNull();
  });
});

describe("mutate", () => {
  it("should send a mutation request with a body", async () => {
    const data = await mutate("/api/plays/1", "put", {});

    expect(globalThis.cookieStore.set).toHaveBeenCalledWith({
      expires: expect.any(Number),
      name: "__Host-x-csrf-token",
      path: "/",
      sameSite: "strict",
      value: mockedRandomUUID,
    });
    expect(global.fetch).toHaveBeenCalledWith("/api/plays/1", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": mockedRandomUUID,
      },
      body: JSON.stringify({}),
    });
    expect(data).toEqual(new Response(null, { status: 204 }));
  });

  it("should send a mutation request without a body", async () => {
    const data = await mutate("/api/plays/1", "delete");

    expect(globalThis.cookieStore.set).toHaveBeenCalledWith({
      expires: expect.any(Number),
      name: "__Host-x-csrf-token",
      path: "/",
      sameSite: "strict",
      value: mockedRandomUUID,
    });
    expect(global.fetch).toHaveBeenCalledWith("/api/plays/1", {
      method: "delete",
      headers: {
        "X-CSRF-Token": mockedRandomUUID,
      },
    });
    expect(data).toEqual(new Response(null, { status: 204 }));
  });
});
