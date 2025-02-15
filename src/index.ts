import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
// import session from "express-session";

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import { predictionRoutes } from "./routes/predictionRoutes";

import { env } from "./config/env";
import { checkDatabaseConnection } from "./utils/prisma";
// import { SESSION_OPTS } from "./config";
import { seedDatabase } from "./utils/index";
import { patientRoutes } from "./routes/patientRoutes";

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

dotenv.config();

const app = express();

// Middlewares
app.use(cors(corsOptions));
app.use(cookieParser());
// app.use(session(SESSION_OPTS));
app.use("/images", express.static("src/public/img"));
app.use(express.json());

const routes = [authRoutes, userRoutes, predictionRoutes, patientRoutes];

app.use("/api/v1", routes);

// seedDatabase(env.ADMIN1_NAME!, env.ADMIN1_EMAIL!, env.ADMIN1_PASSWORD!);
// seedDatabase(env.ADMIN2_NAME!, env.ADMIN2_EMAIL!, env.ADMIN2_PASSWORD!);
// seedDatabase(env.ADMIN3_NAME!, env.ADMIN3_EMAIL!, env.ADMIN3_PASSWORD!);
// seedDatabase(env.ADMIN4_NAME!, env.ADMIN4_EMAIL!, env.ADMIN4_PASSWORD!);
// seedDatabase(env.ADMIN5_NAME!, env.ADMIN5_EMAIL!, env.ADMIN5_PASSWORD!);

const port = env.PORT || 5000;

app.listen(port, async () => {
  console.log(`Server running at http://localhost:${port}`);
  await checkDatabaseConnection();
});
