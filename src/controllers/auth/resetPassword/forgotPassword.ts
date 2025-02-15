import { Request, Response } from "express";

import { prisma } from "../../../utils/prisma";
import { customErrorRes, customResponse, sendEmail } from "../../../utils";
import { cleanExpiredOTPs, generateOTP, otpCache, otpEmail } from "./utils";
import validator from "validator";

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return customErrorRes({
        res,
        status: 400,
        message: "Email is required",
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

    // Store OTP in cache with email as key
    const otpTimestamp = Date.now();
    const otp = generateOTP();

    otpCache.set(normalizedEmail, { otp, timestamp: otpTimestamp });

    // Send OTP via email
    sendEmail(normalizedEmail, otpEmail.subject, otpEmail.html(otp));

    return customResponse({
      res,
      status: 200,
      message: "OTP sent on Email",
      data: {
        email: user?.email,
      },
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    return customErrorRes({
      res,
      status: 500,
      message: "Internal server error",
    });
  }
};

// Run cleanup function periodically
const clearInterval = 2 * 60 * 60 * 1000; // 2 hours

setInterval(cleanExpiredOTPs, clearInterval);
