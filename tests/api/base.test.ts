import { contracts } from "../contracts";
import { api } from "./mocks";

describe("Base API", () => {
  describe("GET /api", () => {
    it("should return successfully", async () => {
      const response = await api.get("/api");

      expect(response.status).toBe(contracts.health.status.status);
      expect(response.text).toBe(contracts.health.status.body.status);
    });
  });
});
