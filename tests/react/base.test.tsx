import { act, screen } from "@testing-library/react";
import {
  DataRefreshProvider,
  useRefresh,
} from "../../src/react/components/DataRefreshContext";
import Home from "../../src/react/components/Home";
import Layout from "../../src/react/components/Layout";
import { cache, invalidateCache } from "../../src/react/helpers/cache";
import { apiMutate as mutate, useMutate } from "../../src/react/helpers/mutate";
import {
  allItems,
  expectContractCall,
  fooUser,
  renderHookAsync,
  renderWithStub,
  requestValue,
  setupMocks,
} from "./test-utils";

describe("React: Base Components & Utilities", () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe("<Layout>", () => {
    it("should mount successfully", async () => {
      await renderWithStub("/", () => <Layout />, ["/"], { me: null });

      await screen.findByRole("navigation");
    });
    it("should render magic link form when not authenticated", async () => {
      await renderWithStub("/", () => <Layout>hello, world!</Layout>, ["/"], {
        me: null,
      });

      await screen.findByLabelText(/email/i);
    });
    it("should render its children when authenticated", async () => {
      await renderWithStub("/", () => <Layout>hello, world!</Layout>, ["/"], {
        me: fooUser,
      });

      await screen.findByText("hello, world!");
    });
  });

  describe("<Home />", () => {
    it("should mount successfully", async () => {
      await renderWithStub("/", () => <Home />, ["/"], { me: null });

      await screen.findByRole("heading", { level: 1 });
    });
    it("should count", async () => {
      const { user } = await renderWithStub("/", () => <Home />, ["/"], {
        me: null,
      });

      await user.click(screen.getByRole("button"));
    });
  });

  describe("cache", () => {
    it("should return cached data", async () => {
      const data = await cache(`/api/items/${allItems[0].id}`);
      expect(data).toEqual(allItems[0]);
    });
    it("should not fetch again when data is cached", async () => {
      invalidateCache(`/api/items/${allItems[0].id}`);

      const data = await cache(`/api/items/${allItems[0].id}`);
      expect(data).toEqual(allItems[0]);

      const data2 = await cache(`/api/items/${allItems[0].id}`);
      expect(data2).toEqual(allItems[0]);

      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        `/api/items/${allItems[0].id}`,
      );
    });
    it("should return null when data is not available", async () => {
      const data = await cache("/api/404");
      expect(data).toBeNull();
    });
  });

  describe("invalidateCache", () => {
    it("should invalidate cache", async () => {
      invalidateCache(`/api/items/${allItems[0].id}`);

      const data = await cache(`/api/items/${allItems[0].id}`);
      expect(data).toEqual(allItems[0]);

      invalidateCache(`/api/items/${allItems[0].id}`);

      const data2 = await cache(`/api/items/${allItems[0].id}`);
      expect(data2).toEqual(allItems[0]);

      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        `/api/items/${allItems[0].id}`,
      );
    });
  });

  describe("mutate", () => {
    it("should send a mutation request with a body", async () => {
      const { id, user_id, ...itemFields } = allItems[0];

      await mutate(`/api/items/${allItems[0].id}`, "put", {
        ...itemFields,
        title: requestValue("items", "edit", "success", "title"),
      });

      expectContractCall("items", "edit", "success");
    });
    it("should send a mutation request without a body", async () => {
      await mutate(`/api/items/${allItems[0].id}`, "delete");

      expectContractCall("items", "delete", "success");
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
        mutate(`/api/items/${allItems[0].id}`, "delete", null, ["/api/items"]),
      );

      expectContractCall("items", "delete", "success");
    });
  });
});
