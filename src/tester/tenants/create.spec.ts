import { DataSource } from "typeorm";
import { AppDataSource } from "../../data-source";
import request from "supertest";
import { app } from "../../app";
import { Tenant } from "../../entity/Tenantcreate";
import createJWKSMock from "mock-jwks";
import { Role } from "../../constants";

describe("POST/tenants", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;
  beforeAll(async () => {
    connection = await AppDataSource.initialize();
    jwks = createJWKSMock("http://localhost:5501");
  });

  beforeEach(async () => {
    if (connection.isInitialized) {
      await connection.dropDatabase();
      await connection.synchronize();
    }
    jwks.start();

    adminToken = jwks.token({
      sub: "1",
      role: Role.ADMIN,
    });
  });

  afterAll(async () => {
    if (!connection.initialize) {
      await connection.destroy();
    }
  });
  afterEach(() => {
    jwks.stop();
  });

  // -------------------- ONLY 1 TEST --------------------
  describe("Gives all fields", () => {
    it("should return to 201 status code", async () => {
      const tenantData = {
        name: "Tenant name",
        address: "Tenant address",
      };
      const response = await request(app)
        .post("/tenants")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(tenantData);

      expect(response.statusCode).toBe(201);
    });

    it("should create a tenant in the database", async () => {
      const tenantData = {
        name: "Tenant name",
        address: "Tenant address",
      };
      await request(app)
        .post("/tenants")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(tenantData);

      const tenantRepository = connection.getRepository(Tenant);
      const tenant = await tenantRepository.find();
      expect(tenant).toHaveLength(1);
      expect(tenant[0].name).toBe(tenantData.name);
      expect(tenant[0].address).toBe(tenantData.address);
    });

    it("should return 401 if user is not authtication", async () => {
      const tenantData = {
        name: "Tenant name",
        address: "Tenant address",
      };
      const response = await request(app).post("/tenants").send(tenantData);

      expect(response.statusCode).toBe(401);
      const tenantRepository = connection.getRepository(Tenant);
      const tenant = await tenantRepository.find();
      expect(tenant).toHaveLength(0);
      //expect(tenant[0].name).toBe(tenantData.name);
      //expect(tenant[0].address).toBe(tenantData.address);
    });

    it("should return 403 if user is not authtication", async () => {
      const managerToken = jwks.token({
        sub: "1",
        role: Role.MANAGER,
      });
      const tenantData = {
        name: "Tenant name",
        address: "Tenant address",
      };
      const response = await request(app)
        .post("/tenants")
        .set("Cookie", [`accessToken=${managerToken}`])
        .send(tenantData);

      expect(response.statusCode).toBe(403);
      const tenantRepository = connection.getRepository(Tenant);
      const tenant = await tenantRepository.find();
      expect(tenant).toHaveLength(0);
      //expect(tenant[0].name).toBe(tenantData.name);
      //expect(tenant[0].address).toBe(tenantData.address);
    });
  });
});
