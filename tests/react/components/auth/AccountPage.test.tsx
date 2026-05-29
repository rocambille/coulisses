import { act, fireEvent, screen } from "@testing-library/react";

import AccountPage from "../../../../src/react/components/auth/AccountPage";
import {
  expectContractCall,
  renderWithStub,
  requestValue,
  setupMocks,
  teacherUser,
} from "../../test-utils";

describe("<AccountPage />", () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("should mount successfully", async () => {
    await renderWithStub({
      path: "/",
      Component: AccountPage,
      initialEntries: ["/"],
      me: teacherUser,
    });

    await screen.findByRole("heading", { level: 1, name: /compte/i });
  });

  it("should submit account details form", async () => {
    const { user } = await renderWithStub({
      path: "/",
      Component: AccountPage,
      initialEntries: ["/"],
      me: teacherUser,
    });

    await user.clear(screen.getByRole("textbox", { name: /email/i }));
    await user.type(
      screen.getByRole("textbox", { name: /email/i }),
      String(requestValue("users", "edit_me", "as_me", "email")),
    );
    await user.clear(screen.getByRole("textbox", { name: /nom/i }));
    await user.type(
      screen.getByRole("textbox", { name: /nom/i }),
      String(requestValue("users", "edit_me", "as_me", "name")),
    );
    await user.click(screen.getByRole("button", { name: /enregistrer/i }));

    expectContractCall("users", "edit_me", "as_me");
  });

  it("should alert when submitted data is invalid", async () => {
    vi.spyOn(globalThis, "alert").mockImplementationOnce(() => {});

    const { user } = await renderWithStub({
      path: "/",
      Component: AccountPage,
      initialEntries: ["/"],
      me: teacherUser,
    });

    await user.clear(screen.getByRole("textbox", { name: /email/i }));
    await user.clear(screen.getByRole("textbox", { name: /nom/i }));
    await act(async () => {
      await fireEvent.submit(screen.getByRole("form"));
    });

    expect(alert).toHaveBeenCalled();
  });

  it("should submit logout form", async () => {
    const { user } = await renderWithStub({
      path: "/",
      Component: AccountPage,
      initialEntries: ["/"],
      me: teacherUser,
    });

    await user.click(screen.getByRole("button", { name: /déconnecter/i }));

    expectContractCall("auth", "logout", "anyone");
  });

  it("should submit delete form", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);

    const { user } = await renderWithStub({
      path: "/",
      Component: AccountPage,
      initialEntries: ["/"],
      me: teacherUser,
    });

    await user.click(screen.getByRole("button", { name: /supprimer/i }));

    expectContractCall("users", "delete_me", "as_me");
  });

  it("should not submit delete form when user cancels", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);

    const { user } = await renderWithStub({
      path: "/",
      Component: AccountPage,
      initialEntries: ["/"],
      me: teacherUser,
    });

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockClear();

    await user.click(screen.getByRole("button", { name: /supprimer/i }));

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
