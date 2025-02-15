import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { NextFunction, Request, Response } from "express";
import { User } from "@prisma/client";
import { customErrorRes } from "../utils";
import { prisma } from "../utils/prisma";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  // const token = req.cookies?.token;

  if (!token)
    return customErrorRes({
      res,
      status: 401,
      message: "Unauthorized: Access token is missing or invalid.",
    });

  jwt.verify(token, env.JWT_SECRET!, async (err: any, user: any) => {
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

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // @ts-ignore
  const userID = req?.user?.userId;

  const user = await prisma.user.findUnique({ where: { id: userID } });

  if (user?.role !== "ADMIN") {
    return customErrorRes({
      res,
      status: 403,
      message: "Forbidden: Admin access only",
    });
  }

  next();
};
