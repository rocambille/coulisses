import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CastingPage from "../../src/react/components/play/CastingPage";
import MembersPage from "../../src/react/components/play/MembersPage";
import PlayLayout from "../../src/react/components/play/PlayLayout";
import RolesPage from "../../src/react/components/play/RolesPage";
import ScenesPage from "../../src/react/components/play/ScenesPage";
import { invalidateCache } from "../../src/react/components/utils";
import {
  mockCsrfToken,
  mockedPlays,
  mockedRandomUUID,
  mockedUsers,
  mockFetch,
  mockUseAuth,
  mockWindowLocation,
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

describe("React play components", () => {
  describe("<PlayLayout />", () => {
    it("should mount successfully", async () => {
      const Stub = stubRoute("/plays/:playId", PlayLayout);

      await renderAsync(<Stub initialEntries={["/plays/1"]} />);

      await waitFor(() => screen.getByRole("heading", { level: 1 }));
    });
  });

  describe("<MembersPage />", () => {
    beforeEach(() => {
      invalidateCache("/api/plays/1/members");
    });
    it("should mount successfully", async () => {
      const Stub = stubRoute("/plays/:playId/members", MembersPage);

      await renderAsync(<Stub initialEntries={["/plays/1/members"]} />);

      await waitFor(() => screen.getByRole("heading", { level: 2 }));
    });

    it("should display a message when the play has no members", async () => {
      mockFetch((path, method) => {
        if (path === "/api/plays/1/members" && method === "get") {
          return Promise.resolve().then(
            () =>
              new Response(JSON.stringify([]), {
                status: 200,
                headers: { "Content-Type": "application/json" },
              }),
          );
        }
      });

      const Stub = stubRoute("/plays/:playId/members", MembersPage);

      await renderAsync(<Stub initialEntries={["/plays/1/members"]} />);

      await waitFor(() => screen.getByText(/aucun membre/i));
    });

    it("should add a new member successfully", async () => {
      const [location] = mockWindowLocation();

      const Stub = stubRoute("/plays/:playId/members", MembersPage);

      await renderAsync(<Stub initialEntries={["/plays/1/members"]} />);

      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/email/i), "test@mail.com");
      await user.click(screen.getByRole("button", { name: /inviter/i }));

      expect(globalThis.cookieStore.set).toHaveBeenCalledWith({
        expires: expect.any(Number),
        name: "__Host-x-csrf-token",
        path: "/",
        sameSite: "strict",
        value: mockedRandomUUID,
      });
      expect(globalThis.fetch).toHaveBeenCalledWith("/api/plays/1/members", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": mockedRandomUUID,
        },
        body: JSON.stringify({ email: "test@mail.com", role: "ACTOR" }),
      });
      expect(location.reload).toHaveBeenCalled();
    });
  });

  describe("<RolesPage />", () => {
    beforeEach(() => {
      invalidateCache("/api/plays/1/roles");
    });

    it("should mount successfully", async () => {
      const Stub = stubRoute("/plays/:playId/roles", RolesPage);

      await renderAsync(<Stub initialEntries={["/plays/1/roles"]} />);

      await waitFor(() => screen.getByRole("heading", { level: 2 }));
    });

    it("should display a message when the play has no roles", async () => {
      mockFetch((path, method) => {
        if (path === "/api/plays/1/roles" && method === "get") {
          return Promise.resolve().then(
            () =>
              new Response(JSON.stringify([]), {
                status: 200,
                headers: { "Content-Type": "application/json" },
              }),
          );
        }
      });

      const Stub = stubRoute("/plays/:playId/roles", RolesPage);

      await renderAsync(<Stub initialEntries={["/plays/1/roles"]} />);

      await waitFor(() => screen.getByText(/aucun rôle/i));
    });

    it("should add a new role successfully", async () => {
      const [location] = mockWindowLocation();

      const Stub = stubRoute("/plays/:playId/roles", RolesPage);

      await renderAsync(<Stub initialEntries={["/plays/1/roles"]} />);

      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/nom/i), "Test");
      await user.click(screen.getByRole("button", { name: /ajouter/i }));

      expect(globalThis.cookieStore.set).toHaveBeenCalledWith({
        expires: expect.any(Number),
        name: "__Host-x-csrf-token",
        path: "/",
        sameSite: "strict",
        value: mockedRandomUUID,
      });
      expect(globalThis.fetch).toHaveBeenCalledWith("/api/plays/1/roles", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": mockedRandomUUID,
        },
        body: JSON.stringify({ name: "Test", description: null, sceneIds: [] }),
      });
      expect(location.reload).toHaveBeenCalled();
    });
  });

  describe("<ScenesPage />", () => {
    it("should mount successfully", async () => {
      mockUseAuth(mockedUsers[0]);

      const Stub = stubRoute("/plays/:playId/scenes", ScenesPage);

      await renderAsync(<Stub initialEntries={["/plays/1/scenes"]} />);

      await waitFor(() => screen.getByRole("heading", { level: 2 }));
    });

    it("should add a new scene successfully (teacher)", async () => {
      const [location] = mockWindowLocation();

      mockUseAuth(mockedUsers[0]);

      const Stub = stubRoute("/plays/:playId/scenes", ScenesPage);

      await renderAsync(<Stub initialEntries={["/plays/1/scenes"]} />);

      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/titre/i), "Test");
      await user.click(screen.getByRole("button", { name: /ajouter/i }));

      expect(globalThis.cookieStore.set).toHaveBeenCalledWith({
        expires: expect.any(Number),
        name: "__Host-x-csrf-token",
        path: "/",
        sameSite: "strict",
        value: mockedRandomUUID,
      });
      expect(globalThis.fetch).toHaveBeenCalledWith("/api/plays/1/scenes", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": mockedRandomUUID,
        },
        body: JSON.stringify({
          title: "Test",
          scene_order: mockedPlays[0].scenes.length + 1,
        }),
      });
      expect(location.reload).toHaveBeenCalled();
    });

    it("should add a new preference successfully (actor)", async () => {
      mockUseAuth(mockedUsers[1]);
      const [location] = mockWindowLocation();

      const Stub = stubRoute("/plays/:playId/scenes", ScenesPage);

      await renderAsync(<Stub initialEntries={["/plays/1/scenes"]} />);

      const user = userEvent.setup();

      await user.selectOptions(
        screen.getByLabelText(/envie.*scène 1/i),
        "HIGH",
      );

      expect(globalThis.cookieStore.set).toHaveBeenCalledWith({
        expires: expect.any(Number),
        name: "__Host-x-csrf-token",
        path: "/",
        sameSite: "strict",
        value: mockedRandomUUID,
      });
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/scenes/1/preferences",
        {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": mockedRandomUUID,
          },
          body: JSON.stringify({ level: "HIGH" }),
        },
      );
      expect(location.reload).toHaveBeenCalled();
    });
  });

  describe("<CastingPage />", () => {
    it("should mount successfully", async () => {
      mockUseAuth(mockedUsers[0]);

      const Stub = stubRoute("/plays/:playId/casting", CastingPage);

      await renderAsync(<Stub initialEntries={["/plays/1/casting"]} />);

      await waitFor(() => screen.getByRole("heading", { level: 2 }));
    });

    it("should assign a role successfully (teacher)", async () => {
      const [location] = mockWindowLocation();

      mockUseAuth(mockedUsers[0]);

      const Stub = stubRoute("/plays/:playId/casting", CastingPage);

      await renderAsync(<Stub initialEntries={["/plays/1/casting"]} />);

      const user = userEvent.setup();

      await user.selectOptions(screen.getByLabelText(/assigner/i), "2");

      expect(globalThis.cookieStore.set).toHaveBeenCalledWith({
        expires: expect.any(Number),
        name: "__Host-x-csrf-token",
        path: "/",
        sameSite: "strict",
        value: mockedRandomUUID,
      });
      expect(globalThis.fetch).toHaveBeenCalledWith("/api/plays/1/castings", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": mockedRandomUUID,
        },
        body: JSON.stringify({ roleId: 1, userId: 2 }),
      });
      expect(location.reload).toHaveBeenCalled();
    });

    it("should unassign a role successfully (teacher)", async () => {
      const [location] = mockWindowLocation();

      mockUseAuth(mockedUsers[0]);

      const Stub = stubRoute("/plays/:playId/casting", CastingPage);

      await renderAsync(<Stub initialEntries={["/plays/1/casting"]} />);

      const user = userEvent.setup();

      await user.selectOptions(screen.getByLabelText(/assigner/i), "");

      expect(globalThis.cookieStore.set).toHaveBeenCalledWith({
        expires: expect.any(Number),
        name: "__Host-x-csrf-token",
        path: "/",
        sameSite: "strict",
        value: mockedRandomUUID,
      });
      expect(globalThis.fetch).toHaveBeenCalledWith("/api/plays/1/castings", {
        method: "delete",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": mockedRandomUUID,
        },
        body: JSON.stringify({ roleId: 1, userId: 2 }),
      });
      expect(location.reload).toHaveBeenCalled();
    });
  });
});
