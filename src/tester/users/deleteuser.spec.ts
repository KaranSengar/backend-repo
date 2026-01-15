import { DataSource } from "typeorm";
import { AppDataSource } from "../../data-source";
import request from "supertest";
import { app } from "../../app";
import createJWKSMock from "mock-jwks";
import { User } from "../../entity/User";
import { Tenant } from "../../entity/Tenantcreate";
import { Role } from "../../constants";

describe("DELETE /users/:id", () => {
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

    // Seed tenant
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

  it("should delete an existing user for admin", async () => {
    const userRepo = connection.getRepository(User);

    // Seed user
    const user = await userRepo.save({
      firstName: "ToDelete",
      lastName: "User",
      email: "delete@domain.com",
      password: "password",
      role: Role.MANAGER,
      tenant: { id: 1 },
    });

    const adminToken = jwks.token({ sub: "1", role: Role.ADMIN });

    const response = await request(app)
      .delete(`/users/${user.id}`)
      .set("Cookie", [`accessToken=${adminToken}`]);

    expect(response.statusCode).toBe(200);

    const deletedUser = await userRepo.findOneBy({ id: user.id });
    expect(deletedUser).toBeNull(); // ✅ user removed
  });

  it("should return 404 if user does not exist", async () => {
    const adminToken = jwks.token({ sub: "1", role: Role.ADMIN });

    const response = await request(app)
      .delete("/users/9999")
      .set("Cookie", [`accessToken=${adminToken}`]);

    expect(response.statusCode).toBe(404);
  });

  it("should return 403 if non-admin tries to delete", async () => {
    const userRepo = connection.getRepository(User);

    const user = await userRepo.save({
      firstName: "NonAdminDelete",
      lastName: "User",
      email: "nonadmin@domain.com",
      password: "password",
      role: Role.MANAGER,
      tenant: { id: 1 },
    });

    const managerToken = jwks.token({ sub: "2", role: Role.MANAGER });

    const response = await request(app)
      .delete(`/users/${user.id}`)
      .set("Cookie", [`accessToken=${managerToken}`]);

    expect(response.statusCode).toBe(403);

    // User still exists
    const existingUser = await userRepo.findOneBy({ id: user.id });
    expect(existingUser).not.toBeNull();
  });
});
