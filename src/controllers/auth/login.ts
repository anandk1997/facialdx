import validator from "validator";
import bcrypt from "bcrypt";
import { User } from "../../models/user";
import { prisma } from "../../utils/prisma";
import { Request, RequestHandler, Response } from "express";
import { customErrorRes, customResponse } from "../../utils";

export const login: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
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
        customErrorRes({
          res,
          status: 400,
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
        });
        return;
      }
    }

    // Convert email to lowercase
    const normalizedEmail = email.toLowerCase();

    // Validate email format
    if (!validator.isEmail(normalizedEmail)) {
      customErrorRes({
        res,
        status: 400,
        message: "Invalid email format",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      customErrorRes({
        res,
        status: 404,
        message: "User not found",
      });
      return;
    }

    if (!user?.isActive) {
      customErrorRes({
        res,
        status: 401,
        message: "Account is deactivated. Please contact support",
      });
      return;
    }

    if (!(await bcrypt.compare(password, user.password))) {
      customErrorRes({
        res,
        status: 400,
        message: "Invalid password",
      });
      return;
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
      customErrorRes({
        res,
        status: 500,
        message: "Failed to update user details",
      });
      return;
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
    customErrorRes({
      res,
      status: 500,
      message: "Internal server error",
    });
    return;
  }
};
