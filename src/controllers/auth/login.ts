import validator from "validator";
import bcrypt from "bcrypt";
import { User } from "../../models/user";
import { prisma } from "../../utils/prisma";
import { Request, Response } from "express";
import { customErrorRes, customResponse } from "../../utils";

export const login = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      firebaseToken,
      deviceDetails,
      deviceOS,
      appVersion,
    } = req.body;

    const requiredFields = {
      email,
      password,
      firebaseToken,
      deviceDetails,
      deviceOS,
      appVersion,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        return customErrorRes({
          res,
          status: 400,
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
        });
      }
    }

    // Convert email to lowercase
    const normalizedEmail = email.toLowerCase();

    // Validate email format
    if (!validator.isEmail(normalizedEmail)) {
      return customErrorRes({
        res,
        status: 400,
        message: "Invalid email format",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return customErrorRes({
        res,
        status: 404,
        message: "User not found",
      });
    }

    if (!user?.isActive) {
      return customErrorRes({
        res,
        status: 401,
        message: "Account is deactivated. Please contact support",
      });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return customErrorRes({
        res,
        status: 400,
        message: "Invalid password",
      });
    }

    let updatedUser;

    try {
      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          firebaseToken,
          deviceDetails,
          deviceOS,
          appVersion,
        },
      });
    } catch (updateError) {
      return customErrorRes({
        res,
        status: 500,
        message: "Failed to update user details",
      });
    }

    const sanitizedUser = User.sanitizeUser(updatedUser);
    const token = User.generateToken(updatedUser);

    // @ts-ignore
    req.user = sanitizedUser;

    // @ts-ignore
    // req.session.userId = sanitizedUser.id;

    // const expireTime = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    // res.cookie(env.SESSION_COOKIE!, token, {
    //   expires: new Date(Date.now() + expireTime),
    //   httpOnly: true,
    // });

    return customResponse({
      res,
      status: 200,
      message: "Logged in successfully",
      data: {
        ...sanitizedUser,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return customErrorRes({
      res,
      status: 500,
      message: "Internal server error",
    });
  }
};
