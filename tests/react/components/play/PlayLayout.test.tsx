import { screen, waitFor } from "@testing-library/react";
import PlayLayout from "../../../../src/react/components/play/PlayLayout";
import { mainPlay } from "../../../fixtures/plays";
import {
  mainPlayPreferences,
  mainRolePreferences,
  mainScenePreferences,
} from "../../../fixtures/preferences";
import { mainTroupeMembers } from "../../../fixtures/troupeMembers";
import { mainTroupe } from "../../../fixtures/troupes";
import { teacherUser } from "../../../fixtures/users";
import {
  renderWithStub,
  setupMocks,
  setupTroupeLayoutMocks,
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
