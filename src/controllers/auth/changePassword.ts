import { Request, Response, RequestHandler } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../../utils/prisma";
import { customErrorRes, customResponse } from "../../utils";
import { User } from "../../models/user";

export const changePassword: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id, currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!id) {
      customErrorRes({
        res,
        status: 400,
        message: "User ID is required",
      });
      return;
    }

    if (!currentPassword) {
      customErrorRes({
        res,
        status: 400,
        message: "Current password is required",
      });
      return;
    }

    if (!newPassword) {
      customErrorRes({
        res,
        status: 400,
        message: "New password is required",
      });
      return;
    }

    if (!confirmNewPassword) {
      customErrorRes({
        res,
        status: 400,
        message: "Confirm password is required",
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      customErrorRes({
        res,
        status: 404,
        message: "User not found",
      });
      return;
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      customErrorRes({
        res,
        status: 400,
        message: "Current password is incorrect",
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      customErrorRes({
        res,
        status: 400,
        message: "New password and confirm password do not match",
      });
      return;
    }

    if (currentPassword === newPassword) {
      customErrorRes({
        res,
        status: 400,
        message: "Current password and new password can not be the same",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedResponse = await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });

    customResponse({
      res,
      status: 200,
      message: "Password updated successfully",
      data: User.sanitizeUser(updatedResponse),
    });
    return;
  } catch (error) {
    customErrorRes({
      res,
      status: 500,
      message: "Internal server error",
    });
    return;
  }
};
