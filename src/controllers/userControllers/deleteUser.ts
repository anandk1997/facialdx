import { Request, Response, RequestHandler } from "express";
import { prisma } from "../../utils/prisma";
import { customErrorRes, customResponse } from "../../utils";
import { User } from "../../models/user";

export const deleteUser: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    // @ts-ignore
    const authenticatedUserId = req?.user?.userId;

    if (!id) {
      customErrorRes({
        res,
        status: 400,
        message: "User ID is required",
      });
      return;
    }

    if (id === authenticatedUserId) {
      customErrorRes({
        res,
        status: 403,
        message: "You cannot delete yourself",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      customErrorRes({
        res,
        status: 404,
        message: "User not found",
      });
      return;
    }

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

    customResponse({
      res,
      status: 200,
      message: "User deleted successfully",
      data: User.sanitizeUser(deletedUser),
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    customErrorRes({
      res,
      status: 500,
      message: "Internal server error",
    });
  }
};
