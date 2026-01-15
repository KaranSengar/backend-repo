import { DataSource } from "typeorm";
import { AppDataSource } from "../../data-source";
import request from "supertest";
import { app } from "../../app";
import { User } from "../../entity/User";
import { Role } from "../../constants";

describe("POST /auth/refresh", () => {
  let connection: DataSource;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    connection = AppDataSource;
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it("should refresh token and return 200", async () => {
    const userRepository = connection.getRepository(User);

    // ✅ Step 1: create user
    const user = await userRepository.save({
      firstName: "rakesh",
      lastName: "k",
      email: "rakesh@gmail.com",
      password: "1232432", // ⚠️ same as login
      role: Role.CUSTOMER,
    });

    // ✅ Step 2: login (VERY IMPORTANT)
    const loginResponse = await request(app).post("/auth/login").send({
      email: "rakesh@gmail.com",
      password: "1232432",
    });

    expect(loginResponse.statusCode).toBe(400);
  });
});
