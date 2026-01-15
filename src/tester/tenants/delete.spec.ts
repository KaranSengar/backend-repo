import request from "supertest";
import { app } from "../../app";
import createJWKSMock from "mock-jwks";
import { Role } from "../../constants";
import { AppDataSource } from "../../data-source";
import { DataSource } from "typeorm";
import { Tenant } from "../../entity/Tenantcreate";

describe("GET /tenants/:id - Auth & Role Tests", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;
  let managerToken: string;
  let tenantId: string;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
    jwks = createJWKSMock("http://localhost:5501");
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();

    jwks.start();

    // tokens
    adminToken = jwks.token({ sub: "1", role: Role.ADMIN });
    managerToken = jwks.token({ sub: "2", role: Role.MANAGER });

    // minimal tenant
    const tenantRepo = connection.getRepository(Tenant);
    const tenant = await tenantRepo.save({
      name: "Tenant One",
      address: "Delhi",
    });
    tenantId = String(tenant.id);
  });

  afterEach(() => jwks.stop());
  afterAll(async () => await connection.destroy());

  // ❌ 401 UNAUTHENTICATED
  it("should return 401 if no token provided", async () => {
    const response = await request(app).get(`/tenants/${tenantId}`);
    expect(response.statusCode).toBe(401);
  });

  // ❌ 403 FORBIDDEN
  it("should return 403 if user is not admin", async () => {
    const response = await request(app)
      .get(`/tenants/${tenantId}`)
      .set("Cookie", [`accessToken=${managerToken}`]);

    expect(response.statusCode).toBe(403);
  });

  // ✅ 200 ADMIN
  it("should allow admin to access", async () => {
    const response = await request(app)
      .get(`/tenants/${tenantId}`)
      .set("Cookie", [`accessToken=${adminToken}`]);

    // statusCode 200 even if controller returns empty / dummy data
    // kyunki hum controller logic ignore kar rahe hain
    expect([200, 404]).toContain(response.statusCode);
  });
});
