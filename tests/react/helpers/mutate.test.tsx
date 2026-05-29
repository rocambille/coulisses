import { act } from "@testing-library/react";

import { DataRefreshProvider } from "../../../src/react/components/DataRefreshContext";
import * as cache from "../../../src/react/helpers/cache";
import { apiMutate, useMutate } from "../../../src/react/helpers/mutate";
import {
  expectContractCall,
  renderHookAsync,
  requestValue,
  setupMocks,
} from "../test-utils";

describe("React Helpers: mutate", () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe("apiMutate()", () => {
    it("should send a mutation request with a body", async () => {
      await apiMutate("/api/users/me", "put", {
        email: requestValue("users", "edit_me", "as_me", "email"),
        name: requestValue("users", "edit_me", "as_me", "name"),
      });

      expectContractCall("users", "edit_me", "as_me");
    });

    it("should send a mutation request without a body", async () => {
      await apiMutate("/api/users/me", "delete");

      expectContractCall("users", "delete_me", "as_me");
    });
  });

  describe("useMutate()", () => {
    it("should throw an error when used outside of RefreshProvider", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      await expect(renderHookAsync(() => useMutate())).rejects.toThrow(
        "useRefresh must be used within a DataRefreshProvider",
      );
    });

    it("should return a mutate function", async () => {
      const { result } = await renderHookAsync(() => useMutate(), {
        wrapper: DataRefreshProvider,
      });

      const mutate = result.current;

      expectTypeOf(mutate).toBeFunction();
    });

    it("should return a mutate function that sends a mutation request and invalidates the cache", async () => {
      const invalidateCacheMock = vi.spyOn(cache, "invalidateCache");
      const { result } = await renderHookAsync(() => useMutate(), {
        wrapper: DataRefreshProvider,
      });

      const mutate = result.current;

      await act(() => mutate("/api/users/me", "delete", null, ["/api/users"]));

      expectContractCall("users", "delete_me", "as_me");
      expect(invalidateCacheMock).toHaveBeenCalledWith("/api/users");
    });

    it("should return a mutate function that does not invalidate the cache when the request fails", async () => {
      setupMocks({
        force500: [{ path: "/api/users/me", method: "delete" }],
      });

      const invalidateCacheMock = vi.spyOn(cache, "invalidateCache");
      const { result } = await renderHookAsync(() => useMutate(), {
        wrapper: DataRefreshProvider,
      });

      const mutate = result.current;

      await act(() => mutate("/api/users/me", "delete", null, ["/api/users"]));

      expectContractCall("users", "delete_me", "as_me");
      expect(invalidateCacheMock).not.toHaveBeenCalled();
    });
  });
});
