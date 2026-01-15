import { DataSource } from "typeorm";
import { AppDataSource } from "../../data-source";
import request from "supertest";
import { app } from "../../app";
import createJWKSMock from "mock-jwks";
import { User } from "../../entity/User";
import { Tenant } from "../../entity/Tenantcreate";
import { Role } from "../../constants";

describe("GET /users/:id", () => {
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

    // Seed a tenant
    await connection.getRepository(Tenant).save({
      id: 1,
      name: "Test Tenant",
      address: "Address",
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

  it("should return a user for admin", async () => {
    const userRepo = connection.getRepository(User);

    // Seed a user
    const user = await userRepo.save({
      firstName: "Fetch",
      lastName: "User",
      email: "fetch@domain.com",
      password: "password",
      role: Role.MANAGER,
      tenant: { id: 1 },
    });

    const adminToken = jwks.token({ sub: "1", role: Role.ADMIN });

    const response = await request(app)
      .get(`/users/${user.id}`)
      .set("Cookie", [`accessToken=${adminToken}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("id", user.id);
    expect(response.body).toHaveProperty("email", user.email);
    expect(response.body).toHaveProperty("firstName", user.firstName);
    expect(response.body).toHaveProperty("lastName", user.lastName);
  });

  it("should return 404 if user does not exist", async () => {
    const adminToken = jwks.token({ sub: "1", role: Role.ADMIN });

    const response = await request(app)
      .get("/users/9999")
      .set("Cookie", [`accessToken=${adminToken}`]);

    expect(response.statusCode).toBe(404);
  });

  it("should return 403 if non-admin tries to fetch", async () => {
    const userRepo = connection.getRepository(User);

    const user = await userRepo.save({
      firstName: "NonAdmin",
      lastName: "User",
      email: "nonadminfetch@domain.com",
      password: "password",
      role: Role.MANAGER,
      tenant: { id: 1 },
    });

    const managerToken = jwks.token({ sub: "2", role: Role.MANAGER });

    const response = await request(app)
      .get(`/users/${user.id}`)
      .set("Cookie", [`accessToken=${managerToken}`]);

    expect(response.statusCode).toBe(403);
  });
});
