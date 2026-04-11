import { screen, waitFor } from "@testing-library/react";
import * as AuthContext from "../../src/react/components/auth/AuthContext";
import { useMembership } from "../../src/react/components/play/hooks";
import PlayLayout from "../../src/react/components/play/PlayLayout";
import { renderHookAsync, renderWithStub, setupMocks, teacherUser } from ".";

describe("<PlayLayout />", () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should mount successfully", async () => {
    await renderWithStub("/plays/:playId", () => <PlayLayout />, ["/plays/1"], {
      user: teacherUser,
    });

    await waitFor(() => screen.getByRole("heading", { level: 1 }));
  });
});

describe("useMembership", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should throw when playId is not defined", async () => {
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({
      me: null,
      check: vi.fn(),
      sendMagicLink: vi.fn(),
      verifyMagicLink: vi.fn(),
      logout: vi.fn(),
    });

    // Avoid exception noise in console
    vi.spyOn(console, "error").mockImplementationOnce(() => {});

    await expect(
      renderHookAsync(() => useMembership(undefined)),
    ).rejects.toThrow(/no playId provided/i);
  });
});
