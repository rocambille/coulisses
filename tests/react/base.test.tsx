import { act, screen } from "@testing-library/react";
import {
  DataRefreshProvider,
  useRefresh,
} from "../../src/react/components/DataRefreshContext";
import Layout from "../../src/react/components/Layout";
import { cache, invalidateCache } from "../../src/react/helpers/cache";
import { apiMutate, useMutate } from "../../src/react/helpers/mutate";
import {
  expectContractCall,
  mainPlay,
  renderHookAsync,
  renderWithStub,
  requestValue,
  setupMocks,
  teacherUser,
} from "./test-utils";

describe("React: Base Components & Utilities", () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("<Layout>", () => {
    it("should mount successfully", async () => {
      await renderWithStub("/", () => <Layout />, ["/"], { me: null });

      await screen.findByRole("navigation");
    });
    it("should render magic link form when not authenticated", async () => {
      await renderWithStub("/", () => <Layout />, ["/"], { me: null });

      await screen.findByLabelText(/email/i);
    });
    it("should render logout when authenticated", async () => {
      await renderWithStub("/", () => <Layout />, ["/"], { me: teacherUser });

      await screen.findByText(/déconnexion/i);
    });
  });

  describe("cache", () => {
    it("should return cached data", async () => {
      const data = await cache(`/api/users/${teacherUser.id}`);
      expect(data).toEqual(teacherUser);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    it("should not fetch again when data is cached", async () => {
      const data = await cache(`/api/plays/${mainPlay.id}`);
      expect(data).toEqual(mainPlay);

      expect(global.fetch).toHaveBeenCalledTimes(1);

      const data2 = await cache(`/api/plays/${mainPlay.id}`);
      expect(data2).toEqual(mainPlay);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        `/api/plays/${mainPlay.id}`,
      );
    });
    it("should return null when data is not available", async () => {
      const data = await cache("/api/404");
      expect(data).toBeNull();
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("invalidateCache", () => {
    it("should invalidate cache", async () => {
      const data = await cache(`/api/plays/${mainPlay.id}`);
      expect(data).toEqual(mainPlay);

      invalidateCache(`/api/plays/${mainPlay.id}`);

      expect(global.fetch).toHaveBeenCalledTimes(1);

      invalidateCache(`/api/plays/${mainPlay.id}`);

      const data2 = await cache(`/api/plays/${mainPlay.id}`);
      expect(data2).toEqual(mainPlay);

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        `/api/plays/${mainPlay.id}`,
      );
    });
    it("should invalidate all cache when '*' is provided", async () => {
      const data = await cache(`/api/plays/${mainPlay.id}`);
      expect(data).toEqual(mainPlay);
      const data2 = await cache(`/api/users/${teacherUser.id}`);
      expect(data2).toEqual(teacherUser);

      expect(global.fetch).toHaveBeenCalledTimes(2);

      invalidateCache("*");

      const data3 = await cache(`/api/users/${teacherUser.id}`);
      expect(data3).toEqual(teacherUser);

      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(global.fetch).toHaveBeenNthCalledWith(
        3,
        `/api/users/${teacherUser.id}`,
      );
    });
    it("should not invalidate cache for paths that do not match", async () => {
      const data = await cache(`/api/plays/${mainPlay.id}`);
      expect(data).toEqual(mainPlay);
      const data2 = await cache(`/api/users/${teacherUser.id}`);
      expect(data2).toEqual(teacherUser);

      expect(global.fetch).toHaveBeenCalledTimes(2);

      invalidateCache("/api/plays");

      const data3 = await cache(`/api/users/${teacherUser.id}`);
      expect(data3).toEqual(teacherUser);

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("apiMutate", () => {
    it("should send a mutation request with a body", async () => {
      const { id, ...playFields } = mainPlay;

      await apiMutate(`/api/plays/${mainPlay.id}`, "put", {
        ...playFields,
        title: requestValue("plays", "update", "teacher", "title"),
      });

      expectContractCall("plays", "update", "teacher");
    });
    it("should send a mutation request without a body", async () => {
      await apiMutate(`/api/plays/${mainPlay.id}`, "delete");

      expectContractCall("plays", "delete", "teacher");
    });
  });

  describe("useMutate", () => {
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
        mutate(`/api/plays/${mainPlay.id}`, "delete", null, ["/api/plays"]),
      );

      expectContractCall("plays", "delete", "teacher");
    });
  });

  describe("useRefresh", () => {
    it("should throw an error when used outside of RefreshProvider", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      await expect(renderHookAsync(() => useRefresh())).rejects.toThrow(
        "useRefresh must be used within a DataRefreshProvider",
      );
    });
    it("should return a refresh function", async () => {
      const { result } = await renderHookAsync(() => useRefresh(), {
        wrapper: DataRefreshProvider,
      });

      const { refresh, tick: initialTick } = result.current;

      act(() => refresh());

      await renderHookAsync(() => useRefresh(), {
        wrapper: DataRefreshProvider,
      });

      const { tick } = result.current;

      expect(tick).toBe(initialTick + 1);
    });
  });
});
