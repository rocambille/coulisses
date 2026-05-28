import { act, fireEvent, screen } from "@testing-library/react";
import Home from "../../../src/react/components/Home";
import {
  expectContractCall,
  renderWithStub,
  requestValue,
  setupMocks,
  teacherUser,
  thirdUser,
} from "../test-utils";

describe("<DashboardPage />", () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should mount successfully", async () => {
    await renderWithStub({
      path: "/",
      Component: Home,
      initialEntries: ["/"],
      me: teacherUser,
    });

    await screen.findByRole("heading", { level: 1, name: /mes troupes/i });

    expectContractCall("troupes", "browse", "member");
  });

  it("should display a message when the user has no troupes", async () => {
    setupMocks({ forceCases: { "troupes.browse": "empty" } });

    await renderWithStub({
      path: "/",
      Component: Home,
      initialEntries: ["/"],
      me: thirdUser,
    });

    await screen.findByText(/aucune troupe/i);

    expectContractCall("troupes", "browse", "empty");
  });

  it("should add a troupe", async () => {
    const { user } = await renderWithStub({
      path: "/",
      Component: Home,
      initialEntries: ["/"],
      me: teacherUser,
    });

    await user.type(
      screen.getByLabelText(/nom/i),
      String(requestValue("troupes", "create", "success", "name")),
    );
    await user.click(screen.getByRole("button", { name: /créer/i }));

    expectContractCall("troupes", "create", "success");
  });

  it("should alert when submitted data is not matching the contract", async () => {
    vi.spyOn(globalThis, "alert").mockImplementationOnce(() => {});

    await renderWithStub({
      path: "/",
      Component: Home,
      initialEntries: ["/"],
      me: teacherUser,
    });

    await act(async () => {
      await fireEvent.submit(screen.getByRole("form"));
    });

    expect(alert).toHaveBeenCalled();
  });
});
