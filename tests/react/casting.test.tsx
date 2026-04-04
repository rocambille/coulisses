import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CastingPage from "../../src/react/components/play/CastingPage";
import {
  mockCsrfToken,
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
