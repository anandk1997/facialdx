import { Request, Response } from "express";
import { prisma } from "../../utils/prisma";
import { customErrorRes, customResponse } from "../../utils";
import { User } from "../../models/user";

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // @ts-ignore
    const authenticatedUserId = req?.user?.userId;

    if (!id)
      return customErrorRes({
        res,
        status: 400,
        message: "User ID is required",
      });

    if (id === authenticatedUserId) {
      return customErrorRes({
        res,
        status: 403,
        message: "You cannot delete yourself",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user)
      return customErrorRes({
        res,
        status: 404,
        message: "User not found",
      });

    const deletedUser = await prisma.user.delete({
      where: { id },
    });

    await prisma.blacklistusers.create({
      data: { userId: id },
    });

    await prisma.patient.deleteMany({
      where: { user_id: id },
    });

    await prisma.prediction.deleteMany({
      where: { user_id: id },
    });

    return customResponse({
      res,
      status: 200,
      message: "User deleted successfully",
      data: User.sanitizeUser(deletedUser),
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return customErrorRes({
      res,
      status: 500,
      message: "Internal server error",
    });
  }
};
