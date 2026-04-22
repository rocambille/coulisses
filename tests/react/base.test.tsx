import { act, screen } from "@testing-library/react";
import Layout from "../../src/react/components/Layout";
import {
  RefreshProvider,
  useMutate,
  useRefresh,
} from "../../src/react/components/RefreshContext";
import {
  cache,
  invalidateCache,
  mutate,
} from "../../src/react/components/utils";
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

  it("should render magic link form when not authenticated", async () => {
    await renderWithStub("/", () => <Layout>hello, world!</Layout>, ["/"], {
      me: null,
    });

    await screen.findByLabelText(/email/i);
  });

  it("should mount successfully", async () => {
    await renderWithStub("/", () => <Layout />, ["/"], { me: teacherUser });

    await screen.findByRole("navigation");
  });

  it("should render its children when authenticated", async () => {
    await renderWithStub("/", () => <Layout>hello, world!</Layout>, ["/"], {
      me: teacherUser,
    });

    await screen.findByText("hello, world!");
  });

  describe("cache", () => {
    it("should return cached data", async () => {
      const data = await cache(`/api/plays/${mainPlay.id}`);
      expect(data).toEqual(mainPlay);
    });
    it("should not fetch again when data is cached", async () => {
      invalidateCache(`/api/plays/${mainPlay.id}`);

      const data = await cache(`/api/plays/${mainPlay.id}`);
      expect(data).toEqual(mainPlay);

      const data2 = await cache(`/api/plays/${mainPlay.id}`);
      expect(data2).toEqual(mainPlay);

      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        `/api/plays/${mainPlay.id}`,
      );
    });
    it("should return null when data is not available", async () => {
      const data = await cache("/api/404");
      expect(data).toBeNull();
    });
  });

  describe("invalidateCache", () => {
    it("should invalidate cache", async () => {
      invalidateCache(`/api/plays/${mainPlay.id}`);

      const data = await cache(`/api/plays/${mainPlay.id}`);
      expect(data).toEqual(mainPlay);

      invalidateCache(`/api/plays/${mainPlay.id}`);

      const data2 = await cache(`/api/plays/${mainPlay.id}`);
      expect(data2).toEqual(mainPlay);

      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        `/api/plays/${mainPlay.id}`,
      );
    });
  });

  describe("mutate", () => {
    it("should send a mutation request with a body", async () => {
      await mutate(`/api/plays/${mainPlay.id}`, "put", {
        ...mainPlay,
        title: requestValue("plays", "update", "teacher", "title"),
      });

      expectContractCall("plays", "update", "teacher");
    });
    it("should send a mutation request without a body", async () => {
      await mutate(`/api/plays/${mainPlay.id}`, "delete");

      expectContractCall("plays", "delete", "teacher");
    });
  });

  describe("useRefresh", () => {
    it("should throw an error when used outside of RefreshProvider", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      await expect(renderHookAsync(() => useRefresh())).rejects.toThrow(
        "useRefresh must be used within a RefreshProvider",
      );
    });
    it("should return a refresh function", async () => {
      const { result } = await renderHookAsync(() => useRefresh(), {
        wrapper: RefreshProvider,
      });

      const { refresh, tick: initialTick } = result.current;

      act(() => refresh());

      await renderHookAsync(() => useRefresh(), {
        wrapper: RefreshProvider,
      });

      const { tick } = result.current;

      expect(tick).toBe(initialTick + 1);
    });
  });

  describe("useMutate", () => {
    it("should throw an error when used outside of RefreshProvider", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      await expect(renderHookAsync(() => useMutate())).rejects.toThrow(
        "useRefresh must be used within a RefreshProvider",
      );
    });
    it("should return a mutate function", async () => {
      const { result } = await renderHookAsync(() => useMutate(), {
        wrapper: RefreshProvider,
      });

      const mutate = result.current;

      await act(() =>
        mutate(`/api/plays/${mainPlay.id}`, "delete", null, ["/api/plays"]),
      );

      expectContractCall("plays", "delete", "teacher");
    });
  });
});
