import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (err instanceof ApiError) {
    logger.error(`API Error: ${err.message}`);

    res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
    });

    return;
  }

  logger.error(`Unhandled Error: ${err.message}`);

  res.status(500).json({
    status: 500,
    message: "Internal server error",
  });
};
