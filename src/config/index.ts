import { SessionOptions } from "express-session";

import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5001"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),

  BASE_URL: z.string(),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),

  SMTP_HOST: z.string(),
  SMTP_PORT: z.string(),
  SMTP_USERNAME: z.string(),
  SMTP_PASSWORD: z.string(),
  SMTP_EMAIL: z.string(),

  SESSION_COOKIE: z.string(),
  APP_SECRET: z.string(),

  PYTHON_URL: z.string(),

  ADMIN1_NAME: z.string(),
  ADMIN1_EMAIL: z.string(),
  ADMIN1_PASSWORD: z.string(),

  ADMIN2_NAME: z.string(),
  ADMIN2_EMAIL: z.string(),
  ADMIN2_PASSWORD: z.string(),

  ADMIN3_NAME: z.string(),
  ADMIN3_EMAIL: z.string(),
  ADMIN3_PASSWORD: z.string(),

  ADMIN4_NAME: z.string(),
  ADMIN4_EMAIL: z.string(),
  ADMIN4_PASSWORD: z.string(),

  ADMIN5_NAME: z.string(),
  ADMIN5_EMAIL: z.string(),
  ADMIN5_PASSWORD: z.string(),
});

const env = envSchema.parse(process.env);

export const config = Object.freeze({
  port: parseInt(env.PORT, 10),
  nodeEnv: env.NODE_ENV,
  jwt: {
    ACCESS_SECRET: env.JWT_ACCESS_SECRET,
    REFRESH_SECRET: env.JWT_REFRESH_SECRET,
    ACCESS_EXPIRY: env.JWT_ACCESS_EXPIRY,
    REFRESH_EXPIRY: env.JWT_REFRESH_EXPIRY,
  },

  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },

  BASE_URL: env.BASE_URL,
  DB_URL: env.DATABASE_URL,
  PORT: env.PORT,
  NODE_ENV: env.NODE_ENV,

  smtp: {
    SMTP_HOST: env.SMTP_HOST,
    SMTP_PORT: env.SMTP_PORT,
    SMTP_USERNAME: env.SMTP_USERNAME,
    SMTP_PASSWORD: env.SMTP_PASSWORD,
    SMTP_EMAIL: env.SMTP_EMAIL,
  },

  SESSION_COOKIE: env.SESSION_COOKIE,
  APP_SECRET: env.APP_SECRET,

  PYTHON_URL: env.PYTHON_URL,

  credentials: {
    ADMIN1_NAME: env.ADMIN1_NAME,
    ADMIN1_EMAIL: env.ADMIN1_EMAIL,
    ADMIN1_PASSWORD: env.ADMIN1_PASSWORD,

    ADMIN2_NAME: env.ADMIN2_NAME,
    ADMIN2_EMAIL: env.ADMIN2_EMAIL,
    ADMIN2_PASSWORD: env.ADMIN2_PASSWORD,

    ADMIN3_NAME: env.ADMIN3_NAME,
    ADMIN3_EMAIL: env.ADMIN3_EMAIL,
    ADMIN3_PASSWORD: env.ADMIN3_PASSWORD,

    ADMIN4_NAME: env.ADMIN4_NAME,
    ADMIN4_EMAIL: env.ADMIN4_EMAIL,
    ADMIN4_PASSWORD: env.ADMIN4_PASSWORD,

    ADMIN5_NAME: env.ADMIN5_NAME,
    ADMIN5_EMAIL: env.ADMIN5_EMAIL,
    ADMIN5_PASSWORD: env.ADMIN5_PASSWORD,
  },
} as const);

const ONE_HOUR_IN_MS = 1_000 * 60 * 60;
const ONE_WEEK_IN_MS = 7 * 24 * ONE_HOUR_IN_MS;

export const IN_PROD = config.NODE_ENV === "production";

export const SESSION_OPTS: SessionOptions = {
  cookie: {
    // domain, // current domain (Same-Origin, no CORS)
    httpOnly: true,
    maxAge: ONE_WEEK_IN_MS,
    sameSite: "strict",
    secure: IN_PROD,
  },
  name: config.SESSION_COOKIE,
  resave: false, // whether to save the session if it wasn't modified during the request
  rolling: true, // whether to (re-)set cookie on every response
  saveUninitialized: false, // whether to save empty sessions to the store
  secret: config.APP_SECRET!,
};
