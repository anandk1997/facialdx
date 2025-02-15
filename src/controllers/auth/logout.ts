import { Request, Response } from "express";
import { customErrorRes, customResponse } from "../../utils";
import { prisma } from "../../utils/prisma";
import { User } from "../../models/user";

export const logout = async (req: Request, res: Response) => {
  try {
    // res.clearCookie(env.SESSION_COOKIE!);

    const { id } = req.body;

    // @ts-ignore
    const authenticatedUserId = req?.user?.userId;

    if (id !== authenticatedUserId) {
      return customErrorRes({
        res,
        status: 403,
        message: "You are not authorized ",
      });
    }

    if (!id)
      return customErrorRes({
        res,
        status: 400,
        message: "User ID is required",
      });

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user)
      return customErrorRes({
        res,
        status: 404,
        message: "User not found",
      });

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        firebaseToken: null,
      },
    });

    const sanitizedUser = User.sanitizeUser(updatedUser);

    return customResponse({
      res,
      status: 200,
      message: "Logout successfully",
      data: sanitizedUser,
    });
  } catch (error) {
    return customErrorRes({
      res,
      status: 500,
      message: "Internal server error",
    });
  }
};
