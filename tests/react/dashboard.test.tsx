import { screen } from "@testing-library/react";
import DashboardPage from "../../src/react/components/DashboardPage";
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should mount successfully", async () => {
    await renderWithStub("/", DashboardPage, ["/"], { me: teacherUser });

    await screen.findByRole("heading", { level: 1, name: /mes pièces/i });

    expectContractCall("plays", "browse", "teacher");
  });

  it("should display a message when the user has no plays", async () => {
    setupMocks({ forceCases: { "plays.browse": "third" } });

    await renderWithStub("/", DashboardPage, ["/"], { me: thirdUser });

    await screen.findByText(/aucune pièce/i);

    expectContractCall("plays", "browse", "third");
  });

  it("should add a play", async () => {
    const { user } = await renderWithStub("/", DashboardPage, ["/"], {
      me: teacherUser,
    });

    await user.type(
      screen.getByLabelText(/titre/i),
      requestValue("plays", "create", "teacher", "title"),
    );
    await user.click(screen.getByRole("button", { name: /ajouter/i }));

    expectContractCall("plays", "create", "teacher");
  });
});
