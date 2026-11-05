import { fireEvent, screen } from "@testing-library/react";

import MagicLinkForm from "../../../../src/react/components/auth/MagicLinkForm";
import {
  expectContractCall,
  renderWithStub,
  requestValue,
  setupMocks,
} from "../../test-utils";

describe("<MagicLinkForm />", () => {
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
      Component: MagicLinkForm,
      initialEntries: ["/"],
      me: null,
    });
    await screen.findByRole("form");
  });
  it("should submit email and show confirmation", async () => {
    const { user } = await renderWithStub({
      path: "/",
      Component: MagicLinkForm,
      initialEntries: ["/"],
      me: null,
    });

    await user.type(
      screen.getByLabelText(/^email$/i),
      String(requestValue("auth", "magic_link", "success", "email")),
    );
    await user.click(screen.getByRole("button"));

    expectContractCall("auth", "magic_link", "success");
  });
  describe("code", () => {
    const requestEmail = async () => {
      const { user } = await renderWithStub({
        path: "/",
        Component: MagicLinkForm,
        initialEntries: ["/"],
        me: null,
      });

      await user.type(
        screen.getByLabelText(/^email$/i),
        String(requestValue("auth", "verify_code", "success", "email")),
      );
      await user.click(screen.getByRole("button"));

      return user;
    };

    const typeCode = async (user: Awaited<ReturnType<typeof requestEmail>>) => {
      await user.type(
        screen.getByLabelText(/^code de connexion$/i),
        String(requestValue("auth", "verify_code", "success", "code")),
      );
      await user.click(screen.getByRole("button", { name: /se connecter/i }));
    };

    it("should offer to type the code of the email", async () => {
      await requestEmail();

      const input = screen.getByLabelText(/^code de connexion$/i);
      expect(input.getAttribute("autocomplete")).toBe("one-time-code");
      expect(input.getAttribute("inputmode")).toBe("numeric");
    });

    it("should log in with the code", async () => {
      const user = await requestEmail();

      await typeCode(user);

      expectContractCall("auth", "verify_code", "success");
      expect(screen.queryByText(/invalide ou expiré/i)).toBeNull();
    });

    it("should say when the code is refused", async () => {
      setupMocks({ forceCases: { "auth.verify_code": "unauthorized" } });
      const user = await requestEmail();

      await typeCode(user);

      await screen.findByText(/invalide ou expiré/i);
    });

    it("should let the user start over", async () => {
      const user = await requestEmail();

      await user.click(
        screen.getByRole("button", { name: /changer d'adresse/i }),
      );

      screen.getByLabelText(/^email$/i);
    });
  });

  it("should display inline errors when email is invalid", async () => {
    await renderWithStub({
      path: "/",
      Component: MagicLinkForm,
      initialEntries: ["/"],
      me: null,
    });

    await fireEvent.submit(screen.getByRole("form"));

    await screen.findByText(/invalid/i);
  });
});
