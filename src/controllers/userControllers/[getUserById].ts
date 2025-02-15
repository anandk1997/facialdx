import { Request, Response } from "express";
import { User } from "../../models/user";
import { prisma } from "../../utils/prisma";
import { customErrorRes, customResponse } from "../../utils";

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id)
      return customErrorRes({
        res,
        status: 400,
        message: "User ID is required",
      });

    const getUserById = async () =>
      await prisma.user.findUnique({
        where: { id },
      });

    const user = await getUserById();

    if (!user)
      return customErrorRes({
        res,
        status: 404,
        message: "User not found",
      });

    const sanitizedUser = User.sanitizeUser(user);

    return customResponse({
      res,
      status: 200,
      message: "User found successfully",
      data: sanitizedUser,
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return customErrorRes({
      res,
      status: 500,
      message: "Internal server error",
    });
  }
};
