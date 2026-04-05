import { api } from "./mocks";

describe("Base API", () => {
  describe("GET /api", () => {
    it("should return successfully", async () => {
      const response = await api.get("/api");

      expect(response.status).toBe(200);
      expect(response.text).toBe("hello, world!");
    });
  });
});
