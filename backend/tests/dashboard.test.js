import request from "supertest";
import app from "../server.js"; // ⚠️ ton server.js doit exporter "app" pour être testable

describe("GET /api/stats/dashboard", () => {
  it("devrait retourner les stats du dashboard", async () => {
    const res = await request(app).get("/api/stats/dashboard");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("clientCount");
    expect(res.body).toHaveProperty("contractCount");
    expect(res.body).toHaveProperty("revenue");
    expect(Array.isArray(res.body.contractsHistory)).toBe(true);
  });
});
