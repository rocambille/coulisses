import * as cache from "../../../src/react/helpers/cache";
import { mutate } from "../../../src/react/helpers/mutate";
import { expectContractCall, requestValue, setupMocks } from "../test-utils";

describe("React Helpers: mutate", () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe("mutate()", () => {
    it("should send a mutation request with a body", async () => {
      await mutate(`/api/health`, "post", {
        hello: requestValue("health", "post", "success", "hello"),
      });

      expectContractCall("health", "post", "success");
    });

    it("should send a mutation request with a FormData body", async () => {
      const formData = new FormData();
      formData.append("avatar", "test");

      await mutate(`/api/users/me/avatar`, "post", formData);

      expectContractCall("users", "upload_me_avatar", "as_me");
    });

    it("should send a mutation request without a body", async () => {
      await mutate("/api/health", "delete");

      expectContractCall("health", "delete", "success");
    });

    it("should reuse CSRF token", async () => {
      const randomSpy = vi.spyOn(crypto, "getRandomValues");

      // first call sets expiration time + 30 seconds
      await mutate("/api/health", "delete");
      const callsAfterFirst = randomSpy.mock.calls.length;

      // second call should reuse CSRF token
      await mutate("/api/health", "delete");

      expect(randomSpy).toHaveBeenCalledTimes(callsAfterFirst);
    });

    it("should refresh matching cache entries when paths are provided", async () => {
      const refreshMock = vi.spyOn(cache, "refresh");

      await mutate("/api/health", "delete", null, ["/api/health"]);

      expectContractCall("health", "delete", "success");
      expect(refreshMock).toHaveBeenCalledWith(["/api/health"]);
    });

    it("should not refresh cache entries when paths are omitted", async () => {
      const refreshMock = vi.spyOn(cache, "refresh");

      await mutate("/api/health", "delete");

      expectContractCall("health", "delete", "success");
      expect(refreshMock).not.toHaveBeenCalled();
    });

    it("should throw an error and not refresh cache entries when the request fails", async () => {
      const refreshMock = vi.spyOn(cache, "refresh");

      await expect(() =>
        mutate("/api/500", "post", null, ["/api/health"]),
      ).rejects.toThrow(/500/i);

      expect(refreshMock).not.toHaveBeenCalled();
    });
  });
});
