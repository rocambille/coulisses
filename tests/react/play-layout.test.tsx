import { screen, waitFor } from "@testing-library/react";
import PlayLayout from "../../src/react/components/play/PlayLayout";
import { renderWithStub, setupApiMocks, teacherUser } from "./mocks";

describe("<PlayLayout />", () => {
  beforeEach(() => {
    setupApiMocks();
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
