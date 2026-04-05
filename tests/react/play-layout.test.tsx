import { screen, waitFor } from "@testing-library/react";
import PlayLayout from "../../src/react/components/play/PlayLayout";
import { renderWithStub, setupMocks, teacherUser } from "./mocks";

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
