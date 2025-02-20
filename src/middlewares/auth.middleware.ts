import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { TokenPayload } from "../types";
import { ApiError } from "../utils/ApiError";
import { logger } from "src/utils/logger";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return next(new ApiError(401, "No token provided"));
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.jwt.ACCESS_SECRET) as TokenPayload;
    req.user = decoded;

    next();
  } catch (error) {
    logger.error("error", error);
    next(new ApiError(401, "Invalid or expired token"));
  }
};
