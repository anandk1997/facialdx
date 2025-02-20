import request from "supertest";
import express from "express";
import authRoutes from "../routes/auth.routes";
import { errorHandler } from "../middleware/error.middleware";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use(errorHandler);

describe("Auth Routes", () => {
  const testUser = {
    email: "test@example.com",
    password: "Test123!@#",
    name: "Test User",
  };

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/api/auth/register").send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.data.user).toHaveProperty("id");
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it("should validate email format", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...testUser, email: "invalid-email" });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login user with valid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("accessToken");
    });
  });
});
