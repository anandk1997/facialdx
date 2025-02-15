import { Request, Response, RequestHandler } from "express";
import bcrypt from "bcrypt";

import { prisma } from "../../../utils/prisma";
import { customErrorRes, customResponse } from "../../../utils";
import { OTP_EXPIRATION_TIME_MS, otpCache } from "./utils";
import { User } from "../../../models/user";
import validator from "validator";

export const validateOtpAndResetPassword: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, otp, newPassword, confirmNewPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmNewPassword) {
      customErrorRes({
        res,
        status: 400,
        message: "Email, OTP, and new passwords are required",
      });
      return;
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

    if (newPassword !== confirmNewPassword) {
      customErrorRes({
        res,
        status: 400,
        message: "New and confirm password do not match",
      });
      return;
    }

    const storedOtpData = otpCache.get(normalizedEmail);

    if (!storedOtpData || storedOtpData.otp !== otp) {
      customErrorRes({
        res,
        status: 400,
        message: "Invalid OTP",
      });
      return;
    }

    const otpTimestamp = storedOtpData.timestamp;
    const currentTimestamp = Date.now();

    if (currentTimestamp - otpTimestamp > OTP_EXPIRATION_TIME_MS) {
      // OTP expired
      otpCache.delete(normalizedEmail); // Remove expired OTP from cache

      customErrorRes({
        res,
        status: 400,
        message: "OTP has expired",
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

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    otpCache.delete(normalizedEmail); // Remove expired OTP from cache

    customResponse({
      res,
      status: 200,
      message: "Password reset successful",
      data: User.sanitizeUser(user),
    });
    return;
  } catch (error) {
    console.error("Error in validateOtpAndResetPassword:", error);
    customErrorRes({
      res,
      status: 500,
      message: "Internal server error",
    });
    return;
  }
};
