import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MembersPage from "../../src/react/components/play/MembersPage";
import { invalidateCache } from "../../src/react/components/utils";
import {
  mockCsrfToken,
  mockedRandomUUID,
  mockFetch,
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
