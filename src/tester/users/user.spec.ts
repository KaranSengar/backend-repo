import { DataSource } from "typeorm";
import { AppDataSource } from "../../data-source";
import request from "supertest";
import { app } from "../../app";
import createJWKSMock from "mock-jwks";
import { User } from "../../entity/User";
import { Role } from "../../constants";

jest.setTimeout(30000); // global timeout 30s

describe("GET /auth/self", () => {
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
    it("should return 200 status", async () => {
      // 1️⃣ Save user in DB first
      const userRepository = connection.getRepository(User);
      const user = await userRepository.save({
        firstName: "rakesh",
        lastName: "k",
        email: "rakesh@gmail.com",
        password: "1232432",
        role: Role.CUSTOMER,
      });

      // 2️⃣ Generate token using saved user's id
      const accessToken = jwks.token({ sub: String(user.id), role: user.role });

      // 3️⃣ Request
      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();

      // ✅ Assertions
      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(user.id);
      expect(response.body).not.toHaveProperty("password");
    });

    it("should return user data", async () => {
      //Register user krke token return karega
      const userData = {
        firstName: "rakesh",
        lastName: "k",
        email: "rakesh@gmail.com",
        password: "1232432",
        role: Role.CUSTOMER,
      };

      const userRepository = connection.getRepository(User);
      const data = await userRepository.save({
        ...userData,
        role: Role.CUSTOMER,
      });
      // generate token
      //add token to cookie
      const accessToken = jwks.token({ sub: String(data.id), role: data.role });

      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken};`])
        .send();

      // check if user id matchs with registerd user
      expect(response.body.id).toBe(data.id);
      // optional: full object check
      //expect(response.body.user).toBe(user);
      // console.log(response.body.user);
    });

    it("should return user data", async () => {
      //Register user krke token return karega
      const userData = {
        firstName: "rakesh",
        lastName: "k",
        email: "rakesh@gmail.com",
        password: "1232432",
        role: Role.CUSTOMER,
      };

      const userRepository = connection.getRepository(User);
      const data = await userRepository.save({
        ...userData,
        role: Role.CUSTOMER,
      });
      // generate token
      //add token to cookie
      const accessToken = jwks.token({ sub: String(data.id), role: data.role });

      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken};`])
        .send();

      // check if user id matchs with registerd user
      console.log(response.body);
      expect(response.body).not.toHaveProperty("password");
      // optional: full object check
      //expect(response.body.user).toBe(user);
      // console.log(response.body.user);
    });

    it("should return 401 status code if token does not exits", async () => {
      const userRepository = connection.getRepository(User);
      const user = await userRepository.save({
        firstName: "rakesh",
        lastName: "k",
        email: "rakesh@gmail.com",
        password: "1232432",
        role: Role.CUSTOMER,
      });

      const response = await request(app).get("/auth/self").send();
      expect(response.statusCode).toBe(401);
      // check returned user id
      /// expect(response.body.user.id).toBe(user.id);
      // optional: full object check
      //expect(response.body.user).toBe(user);
      // console.log(response.body.user);
    });
  });
});
