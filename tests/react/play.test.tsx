import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MembersPage from "../../src/react/components/play/MembersPage";
import PlayLayout from "../../src/react/components/play/PlayLayout";
import RolesPage from "../../src/react/components/play/RolesPage";
import ScenesPage from "../../src/react/components/play/ScenesPage";
import {
  mockCsrfToken,
  mockedRandomUUID,
  mockFetch,
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
    it("should mount successfully", async () => {
      const Stub = stubRoute("/plays/:playId/members", MembersPage);

      await renderAsync(<Stub initialEntries={["/plays/1/members"]} />);

      await waitFor(() => screen.getByRole("heading", { level: 2 }));
    });

    it("should add a new member successfully", async () => {
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
    });
  });

  describe("<RolesPage />", () => {
    it("should mount successfully", async () => {
      const Stub = stubRoute("/plays/:playId/roles", RolesPage);

      await renderAsync(<Stub initialEntries={["/plays/1/roles"]} />);

      await waitFor(() => screen.getByRole("heading", { level: 2 }));
    });

    it("should add a new role successfully", async () => {
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
    });
  });

  describe("<ScenesPage />", () => {
    it("should mount successfully", async () => {
      const Stub = stubRoute("/plays/:playId/scenes", ScenesPage);

      await renderAsync(<Stub initialEntries={["/plays/1/scenes"]} />);

      await waitFor(() => screen.getByRole("heading", { level: 2 }));
    });

    it("should add a new scene successfully", async () => {
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
        body: JSON.stringify({ title: "Test", scene_order: 2 }),
      });
    });
  });
});
