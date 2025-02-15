import dotenv from "dotenv";
dotenv.config();

export const env = Object.freeze({
  BASE_URL: process.env.BASE_URL,
  DB_URL: process.env.DATABASE_URL,
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV,

  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USERNAME: process.env.SMTP_USERNAME,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  SMTP_EMAIL: process.env.SMTP_EMAIL,

  SESSION_COOKIE: process.env.SESSION_COOKIE,
  APP_SECRET: process.env.APP_SECRET,

  PYTHON_URL: process.env.PYTHON_URL,

  ADMIN1_NAME: process.env.ADMIN1_NAME,
  ADMIN1_EMAIL: process.env.ADMIN1_EMAIL,
  ADMIN1_PASSWORD: process.env.ADMIN1_PASSWORD,

  ADMIN2_NAME: process.env.ADMIN2_NAME,
  ADMIN2_EMAIL: process.env.ADMIN2_EMAIL,
  ADMIN2_PASSWORD: process.env.ADMIN2_PASSWORD,

  ADMIN3_NAME: process.env.ADMIN3_NAME,
  ADMIN3_EMAIL: process.env.ADMIN3_EMAIL,
  ADMIN3_PASSWORD: process.env.ADMIN3_PASSWORD,

  ADMIN4_NAME: process.env.ADMIN4_NAME,
  ADMIN4_EMAIL: process.env.ADMIN4_EMAIL,
  ADMIN4_PASSWORD: process.env.ADMIN4_PASSWORD,

  ADMIN5_NAME: process.env.ADMIN5_NAME,
  ADMIN5_EMAIL: process.env.ADMIN5_EMAIL,
  ADMIN5_PASSWORD: process.env.ADMIN5_PASSWORD,
});
