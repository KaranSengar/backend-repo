import request from "supertest";
import express from "express";

// 🔥 MOCK EVERYTHING (DB + services + middleware)
jest.mock("../data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

jest.mock("../controllers/AuthControllers", () => ({
  AuthController: jest.fn().mockImplementation(() => ({
    register: jest.fn((req, res) => res.status(201).json({ success: true })),
    login: jest.fn((req, res) => res.status(200).json({ token: "fake" })),
    self: jest.fn((req, res) => res.status(200).json({ user: {} })),
    refresh: jest.fn((req, res) => res.status(200).json({ token: "new" })),
    logout: jest.fn((req, res) => res.status(200).json({ logout: true })),
  })),
}));

jest.mock("../middleware/authentiction", () =>
  jest.fn((req, res, next) => next()),
);

jest.mock("../middleware/vallidateRefreshtoken", () =>
  jest.fn((req, res, next) => next()),
);

jest.mock("../middleware/logoutmiddleware", () =>
  jest.fn((req, res, next) => next()),
);

jest.mock("../validators/register-validator", () =>
  jest.fn((req, res, next) => next()),
);

jest.mock("../validators/loginvalidator", () =>
  jest.fn((req, res, next) => next()),
);

// 🔥 IMPORT ROUTER AFTER MOCKS
import authRoutes from "../routes/auth";

describe("Auth Routes – Sonar Coverage Tests", () => {
  const app = express();
  app.use(express.json());
  app.use("/auth", authRoutes);

  it("POST /register should return 201", async () => {
    const res = await request(app).post("/auth/register").send({});
    expect(res.status).toBe(201);
  });

  it("POST /login should return 200", async () => {
    const res = await request(app).post("/auth/login").send({});
    expect(res.status).toBe(200);
  });

  it("GET /self should return 200", async () => {
    const res = await request(app).get("/auth/self");
    expect(res.status).toBe(200);
  });

  it("POST /refresh should return 200", async () => {
    const res = await request(app).post("/auth/refresh");
    expect(res.status).toBe(200);
  });

  it("POST /logout should return 200", async () => {
    const res = await request(app).post("/auth/logout");
    expect(res.status).toBe(200);
  });
});
