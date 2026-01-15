import { DataSource } from "typeorm";
import { AppDataSource } from "../../data-source";
import request from "supertest";
import { app } from "../../app";
import createJWKSMock from "mock-jwks";
import { User } from "../../entity/User";
import { Tenant } from "../../entity/Tenantcreate";
import { Role } from "../../constants";

describe("GET /users", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5501");
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    jwks.start();
    await connection.dropDatabase();
    await connection.synchronize();

    // Seed a tenant for FK
    await connection.getRepository(Tenant).save({
      id: 1,
      name: "Test Tenant",
      address: "ads",
    });
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it("should return all users for admin", async () => {
    const adminToken = jwks.token({ sub: "1", role: Role.ADMIN });
    const userRepo = connection.getRepository(User);

    // Seed users
    await userRepo.save([
      {
        firstName: "User1",
        lastName: "Last1",
        email: "user1@domain.com",
        password: "password",
        role: Role.MANAGER,
        tenant: { id: 1 },
      },
      {
        firstName: "User2",
        lastName: "Last2",
        email: "user2@domain.com",
        password: "password",
        role: Role.MANAGER,
        tenant: { id: 1 },
      },
    ]);

    const response = await request(app)
      .get("/users")
      .set("Cookie", [`accessToken=${adminToken}`]);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data).toHaveLength(2);

    const emails = response.body.data.map((u: any) => u.email);
    expect(emails).toEqual(
      expect.arrayContaining(["user1@domain.com", "user2@domain.com"]),
    );
  });

  it("should return 403 if non-admin tries to access", async () => {
    const managerToken = jwks.token({ sub: "2", role: Role.MANAGER });

    const response = await request(app)
      .get("/users")
      .set("Cookie", [`accessToken=${managerToken}`]);

    expect(response.statusCode).toBe(403);
  });

  it("should return empty array if no users", async () => {
    const adminToken = jwks.token({ sub: "1", role: Role.ADMIN });

    const response = await request(app)
      .get("/users")
      .set("Cookie", [`accessToken=${adminToken}`]);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data).toHaveLength(0);
  });
});
