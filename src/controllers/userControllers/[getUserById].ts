import { Request, Response, RequestHandler } from "express";
import { User } from "../../models/user";
import { prisma } from "../../utils/prisma";
import { customErrorRes, customResponse } from "../../utils";

export const getUserById: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      customErrorRes({
        res,
        status: 400,
        message: "User ID is required",
      });
      return;
    }

    const getUserById = async () =>
      await prisma.user.findUnique({
        where: { id },
      });

    const user = await getUserById();

    if (!user) {
      customErrorRes({
        res,
        status: 404,
        message: "User not found",
      });
      return;
    }

    const sanitizedUser = User.sanitizeUser(user);

    customResponse({
      res,
      status: 200,
      message: "User found successfully",
      data: sanitizedUser,
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    customErrorRes({
      res,
      status: 500,
      message: "Internal server error",
    });
  }
};
