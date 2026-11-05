import { screen, waitFor } from "@testing-library/react";
import { getTroupeInviteToken } from "../../../src/express/modules/troupe/troupeInviteHelper";
import Layout from "../../../src/react/components/Layout";
import JoinPage from "../../../src/react/components/troupe/JoinPage";
import { mainTroupe } from "../../fixtures/troupes";
import { standardUser } from "../../fixtures/users";
import { renderWithStub, setupMocks } from "../test-utils";

describe("<Layout />", () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("should mount successfully", async () => {
    await renderWithStub({
      path: "/",
      Component: () => <Layout />,
      initialEntries: ["/"],
      me: null,
    });

    await screen.findByRole("navigation");
  });

  it("should render magic link form when not authenticated", async () => {
    await renderWithStub({
      path: "/",
      Component: () => <Layout />,
      initialEntries: ["/"],
      me: null,
    });

    await screen.findByLabelText(/email/i);
  });

  it("should render account link when authenticated", async () => {
    await renderWithStub({
      path: "/",
      Component: () => <Layout />,
      initialEntries: ["/"],
      me: standardUser,
    });

    await screen.findByText(/compte/i);
  });

  describe("when not authenticated", () => {
    const loginEmailBody = () => {
      const call = vi
        .mocked(globalThis.fetch)
        .mock.calls.find(([url]) => url === "/api/auth/magic-link");

      return JSON.parse(String(call?.[1]?.body));
    };

    const requestLoginEmail = async (path: string) => {
      setupMocks({ forceCases: { "auth.magic_link": "with_next" } });

      const { user } = await renderWithStub({
        path: "/",
        Component: () => <Layout />,
        children: [
          { path: "troupes/:troupeId/join", Component: JoinPage },
          { path: "troupes/:troupeId/calendar", Component: () => null },
        ],
        initialEntries: [path],
        me: null,
      });

      await user.type(await screen.findByLabelText(/^email$/i), "a@mail.com");
      await user.click(screen.getByRole("button", { name: /recevoir/i }));
    };

    it("should show the invitation, with a login that comes back to it", async () => {
      const invitation = `/troupes/${mainTroupe.id}/join?token=${getTroupeInviteToken(mainTroupe.id)}`;

      await requestLoginEmail(invitation);

      screen.getByRole("heading", { name: new RegExp(mainTroupe.name) });
      await waitFor(() =>
        expect(loginEmailBody()).toEqual({
          email: "a@mail.com",
          next: invitation,
        }),
      );
    });

    it("should bring any other page back after login", async () => {
      await requestLoginEmail("/troupes/1/calendar");

      await waitFor(() =>
        expect(loginEmailBody().next).toBe("/troupes/1/calendar"),
      );
    });

    it("should not send a next page from home", async () => {
      await requestLoginEmail("/");

      await waitFor(() =>
        expect(loginEmailBody()).toEqual({ email: "a@mail.com" }),
      );
    });
  });
});
