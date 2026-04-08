import { contracts } from "../contracts";
import { api, using } from "./mocks";

describe("Health checks", () => {
  describe("GET /api", () => {
    it("should return successfully", async () => {
      const response = await using(api.get("/api"));

      expect(response.status).toBe(contracts.health.get.status);
      expect(response.text).toBe(contracts.health.get.body);
    });
  });
  describe("POST /api", () => {
    it("should return successfully", async () => {
      const response = await using(api.post("/api").send({ hello: "world" }));

      expect(response.status).toBe(contracts.health.post.status);
      expect(response.text).toBe(contracts.health.post.body);
    });

    it("should fail when CSRF token is missing", async () => {
      const response = await using(api.post("/api").send({ hello: "world" }), {
        withCsrf: false,
      });

      expect(response.status).toBe(contracts.errors.unauthorized.status);
    });
  });
});
