import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ApiError } from "src/utils/ApiError";
import { logger } from "src/utils/logger";

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, _: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ApiError(400, error.errors[0].message));
      }

      logger.error("error", error);

      next(error);
    }
  };
