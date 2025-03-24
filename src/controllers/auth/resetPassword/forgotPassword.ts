import { Request, Response, RequestHandler } from "express";

import { prisma } from "../../../utils/prisma";
import { customErrorRes, sendEmail } from "../../../utils";
import { cleanExpiredOTPs, generateOTP, otpCache, otpEmail } from "./utils";
import validator from "validator";
import { ICustomResponse } from "src/middlewares/response.middleware";

export const forgotPassword: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      customErrorRes({
        res,
        status: 400,
        message: "Email is required",
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

    // Store OTP in cache with email as key
    const otpTimestamp = Date.now();
    const otp = generateOTP();

    otpCache.set(normalizedEmail, { otp, timestamp: otpTimestamp });

    // Send OTP via email
    sendEmail(normalizedEmail, otpEmail.subject, otpEmail.html(otp));

    (res as ICustomResponse).response!({
      status: 200,
      message: "OTP sent on Email",
      data: {
        email: user?.email,
      },
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    customErrorRes({
      res,
      status: 500,
      message: "Internal server error",
    });
    return;
  }
};

// Run cleanup function periodically
const clearInterval = 2 * 60 * 60 * 1000; // 2 hours

setInterval(cleanExpiredOTPs, clearInterval);
