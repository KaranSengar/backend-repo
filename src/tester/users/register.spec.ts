import request from "supertest";
import { app } from "../../app";
import { User } from "../../entity/User";
import { AppDataSource } from "../../data-source";
import { DataSource } from "typeorm";
import { Role } from "../../constants";
import { isJwt } from "../utils";
import { RefreshToken } from "../../entity/Refreshtoken";

describe("POST /auth/register", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    if (connection.isInitialized) {
      await connection.dropDatabase();
      await connection.synchronize();
    }
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("given all fields", () => {
    const userData = {
      firstName: "rakesh",
      lastName: "k",
      email: "rakesh@gmail.com",
      password: "1232432",
    };

    it("should return 201 status code", async () => {
      const response = await request(app).post("/auth/register").send(userData);

      expect(response.statusCode).toBe(201);
    });

    it("should return JSON response", async () => {
      const response = await request(app).post("/auth/register").send(userData);

      expect(response.headers["content-type"]).toContain("json");
    });

    it("should persist the user in database", async () => {
      await request(app).post("/auth/register").send(userData);

      const repo = connection.getRepository(User);
      const users = await repo.find();

      expect(users).toHaveLength(1);
      expect(users[0].email).toBe(userData.email);
    });

    it("should assign CUSTOMER role", async () => {
      await request(app).post("/auth/register").send(userData);

      const repo = connection.getRepository(User);
      const user = await repo.findOneByOrFail({ email: userData.email });

      expect(user.role).toBe(Role.CUSTOMER);
    });

    it("should return id of newly created user", async () => {
      const response = await request(app).post("/auth/register").send(userData);

      expect(response.body).toHaveProperty("id");
      expect(typeof response.body.id).toBe("number");
    });

    it("should store hashed password", async () => {
      await request(app).post("/auth/register").send(userData);

      const repo = connection.getRepository(User);
      const user = await repo.findOneByOrFail({ email: userData.email });

      expect(user.password).not.toBe(userData.password);
      expect(user.password).toHaveLength(60);
      expect(user.password).toMatch(/^\$2[aby]\$/);
    });

    it("should return accessToken and refreshToken in cookies", async () => {
      const response = await request(app).post("/auth/register").send(userData);

      interface Headers {
        ["set-cookie"]: string[];
      }
      const setCookieHeader = response.headers["set-cookie"] || [];

      const cookies: string[] = Array.isArray(setCookieHeader)
        ? setCookieHeader
        : setCookieHeader
          ? [setCookieHeader]
          : [];

      let accessToken: string | null = null;
      let refreshToken: string | null = null;

      cookies.forEach((cookie) => {
        if (cookie.startsWith("accessToken=")) {
          accessToken = cookie.split(";")[0].split("=")[1];
        }
        if (cookie.startsWith("refreshToken=")) {
          refreshToken = cookie.split(";")[0].split("=")[1];
        }
      });

      expect(accessToken).not.toBeNull();
      expect(refreshToken).not.toBeNull();

      // isme ye check ho rha ki token ka type kya hai or bo valid token hai ya nhi hai
      expect(isJwt(accessToken)).toBeTruthy();
      expect(isJwt(refreshToken)).toBeTruthy();
    });

    it("should return 400 if email already exists", async () => {
      const repo = connection.getRepository(User);

      await repo.save({
        ...userData,
        role: Role.CUSTOMER,
        password: "hashed",
      });

      const response = await request(app).post("/auth/register").send(userData);

      const users = await repo.find();

      expect(response.statusCode).toBe(400);
      expect(users).toHaveLength(1);
    });

    it("should store the refresh token in the database", async () => {
      const userData = {
        firstName: "rakesh",
        lastName: "k",
        email: "rakesh@gmail.com",
        password: "1232432",
      };

      const response = await request(app).post("/auth/register").send(userData);

      const refreshtokenrepo = connection.getRepository(RefreshToken);

      // const refreshtoken = await refreshtokenrepo.find();
      const tokens = await refreshtokenrepo
        .createQueryBuilder("refreshToken")
        .where("refreshToken.userId= :userId", { userId: response.body.id })
        .getMany();
      expect(tokens).toHaveLength(1);
      //  expect(refreshtoken)
    });
  });

  describe("missing fields", () => {
    it("should return 400 if email is missing", async () => {
      const response = await request(app).post("/auth/register").send({
        firstName: "rakesh",
        lastName: "k",
        email: "",
        password: "1232432",
      });

      expect(response.statusCode).toBe(400);

      const repo = connection.getRepository(User);
      const users = await repo.find();

      expect(users).toHaveLength(0);
    });
  });

  describe("invalid format", () => {
    it("should trim email before saving", async () => {
      await request(app).post("/auth/register").send({
        firstName: "rakesh",
        lastName: "k",
        email: "rakesh@gmail.com",
        password: "1232432",
      });

      const repo = connection.getRepository(User);
      const user = await repo.findOneByOrFail({
        email: "rakesh@gmail.com",
      });

      expect(user.email).toBe("rakesh@gmail.com");
    });
  });
});
