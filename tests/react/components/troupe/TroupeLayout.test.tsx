import { screen, waitFor } from "@testing-library/react";
import TroupeLayout from "../../../../src/react/components/troupe/TroupeLayout";
import {
  mainTroupe,
  renderWithStub,
  setupMocks,
  teacherUser,
} from "../../test-utils";

describe("<TroupeLayout />", () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should mount successfully", async () => {
    await renderWithStub({
      path: "/troupes/:troupeId",
      Component: TroupeLayout,
      initialEntries: [`/troupes/${mainTroupe.id}`],
      me: teacherUser,
    });

    await waitFor(() => screen.getByText(mainTroupe.name));
  });
});
