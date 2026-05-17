import { act } from "@testing-library/react";

import { DataRefreshProvider } from "../../../src/react/components/DataRefreshContext";
import { apiMutate, useMutate } from "../../../src/react/helpers/mutate";
import {
  expectContractCall,
  renderHookAsync,
  requestValue,
  setupMocks,
  teacherUser,
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
      await apiMutate(`/api/users/${teacherUser.id}`, "put", {
        name: requestValue("users", "update", "teacher", "name"),
        email: requestValue("users", "update", "teacher", "email"),
      });

      expectContractCall("users", "update", "teacher");
    });

    it("should send a mutation request without a body", async () => {
      await apiMutate(`/api/users/${teacherUser.id}`, "delete");

      expectContractCall("users", "delete", "teacher");
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

      await act(() =>
        mutate(`/api/users/${teacherUser.id}`, "delete", null, ["/api/users"]),
      );

      expectContractCall("users", "delete", "teacher");
    });
  });
});
