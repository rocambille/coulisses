// @vitest-environment jsdom

import { cache, invalidateCache } from "../../../src/react/helpers/cache";
import { responseValue, setupMocks } from "../test-utils";

describe("React Helpers: cache", () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe("cache()", () => {
    it("should return cached data", async () => {
      const data = await cache("/api/users/me");
      expect(data).toEqual(responseValue("users", "read_me", "as_me"));
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenNthCalledWith(1, "/api/users/me");
    });

    it("should not fetch again when data is cached", async () => {
      invalidateCache("/api/users/me");

      const data = await cache("/api/users/me");
      expect(data).toEqual(responseValue("users", "read_me", "as_me"));

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenNthCalledWith(1, "/api/users/me");

      const data2 = await cache("/api/users/me");
      expect(data2).toEqual(responseValue("users", "read_me", "as_me"));

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("should return null when data is not available", async () => {
      const data = await cache("/api/404");
      expect(data).toBeNull();
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("invalidateCache()", () => {
    it("should invalidate cache", async () => {
      invalidateCache("/api/users/me");

      const data = await cache("/api/users/me");
      expect(data).toEqual(responseValue("users", "read_me", "as_me"));

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenNthCalledWith(1, "/api/users/me");

      invalidateCache("/api/users/me");

      const data2 = await cache("/api/users/me");
      expect(data2).toEqual(responseValue("users", "read_me", "as_me"));

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenNthCalledWith(2, "/api/users/me");
    });

    it("should invalidate all cache when '*' is provided", async () => {
      const data = await cache("/api/users/me");
      expect(data).toEqual(responseValue("users", "read_me", "as_me"));
      const data2 = await cache("/api/users/me");
      expect(data2).toEqual(responseValue("users", "read_me", "as_me"));

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenNthCalledWith(1, "/api/users/me");

      invalidateCache("*");

      const data3 = await cache("/api/users/me");
      expect(data3).toEqual(responseValue("users", "read_me", "as_me"));

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenNthCalledWith(2, "/api/users/me");
    });

    it("should not invalidate cache for paths that do not match", async () => {
      const data = await cache("/api/users/me");
      expect(data).toEqual(responseValue("users", "read_me", "as_me"));

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenNthCalledWith(1, "/api/users/me");

      invalidateCache("/api/foo");

      const data2 = await cache("/api/users/me");
      expect(data2).toEqual(responseValue("users", "read_me", "as_me"));

      expect(global.fetch).not.toHaveBeenCalledTimes(2);
    });
  });
});
