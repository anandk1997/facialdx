import { Request, Response, RequestHandler } from "express";
import { customErrorRes, customResponse } from "../../utils";
import { prisma } from "../../utils/prisma";
import { User } from "../../models/user";

export const logout: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // res.clearCookie(env.SESSION_COOKIE!);

    const { id } = req.body;

    // @ts-ignore
    const authenticatedUserId = req?.user?.userId;

    if (id !== authenticatedUserId) {
      customErrorRes({
        res,
        status: 403,
        message: "You are not authorized ",
      });
      return;
    }

    if (!id) {
      customErrorRes({
        res,
        status: 400,
        message: "User ID is required",
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

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        firebaseToken: null,
      },
    });

    const sanitizedUser = User.sanitizeUser(updatedUser);

    customResponse({
      res,
      status: 200,
      message: "Logout successfully",
      data: sanitizedUser,
    });
  } catch (error) {
    customErrorRes({
      res,
      status: 500,
      message: "Internal server error",
    });
  }
};
