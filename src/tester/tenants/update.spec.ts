import request from "supertest";
import { app } from "../../app";
import { AppDataSource } from "../../data-source";
import { DataSource } from "typeorm";
import { Tenant } from "../../entity/Tenantcreate";
import createJWKSMock from "mock-jwks";
import { Role } from "../../constants";

describe("PATCH /tenants/:id", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
    jwks = createJWKSMock("http://localhost:5501");
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();

    jwks.start();
    adminToken = jwks.token({
      sub: "1",
      role: Role.ADMIN,
    });
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  // ✅ SUCCESS CASE
  it("should update tenant name", async () => {
    const tenantRepo = connection.getRepository(Tenant);
    const tenant = await tenantRepo.save({
      name: "Old Name",
      address: "Old Address",
    });

    const response = await request(app)
      .patch(`/tenants/${tenant.id}`)
      .set("Cookie", [`accessToken=${adminToken}`])
      .send({ name: "New Name" });

    expect(response.statusCode).toBe(200);

    const updatedTenant = await tenantRepo.findOneBy({ id: tenant.id });
    expect(updatedTenant?.name).toBe("New Name");
  });

  // ❌ UNAUTHENTICATED
  it("should return 401 if user is not authenticated", async () => {
    const tenantRepo = connection.getRepository(Tenant);
    const tenant = await tenantRepo.save({
      name: "Test",
      address: "Test",
    });

    const response = await request(app)
      .patch(`/tenants/${tenant.id}`)
      .send({ name: "New Name" });

    expect(response.statusCode).toBe(401);
  });

  // ❌ NOT ADMIN
  it("should return 403 if user is not admin", async () => {
    const managerToken = jwks.token({
      sub: "1",
      role: Role.MANAGER,
    });

    const tenantRepo = connection.getRepository(Tenant);
    const tenant = await tenantRepo.save({
      name: "Test",
      address: "Test",
    });

    const response = await request(app)
      .patch(`/tenants/${tenant.id}`)
      .set("Cookie", [`accessToken=${managerToken}`])
      .send({ name: "New Name" });

    expect(response.statusCode).toBe(403);
  });

  // ❌ EMPTY BODY (VALIDATION)
  it("should return 400 if request body is empty", async () => {
    const tenantRepo = connection.getRepository(Tenant);
    const tenant = await tenantRepo.save({
      name: "Test",
      address: "Test",
    });

    const response = await request(app)
      .patch(`/tenants/${tenant.id}`)
      .set("Cookie", [`accessToken=${adminToken}`])
      .send({});

    expect(response.statusCode).toBe(400);
  });
});
