import { fireEvent, screen, waitFor } from "@testing-library/react";

import AccountPage from "../../../../src/react/components/auth/AccountPage";
import { standardUser } from "../../../fixtures/users";
import {
  expectContractCall,
  renderWithStub,
  requestValue,
  setupMocks,
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
      me: standardUser,
    });

    await screen.findByRole("heading", { level: 1, name: /compte/i });
  });

  it("should submit account details form", async () => {
    const { user } = await renderWithStub({
      path: "/",
      Component: AccountPage,
      initialEntries: ["/"],
      me: standardUser,
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
    await user.click(screen.getByRole("button", { name: /enregistrer$/i }));

    expectContractCall("users", "edit_me", "as_me");
  });

  it("should display inline errors when submitted data is invalid", async () => {
    const { user } = await renderWithStub({
      path: "/",
      Component: AccountPage,
      initialEntries: ["/"],
      me: standardUser,
    });

    await user.clear(screen.getByRole("textbox", { name: /email/i }));
    await user.clear(screen.getByRole("textbox", { name: /nom/i }));

    await fireEvent.submit(
      screen.getByRole("form", { name: /account details form/i }),
    );

    await screen.findByText("Nom requis");
  });

  it("should submit logout form", async () => {
    const { user } = await renderWithStub({
      path: "/",
      Component: AccountPage,
      initialEntries: ["/"],
      me: standardUser,
    });

    await user.click(screen.getByRole("button", { name: /^se déconnecter$/i }));

    expectContractCall("auth", "logout", "anyone");
  });

  it("should log out of every device", async () => {
    const { user } = await renderWithStub({
      path: "/",
      Component: AccountPage,
      initialEntries: ["/"],
      me: standardUser,
    });

    await user.click(
      screen.getByRole("button", { name: /tous les appareils/i }),
    );

    expectContractCall("auth", "logout_everywhere", "as_user");
  });

  describe("email change", () => {
    const requestEmailChange = async () => {
      const { user } = await renderWithStub({
        path: "/",
        Component: AccountPage,
        initialEntries: ["/"],
        me: standardUser,
      });

      const email = screen.getByRole("textbox", { name: /^email$/i });
      await user.clear(email);
      await user.type(
        email,
        String(requestValue("users", "edit_me", "email_change", "email")),
      );
      await user.click(screen.getByRole("button", { name: /enregistrer$/i }));

      return user;
    };

    it("should ask for the code sent to the new address", async () => {
      await requestEmailChange();

      expectContractCall("users", "edit_me", "email_change");
      await screen.findByText(
        String(requestValue("users", "edit_me", "email_change", "email")),
      );
    });

    it("should confirm the new address with its code", async () => {
      const user = await requestEmailChange();

      await user.type(
        await screen.findByLabelText(/code de confirmation/i),
        String(requestValue("users", "confirm_me_email", "as_me", "code")),
      );
      await user.click(
        screen.getByRole("button", { name: /confirmer ma nouvelle adresse/i }),
      );

      expectContractCall("users", "confirm_me_email", "as_me");
      await waitFor(() =>
        expect(screen.queryByLabelText(/code de confirmation/i)).toBeNull(),
      );
    });

    it("should explain why a code is refused", async () => {
      setupMocks({ forceCases: { "users.confirm_me_email": "email_taken" } });
      const user = await requestEmailChange();

      await user.type(
        await screen.findByLabelText(/code de confirmation/i),
        "654321",
      );
      await user.click(
        screen.getByRole("button", { name: /confirmer ma nouvelle adresse/i }),
      );

      await screen.findByText(/déjà utilisée par un autre compte/i);
    });
  });

  it("should submit delete form", async () => {
    vi.spyOn(window, "confirm").mockReturnValueOnce(true);

    const { user } = await renderWithStub({
      path: "/",
      Component: AccountPage,
      initialEntries: ["/"],
      me: standardUser,
    });

    await user.click(
      screen.getByRole("button", { name: /supprimer mon compte/i }),
    );

    expectContractCall("users", "delete_me", "as_me");
  });

  it("should not submit delete form when user cancels", async () => {
    vi.spyOn(window, "confirm").mockReturnValueOnce(false);

    const { user } = await renderWithStub({
      path: "/",
      Component: AccountPage,
      initialEntries: ["/"],
      me: standardUser,
    });

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockClear();

    await user.click(
      screen.getByRole("button", { name: /supprimer mon compte/i }),
    );

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("should upload a new avatar", async () => {
    const createObjectURLMock = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:mock-url");
    vi.spyOn(URL, "revokeObjectURL").mockReturnValue();

    const { user } = await renderWithStub({
      path: "/",
      Component: AccountPage,
      initialEntries: ["/"],
      me: standardUser,
    });

    const file = new window.File(
      [new TextEncoder().encode("dummy image")],
      "avatar.webp",
      { type: "image/webp" },
    );
    const fileInput = screen.getByLabelText(/choisir une nouvelle image/i);

    await user.upload(fileInput, file);
    expect(createObjectURLMock).toHaveBeenCalledWith(file);

    const saveButton = screen.getByRole("button", {
      name: /enregistrer l'avatar/i,
    });
    await user.click(saveButton);

    await waitFor(() => {
      expectContractCall("users", "upload_me_avatar", "as_me");
    });
  });

  it("should display inline errors when uploaded file is invalid", async () => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
    vi.spyOn(URL, "revokeObjectURL").mockReturnValue();

    const { user } = await renderWithStub({
      path: "/",
      Component: AccountPage,
      initialEntries: ["/"],
      me: standardUser,
    });

    const file = new window.File(
      [new TextEncoder().encode("some text content")],
      "doc.txt",
      { type: "text/plain" },
    );
    const fileInput = screen.getByLabelText(/choisir une nouvelle image/i);
    fileInput.removeAttribute("accept");

    await user.upload(fileInput, file);

    const saveButton = screen.getByRole("button", {
      name: /enregistrer l'avatar/i,
    });
    await user.click(saveButton);

    await screen.findByText("Invalid file type");
  });

  it("should remove existing avatar", async () => {
    const { user } = await renderWithStub({
      path: "/",
      Component: AccountPage,
      initialEntries: ["/"],
      me: { ...standardUser, avatar_url: "/uploads/avatars/foo.webp" },
    });

    const removeButton = screen.getByRole("button", {
      name: /supprimer l'avatar/i,
    });
    await user.click(removeButton);

    expectContractCall("users", "delete_me_avatar", "as_me");
  });
});
