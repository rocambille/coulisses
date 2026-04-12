import { screen } from "@testing-library/react";
import DashboardPage from "../../src/react/components/DashboardPage";
import { invalidateCache } from "../../src/react/components/utils";
import {
  expectContractCall,
  renderWithStub,
  requestValue,
  setupMocks,
  teacherUser,
  thirdUser,
} from "./test-utils";

describe("<DashboardPage />", () => {
  beforeEach(() => {
    setupMocks();
    invalidateCache("/api/plays");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should mount successfully", async () => {
    await renderWithStub("/", DashboardPage, ["/"], { user: teacherUser });

    await screen.findByRole("heading", { level: 1, name: /mes pièces/i });

    expectContractCall("plays", "browse", "teacher");
  });

  it("should display a message when the user has no plays", async () => {
    setupMocks({ forceCases: { "plays.browse": "third" } });

    await renderWithStub("/", DashboardPage, ["/"], { user: thirdUser });

    await screen.findByText(/aucune pièce/i);

    expectContractCall("plays", "browse", "third");
  });

  it("should add a play", async () => {
    const { user } = await renderWithStub("/", DashboardPage, ["/"], {
      user: teacherUser,
    });

    await user.type(
      screen.getByLabelText(/titre/i),
      requestValue("plays", "create", "teacher", "title"),
    );
    await user.click(screen.getByRole("button", { name: /ajouter/i }));

    expectContractCall("plays", "create", "teacher");
  });
});
