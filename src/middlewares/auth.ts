import jwt from "jsonwebtoken";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { User } from "@prisma/client";
import { customErrorRes } from "../utils";
import { prisma } from "../utils/prisma";
import { config } from "src/config";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  // const token = req.cookies?.token;

  if (!token) {
    customErrorRes({
      res,
      status: 401,
      message: "Unauthorized: Access token is missing or invalid.",
    });
    return;
  }

  jwt.verify(token, config.jwt.ACCESS_SECRET!, async (err: any, user: any) => {
    if (err)
      return customErrorRes({
        res,
        status: 403,
        message: "Invalid token",
      });

    // @ts-ignore
    req.user = user as User;

    const blacklistedUser = await prisma.blacklistusers.findFirst({
      where: { userId: user?.userId },
    });

    if (blacklistedUser)
      return customErrorRes({
        res,
        status: 403,
        message: "Unauthorized: Access : User disabled or not found",
      });

    next();
  });
};

export const isAdmin: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // @ts-ignore
  const userID = req?.user?.userId;

  const user = await prisma.user.findUnique({ where: { id: userID } });

  if (user?.role !== "ADMIN") {
    customErrorRes({
      res,
      status: 403,
      message: "Forbidden: Admin access only",
    });
    return;
  }

  next();
};
