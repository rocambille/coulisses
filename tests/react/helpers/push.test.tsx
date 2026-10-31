import {
  disablePush,
  enablePush,
  isPushEnabled,
  isPushSupported,
  needsHomeScreenInstall,
} from "../../../src/react/helpers/push";
import contracts from "../../contracts";
import { expectContractCall, setupMocks } from "../test-utils";

vi.mock("../../../src/env/client", async (importActual) => {
  const actual = await importActual<typeof import("../../../src/env/client")>();

  return {
    ...actual,
    clientEnv: { ...actual.clientEnv, VITE_VAPID_PUBLIC_KEY: "public-key" },
  };
});

const { body: subscriptionJson } =
  contracts.notifications.subscribe.cases.as_member.request;

const subscription = {
  endpoint: (subscriptionJson as { endpoint: string }).endpoint,
  toJSON: () => subscriptionJson,
  unsubscribe: vi.fn(),
};

const stubBrowser = (permission: NotificationPermission) => {
  const pushManager = {
    getSubscription: vi.fn().mockResolvedValue(null),
    subscribe: vi.fn().mockResolvedValue(subscription),
  };

  const serviceWorker = {
    register: vi.fn().mockResolvedValue({}),
    ready: Promise.resolve({ pushManager }),
    getRegistration: vi.fn().mockResolvedValue({ pushManager }),
  };

  vi.stubGlobal("navigator", {
    userAgent: navigator.userAgent,
    serviceWorker,
  });
  vi.stubGlobal("PushManager", class {});
  vi.stubGlobal("Notification", {
    requestPermission: vi.fn().mockResolvedValue(permission),
  });

  return { pushManager, serviceWorker };
};

describe("push helpers", () => {
  beforeEach(() => {
    setupMocks();
    subscription.unsubscribe.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe("support detection", () => {
    it("should need all the browser APIs", () => {
      expect(isPushSupported()).toBe(false);

      stubBrowser("default");

      expect(isPushSupported()).toBe(true);
    });

    it("should ask for a Home Screen install on iOS only", () => {
      const stubUserAgent = (userAgent: string) =>
        vi.stubGlobal("navigator", { userAgent });

      stubUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)");
      expect(needsHomeScreenInstall()).toBe(true);

      stubUserAgent("Mozilla/5.0 (X11; Linux x86_64)");
      expect(needsHomeScreenInstall()).toBe(false);
    });

    it("should not need an install once push is available on iOS", () => {
      stubBrowser("default");
      vi.stubGlobal("navigator", {
        ...navigator,
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      });

      expect(needsHomeScreenInstall()).toBe(false);
    });
  });

  describe("enablePush", () => {
    it("should not subscribe without the permission", async () => {
      const { pushManager } = stubBrowser("denied");

      expect(await enablePush()).toBe(false);
      expect(pushManager.subscribe).not.toHaveBeenCalled();
    });

    it("should subscribe the browser and register it on the server", async () => {
      const { pushManager, serviceWorker } = stubBrowser("granted");

      expect(await enablePush()).toBe(true);

      expect(serviceWorker.register).toHaveBeenCalledWith("/sw.js");
      expect(pushManager.subscribe).toHaveBeenCalledWith({
        userVisibleOnly: true,
        applicationServerKey: "public-key",
      });
      expectContractCall("notifications", "subscribe", "as_member");
    });

    it("should undo the subscription when the server refuses it", async () => {
      stubBrowser("granted");
      setupMocks({ forceCases: { "notifications.subscribe": "bad_request" } });

      await expect(enablePush()).rejects.toThrow();

      expect(subscription.unsubscribe).toHaveBeenCalled();
    });
  });

  describe("disablePush", () => {
    it("should do nothing in a browser without service workers", async () => {
      await expect(disablePush()).resolves.toBeUndefined();
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("should do nothing without a subscription", async () => {
      stubBrowser("granted");

      expect(await isPushEnabled()).toBe(false);
      await disablePush();

      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("should unsubscribe from the server and the browser", async () => {
      const { pushManager } = stubBrowser("granted");
      pushManager.getSubscription.mockResolvedValue(subscription);

      expect(await isPushEnabled()).toBe(true);
      await disablePush();

      expectContractCall("notifications", "unsubscribe", "as_member");
      expect(subscription.unsubscribe).toHaveBeenCalled();
    });
  });
});
