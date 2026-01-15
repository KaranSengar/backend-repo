import { DataSource } from "typeorm";
import { AppDataSource } from "../../data-source";
import request from "supertest";
import { app } from "../../app";
import createJWKSMock from "mock-jwks";
import { User } from "../../entity/User";
import { Role } from "../../constants";
import { Tenant } from "../../entity/Tenantcreate";

jest.setTimeout(30000); // global timeout 30s
/// admin create kr payega menager ke user ko is crud ka yahi means yahi logic implement honge//
describe("post /users", () => {
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
  });

  afterEach(async () => {
    jwks.stop();
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe("Given all fields", () => {
    it("should persist the user in the database", async () => {
      const adminToken = jwks.token({
        sub: "1",
        role: Role.ADMIN,
      });
      await connection.getRepository(Tenant).save({
        id: 1,
        name: "Test Tenant",
        address: "hp",
      });

      const userData = {
        firstName: "Rakesh",
        lastName: "K",
        email: "rakesh@mern.space",
        password: "password",
        tenantId: 1,
        role: Role.MANAGER,
      };

      const response = await request(app)
        .post("/users")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(userData);

      console.log("STATUS:", response.statusCode);
      console.log("BODY:", response.body);
      console.log("TEXT:", response.text);

      expect(response.statusCode).toBe(201);

      const userRepo = connection.getRepository(User);
      const users = await userRepo.find();

      expect(users).toHaveLength(1);
      expect(users[0].email).toBe(userData.email);
    });
    //yaha pr manager hi user create kr skta hai
    /* it("should create a manager user", async () => {
      const adminToken = jwks.token({
        sub: "1",
        role: Role.ADMIN,
      });

      // Register user
      const userData = {
        firstName: "Rakesh",
        lastName: "K",
        email: "rakesh@mern.space",
        password: "password",
        tenantId: 1,
      };

      await request(app)
        .post("/users")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(userData);

      const userRepo = connection.getRepository(User);
      const users = await userRepo.find();

      expect(users).toHaveLength(1);
      ///  expect(users[0].role).toBe(Role.MANAGER)
      expect(users[0].role).toBe(Role.MANAGER);
    });*/
  });
});
