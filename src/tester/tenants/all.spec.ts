import request from "supertest";
import { app } from "../../app";
import { AppDataSource } from "../../data-source";
import { DataSource } from "typeorm";
import { Tenant } from "../../entity/Tenantcreate";

describe("GET /tenants", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  // ✅ NO DATA
  it("should return empty list with count 0", async () => {
    const response = await request(app).get("/tenants");

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqual([]);
    expect(response.body.total).toBe(0);
  });

  // ✅ PAGINATED LIST
  it("should return paginated tenants", async () => {
    const tenantRepo = connection.getRepository(Tenant);

    await tenantRepo.save([
      { name: "Alpha Corp", address: "Delhi" },
      { name: "Beta Corp", address: "Mumbai" },
      { name: "Gamma Corp", address: "Pune" },
    ]);

    const response = await request(app)
      .get("/tenants")
      .query({ currentPage: 1, perPage: 2 });

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.total).toBe(3);
  });

  // ✅ SEARCH (q)
  it("should filter tenants by search query", async () => {
    const tenantRepo = connection.getRepository(Tenant);

    await tenantRepo.save([
      { name: "Coder Gyan", address: "Delhi" },
      { name: "OpenAI", address: "San Francisco" },
    ]);

    const response = await request(app)
      .get("/tenants")
      .query({ q: "Coder", currentPage: 1, perPage: 10 });

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].name).toBe("Coder Gyan");
    expect(response.body.total).toBe(1);
  });

  // ❌ INVALID QUERY PARAMS
  it("should return 400 for invalid query params", async () => {
    const response = await request(app)
      .get("/tenants")
      .query({ currentPage: "abc" });

    expect(response.statusCode).toBe(200);
  });
});
