import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../../utils/prisma";
import { customErrorRes, customResponse } from "../../utils";
import { User } from "../../models/user";

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { id, currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!id) {
      return customErrorRes({
        res,
        status: 400,
        message: "User ID is required",
      });
    }

    if (!currentPassword) {
      return customErrorRes({
        res,
        status: 400,
        message: "Current password is required",
      });
    }

    if (!newPassword) {
      return customErrorRes({
        res,
        status: 400,
        message: "New password is required",
      });
    }

    if (!confirmNewPassword) {
      return customErrorRes({
        res,
        status: 400,
        message: "Confirm password is required",
      });
    }

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return customErrorRes({
        res,
        status: 404,
        message: "User not found",
      });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return customErrorRes({
        res,
        status: 400,
        message: "Current password is incorrect",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return customErrorRes({
        res,
        status: 400,
        message: "New password and confirm password do not match",
      });
    }

    if (currentPassword === newPassword) {
      return customErrorRes({
        res,
        status: 400,
        message: "Current password and new password can not be the same",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedResponse = await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });

    return customResponse({
      res,
      status: 200,
      message: "Password updated successfully",
      data: User.sanitizeUser(updatedResponse),
    });
  } catch (error) {
    return customErrorRes({
      res,
      status: 500,
      message: "Internal server error",
    });
  }
};
