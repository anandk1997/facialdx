import { Request, Response } from "express";
import bcrypt from "bcrypt";

import { prisma } from "../../../utils/prisma";
import { customErrorRes, customResponse } from "../../../utils";
import { OTP_EXPIRATION_TIME_MS, otpCache } from "./utils";
import { User } from "../../../models/user";
import validator from "validator";

export const validateOtpAndResetPassword = async (
  req: Request,
  res: Response,
) => {
  try {
    const { email, otp, newPassword, confirmNewPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmNewPassword) {
      return customErrorRes({
        res,
        status: 400,
        message: "Email, OTP, and new passwords are required",
      });
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

    if (newPassword !== confirmNewPassword) {
      return customErrorRes({
        res,
        status: 400,
        message: "New and confirm password do not match",
      });
    }

    const storedOtpData = otpCache.get(normalizedEmail);

    if (!storedOtpData || storedOtpData.otp !== otp) {
      return customErrorRes({
        res,
        status: 400,
        message: "Invalid OTP",
      });
    }

    const otpTimestamp = storedOtpData.timestamp;
    const currentTimestamp = Date.now();

    if (currentTimestamp - otpTimestamp > OTP_EXPIRATION_TIME_MS) {
      // OTP expired
      otpCache.delete(normalizedEmail); // Remove expired OTP from cache

      return customErrorRes({
        res,
        status: 400,
        message: "OTP has expired",
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

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    otpCache.delete(normalizedEmail); // Remove expired OTP from cache

    return customResponse({
      res,
      status: 200,
      message: "Password reset successful",
      data: User.sanitizeUser(user),
    });
  } catch (error) {
    console.error("Error in validateOtpAndResetPassword:", error);
    return customErrorRes({
      res,
      status: 500,
      message: "Internal server error",
    });
  }
};
