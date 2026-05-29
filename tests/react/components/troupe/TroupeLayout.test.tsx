import { screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { useOutletContext } from "react-router";
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

  it("should show breadcrumb", async () => {
    await renderWithStub({
      path: "/troupes/:troupeId",
      Component: TroupeLayout,
      children: [
        {
          path: "/troupes/:troupeId",
          Component: () => {
            const { pushBreadcrumb } = useOutletContext<{
              pushBreadcrumb: (items: NavItem[]) => void;
            }>();

            useEffect(() => {
              pushBreadcrumb([{ to: "/foo", label: "bar" }]);
            }, [pushBreadcrumb]);

            return null;
          },
        },
      ],
      initialEntries: [`/troupes/${mainTroupe.id}`],
      me: teacherUser,
    });

    await waitFor(() => screen.getByText("bar"));
  });
});
