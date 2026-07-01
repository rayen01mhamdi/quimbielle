import { describe, it, expect, beforeAll, afterAll } from "vitest"
import request from "supertest"
import express from "express"
import cors from "cors"
import authRouter from "./auth"
import formsRouter from "./forms"
import { authenticate, AuthRequest } from "../middleware/authenticate"
import { prisma } from "../lib/prisma"

const app = express()
app.use(cors())
app.use(express.json())
app.use("/auth", authRouter)
app.use("/api/forms", formsRouter)
app.get("/api/me", authenticate, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, name: true, isAdmin: true }
  })
  res.json({ user })
})

const TEST_EMAIL = `test_${Date.now()}@example.com`
const TEST_PASSWORD = "password123"
let token = ""

beforeAll(async () => {
  await prisma.$connect()
})

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } })
  await prisma.$disconnect()
})

describe("POST /auth/register", () => {
  it("registers a new user and returns a token", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: TEST_EMAIL, name: "Test User", password: TEST_PASSWORD })
    expect(res.status).toBe(201)
    expect(res.body.token).toBeDefined()
    token = res.body.token
  })

  it("returns 409 for duplicate email", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: TEST_EMAIL, name: "Test User", password: TEST_PASSWORD })
    expect(res.status).toBe(409)
  })

  it("returns 400 for invalid email", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "notanemail", name: "Test", password: TEST_PASSWORD })
    expect(res.status).toBe(400)
  })

  it("returns 400 for short password", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "new@test.com", name: "Test", password: "123" })
    expect(res.status).toBe(400)
  })
})

describe("POST /auth/login", () => {
  it("logs in with correct credentials", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
  })

  it("returns 401 for wrong password", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: TEST_EMAIL, password: "wrongpassword" })
    expect(res.status).toBe(401)
  })

  it("returns 401 for unknown email", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "nobody@nowhere.com", password: TEST_PASSWORD })
    expect(res.status).toBe(401)
  })
})

describe("GET /api/me", () => {
  it("returns 401 without token", async () => {
    const res = await request(app).get("/api/me")
    expect(res.status).toBe(401)
  })

  it("returns user with valid token", async () => {
    const res = await request(app)
      .get("/api/me")
      .set("Authorization", `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.user).toBeDefined()
  })
})

describe("GET /api/forms", () => {
  it("returns 401 without token", async () => {
    const res = await request(app).get("/api/forms")
    expect(res.status).toBe(401)
  })

  it("returns forms list with valid token", async () => {
    const res = await request(app)
      .get("/api/forms")
      .set("Authorization", `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.forms).toBeDefined()
  })
})