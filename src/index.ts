import "module-alias/register";
import "./setup-aliases";

import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { config } from "./config";
import { errorHandler } from "./middlewares/error.middleware";
import { logger } from "./utils/logger";
import authRoutes1 from "./routes/auth.routes";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
// import session from "express-session";

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import { predictionRoutes } from "./routes/predictionRoutes";

import { checkDatabaseConnection } from "./utils/prisma";
// import { SESSION_OPTS } from "./config";
import { seedDatabase } from "./utils/index";
import { patientRoutes } from "./routes/patientRoutes";
import { responseHandler } from "./middlewares/response.middleware";

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    ...config.cors,
    methods: [...config.cors.methods],
    allowedHeaders: [...config.cors.allowedHeaders],
  }),
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  }),
);

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(responseHandler);

// Logging
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);

// app.use(session(SESSION_OPTS));
app.use(
  "/images",
  express.static("src/public/img") as unknown as express.RequestHandler,
);

const routes = [authRoutes, userRoutes, predictionRoutes, patientRoutes];

// Routes
app.use("/api/auth", authRoutes1);

app.use("/api/v1", routes);

// Error handling
app.use(errorHandler);

// seedDatabase(env.ADMIN1_NAME!, env.ADMIN1_EMAIL!, env.ADMIN1_PASSWORD!);
// seedDatabase(env.ADMIN2_NAME!, env.ADMIN2_EMAIL!, env.ADMIN2_PASSWORD!);
// seedDatabase(env.ADMIN3_NAME!, env.ADMIN3_EMAIL!, env.ADMIN3_PASSWORD!);
// seedDatabase(env.ADMIN4_NAME!, env.ADMIN4_EMAIL!, env.ADMIN4_PASSWORD!);
// seedDatabase(env.ADMIN5_NAME!, env.ADMIN5_EMAIL!, env.ADMIN5_PASSWORD!);

// Start server
app.listen(config.port, async () => {
  logger.info(
    `Server running on port ${config.port} in ${config.nodeEnv} mode`,
  );

  await checkDatabaseConnection();
});

process.on("unhandledRejection", (err: Error) => {
  logger.error("Unhandled Rejection:", err);
  process.exit(1);
});
