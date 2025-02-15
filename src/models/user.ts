import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { User as UserModel } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { NextFunction, Request, Response } from "express";

const generateToken = (user: UserModel): string => {
  return jwt.sign({ userId: user.id }, env.JWT_SECRET!, {
    expiresIn: "24h",
  });
};

const sanitizeUser = (user: UserModel) => {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};

const verify = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["cookie"];

    if (!authHeader) return res.sendStatus(401);
    const cookie = authHeader.split("=")[1];

    jwt.verify(cookie, env.JWT_SECRET!, async (err: any, decoded: any) => {
      if (err) {
        return res
          .status(401)
          .json({ message: "This session has expired. Please login" });
      }

      const { id } = decoded;

      const user = await prisma.user.findUnique({
        where: { id },
      });

      // @ts-ignore
      req.user = user;
      next();
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
};

export const User = {
  generateToken,
  sanitizeUser,
  verify,
};
