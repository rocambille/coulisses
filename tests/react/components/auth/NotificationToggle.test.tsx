import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import NotificationToggle from "../../../../src/react/components/auth/NotificationToggle";
import {
  disablePush,
  enablePush,
  isPushEnabled,
  isPushSupported,
  needsHomeScreenInstall,
} from "../../../../src/react/helpers/push";

vi.mock("../../../../src/react/helpers/push", () => ({
  disablePush: vi.fn(),
  enablePush: vi.fn(),
  isPushEnabled: vi.fn(),
  isPushSupported: vi.fn(),
  needsHomeScreenInstall: vi.fn(),
}));

const stubPermission = (permission: NotificationPermission) => {
  vi.stubGlobal("Notification", { permission });
};

describe("<NotificationToggle />", () => {
  beforeEach(() => {
    vi.mocked(needsHomeScreenInstall).mockReturnValue(false);
    vi.mocked(isPushSupported).mockReturnValue(true);
    vi.mocked(isPushEnabled).mockResolvedValue(false);
    vi.mocked(enablePush).mockResolvedValue(true);
    vi.mocked(disablePush).mockResolvedValue();
    stubPermission("default");
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllGlobals();
  });

  it("should stay hidden where push cannot work", () => {
    vi.mocked(isPushSupported).mockReturnValue(false);

    const { container } = render(<NotificationToggle />);

    expect(container.textContent).toBe("");
  });

  it("should explain how to get push on iOS", async () => {
    vi.mocked(needsHomeScreenInstall).mockReturnValue(true);
    vi.mocked(isPushSupported).mockReturnValue(false);

    render(<NotificationToggle />);

    await screen.findByText(/écran d'accueil/i);
    expect(screen.queryByRole("switch")).toBeNull();
  });

  it("should explain that notifications are blocked", async () => {
    stubPermission("denied");

    render(<NotificationToggle />);

    await screen.findByText(/bloquées/i);
    expect(screen.queryByRole("switch")).toBeNull();
  });

  it("should reflect an existing subscription", async () => {
    vi.mocked(isPushEnabled).mockResolvedValue(true);

    render(<NotificationToggle />);

    expect((await screen.findByRole<HTMLInputElement>("switch")).checked).toBe(
      true,
    );
  });

  it("should turn notifications on", async () => {
    const user = userEvent.setup();
    render(<NotificationToggle />);

    await user.click(await screen.findByRole("switch"));

    expect(enablePush).toHaveBeenCalled();
    expect(screen.getByRole<HTMLInputElement>("switch").checked).toBe(true);
  });

  it("should turn notifications off", async () => {
    const user = userEvent.setup();
    vi.mocked(isPushEnabled).mockResolvedValue(true);
    render(<NotificationToggle />);

    await user.click(await screen.findByRole("switch"));

    expect(disablePush).toHaveBeenCalled();
    expect(screen.getByRole<HTMLInputElement>("switch").checked).toBe(false);
  });

  it("should stay off when the prompt is dismissed", async () => {
    const user = userEvent.setup();
    vi.mocked(enablePush).mockResolvedValue(false);
    render(<NotificationToggle />);

    await user.click(await screen.findByRole("switch"));

    expect(screen.getByRole<HTMLInputElement>("switch").checked).toBe(false);
  });

  it("should switch to the blocked message when the prompt is refused", async () => {
    const user = userEvent.setup();
    vi.mocked(enablePush).mockImplementation(async () => {
      stubPermission("denied");
      return false;
    });
    render(<NotificationToggle />);

    await user.click(await screen.findByRole("switch"));

    await screen.findByText(/bloquées/i);
  });

  it("should report a failure and keep the previous state", async () => {
    const user = userEvent.setup();
    vi.mocked(enablePush).mockRejectedValue(new Error("500"));
    render(<NotificationToggle />);

    await user.click(await screen.findByRole("switch"));

    await screen.findByRole("alert");
    expect(screen.getByRole<HTMLInputElement>("switch").checked).toBe(false);
  });
});
