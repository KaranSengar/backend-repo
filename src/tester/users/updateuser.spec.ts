import { DataSource } from "typeorm";
import { AppDataSource } from "../../data-source";
import request from "supertest";
import { app } from "../../app";
import createJWKSMock from "mock-jwks";
import { User } from "../../entity/User";
import { Tenant } from "../../entity/Tenantcreate";
import { Role } from "../../constants";

describe("PATCH /users/:id", () => {
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

    // ✅ Create a tenant for FK
    await connection.getRepository(Tenant).save({
      id: 1,
      name: "Test Tenant",
      address:"hs"
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

  it("should update an existing user (all required fields)", async () => {
    const adminToken = jwks.token({ sub: "1", role: Role.ADMIN });

    // Create initial user
    const userRepo = connection.getRepository(User);
    const user = await userRepo.save({
      firstName: "OldFirst",
      lastName: "OldLast",
      email: "user@domain.com",
      password: "password",
      role: "MANAGER",
      tenant: { id: 1 },
    });

    // Update data (all required fields for validator)
    const updateData = {
      firstName: "NewFirst",
      lastName: "NewLast",
      role: "MANAGER",
      email: "user@domain.com",
      tenantId: 1,
    };

    const response = await request(app)
      .patch(`/users/${user.id}`)
      .set("Cookie", [`accessToken=${adminToken}`])
      .send(updateData);

    expect(response.statusCode).toBe(200);

    const updatedUser = await userRepo.findOneBy({ id: user.id });
    expect(updatedUser).not.toBeNull();
    expect(updatedUser?.firstName).toBe(updateData.firstName);
    expect(updatedUser?.lastName).toBe(updateData.lastName);
    expect(updatedUser?.role).toBe(updateData.role);
  });

  it("should return 404 if user does not exist", async () => {
    const adminToken = jwks.token({ sub: "1", role: Role.ADMIN });

    const updateData = {
      firstName: "X",
      lastName: "Y",
      role: "MANAGER",
      email: "nonexist@domain.com",
      tenantId: 1,
    };

    const response = await request(app)
      .patch("/users/9999")
      .set("Cookie", [`accessToken=${adminToken}`])
      .send(updateData);

    expect(response.statusCode).toBe(404);
  });

  it("should return 403 if non-admin tries to update", async () => {
    const managerToken = jwks.token({ sub: "2", role: Role.MANAGER });

    const userRepo = connection.getRepository(User);
    const user = await userRepo.save({
      firstName: "OldFirst",
      lastName: "OldLast",
      email: "user2@domain.com",
      password: "password",
      role: "MANAGER",
      tenant: { id: 1 },
    });

    const updateData = {
      firstName: "NewFirst",
      lastName: "NewLast",
      role: "MANAGER",
      email: "user2@domain.com",
      tenantId: 1,
    };

    const response = await request(app)
      .patch(`/users/${user.id}`)
      .set("Cookie", [`accessToken=${managerToken}`])
      .send(updateData);

    expect(response.statusCode).toBe(403);
  });
});
