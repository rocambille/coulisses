import { screen } from "@testing-library/react";
import Layout from "../../src/react/components/Layout";
import { useRefresh } from "../../src/react/components/RefreshContext";
import { cache, mutate } from "../../src/react/components/utils";
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
      user: null,
    });

    await screen.findByLabelText(/email/i);
  });

  it("should mount successfully", async () => {
    await renderWithStub("/", () => <Layout />, ["/"], { user: teacherUser });

    await screen.findByRole("navigation");
  });

  it("should render its children when authenticated", async () => {
    await renderWithStub("/", () => <Layout>hello, world!</Layout>, ["/"], {
      user: teacherUser,
    });

    await screen.findByText("hello, world!");
  });

  describe("cache", () => {
    it("should return cached data", async () => {
      const data = await cache(`/api/plays/${mainPlay.id}`);
      expect(data).toEqual(mainPlay);
    });

    it("should return null when data is not available", async () => {
      const data = await cache("/api/404");
      expect(data).toBeNull();
    });
  });

  describe("mutate", () => {
    it("should send a mutation request with a body", async () => {
      await mutate("/api/plays/1", "put", {
        ...mainPlay,
        title: requestValue("plays", "update", "teacher", "title"),
      });

      expectContractCall("plays", "update", "teacher");
    });

    it("should send a mutation request without a body", async () => {
      await mutate("/api/plays/1", "delete");

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
  });
});
