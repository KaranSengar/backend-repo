import { DataSource } from "typeorm";
import { AppDataSource } from "../../data-source";
import request from "supertest";
import { app } from "../../app";
import { User } from "../../entity/User";
import { RefreshToken } from "../../entity/Refreshtoken";

describe("POST/auth/login", () => {
  let connection: DataSource;
  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    if (connection.isInitialized) {
      await connection.dropDatabase();
      await connection.synchronize();
    }

    await request(app).post("/auth/register").send({
      firstName: "Rakesh",
      lastName: "Kumar",
      email: "rakesh@gmail.com", // spaces to test trim
      password: "1232432",
    });
  });

  afterAll(async () => {
    if (!connection.initialize) {
      await connection.destroy();
    }
  });
  // -------------------- ONLY 1 TEST --------------------
  it("should login user with valid credentials", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "rakesh@gmail.com", // trimmed email
      password: "1232432",
    });

    //console.log("📦 Login response:", res.body);

    expect(res.statusCode).toBe(200);
    // expect(res.body).toHaveProperty("user");
    expect(res.body.user.email).toBe("rakesh@gmail.com"); // trimmed
  });
});
