import { screen, waitFor } from "@testing-library/react";
import PlayLayout from "../../../../src/react/components/play/PlayLayout";
import {
  mainPlay,
  mainPlayPreferences,
  mainRolePreferences,
  mainScenePreferences,
  mainTroupe,
  mainTroupeMembers,
  renderWithStub,
  setupMocks,
  setupTroupeLayoutMocks,
  teacherUser,
} from "../../test-utils";

describe("<PlayLayout />", () => {
  beforeEach(() => {
    setupMocks();
    setupTroupeLayoutMocks({
      troupe: mainTroupe,
      members: mainTroupeMembers,
      isAdmin: true,
      playPreferences: mainPlayPreferences,
      rolePreferences: mainRolePreferences,
      scenePreferences: mainScenePreferences,
      pushBreadcrumb: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should mount successfully", async () => {
    await renderWithStub({
      path: "/plays/:playId",
      Component: PlayLayout,
      initialEntries: [`/plays/${mainPlay.id}`],
      me: teacherUser,
    });

    await waitFor(() => screen.getByText(mainPlay.title));
  });
});
