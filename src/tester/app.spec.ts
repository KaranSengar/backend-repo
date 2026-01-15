import { app } from "../app";
import { calculateDiscount } from "../utils/utils";
import request from "supertest";
describe("calculateDiscount", () => {
  it("works", () => {
    expect(calculateDiscount(100, 10)).toBe(90);
  });

  it("should return status 200 code", async () => {
    const response = await request(app).get("/").send();
    expect(response.status).toBe(200);
  });
});
