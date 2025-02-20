import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "../config";
import { ApiError } from "../utils/ApiError";
import { TokenPayload, User, AuthTokens } from "../types";

// In-memory user storage (replace with a database in production)
const users: User[] = [];

const generateTokens = (payload: TokenPayload): AuthTokens => {
  // Ensure the expiresIn values are correctly handled as strings
  const accessToken = jwt.sign(
    payload,
    config.jwt.ACCESS_SECRET as string,
    {
      expiresIn: config.jwt.ACCESS_EXPIRY, // JWT accepts strings like '15m', '1h'
    } as SignOptions,
  );

  const refreshToken = jwt.sign(
    payload,
    config.jwt.REFRESH_SECRET as string,
    {
      expiresIn: config.jwt.REFRESH_EXPIRY, // Same here for refresh expiry
    } as SignOptions,
  );

  return { accessToken, refreshToken };
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      new ApiError(400, "Email already registered");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user: User = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.push(user);

    const tokens = generateTokens({ userId: user.id, email: user.email });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      status: "success",
      data: { user, accessToken: tokens.accessToken },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    const user = users.find((u) => u.email === email);

    if (!user) {
      new ApiError(401, "Invalid credentials");
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      new ApiError(401, "Invalid credentials");
      return;
    }

    const tokens = generateTokens({ userId: user.id, email: user.email });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      status: "success",
      data: { user, accessToken: tokens.accessToken },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("refreshToken");
  res.json({
    status: "success",
    message: "Logged out successfully",
  });
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = users.find((u) => u.id === req.user?.userId);

    if (!user) {
      new ApiError(404, "User not found");
      return;
    }

    res.json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
