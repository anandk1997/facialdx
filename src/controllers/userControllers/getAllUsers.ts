import { User } from "../../models/user";
import { customErrorRes, customResponse } from "../../utils";
import { prisma } from "../../utils/prisma";
import { Request, Response, RequestHandler } from "express";

export const getUsers: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const search = req.query.search as string;

    const sortBy = (req.query.sortBy as string) || "name";
    const sortOrder = (req.query.sortOrder as string) || "asc";

    const offset = (page - 1) * limit;

    let searchFilter: any = {
      role: { not: "ADMIN" },
    };

    if (search) {
      searchFilter = {
        ...searchFilter,
        AND: [
          {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
              { phone: { contains: search, mode: "insensitive" as const } },
            ],
          },
        ],
      };
    }

    // Count the total number of users excluding admins
    const totalUsers = await prisma.user.count({
      where: searchFilter,
    });

    // Compute the total number of pages
    const totalPages = Math.ceil(totalUsers / limit);

    const getAllUsersPaginated = async () =>
      await prisma.user.findMany({
        where: searchFilter,

        skip: offset,
        take: limit,

        orderBy: {
          [sortBy]: sortOrder,
        },
      });

    const users = await getAllUsersPaginated();

    const sanitizedUsers = users.map(User.sanitizeUser);

    if (sanitizedUsers?.length === 0) {
      customResponse({
        res,
        status: 404,
        message: "No data found",
        data: sanitizedUsers,

        totalUsers,
        totalPages,
        currentPage: page,
      });
      return;
    }

    customResponse({
      res,
      status: 200,
      message: "Data found successfully",
      data: sanitizedUsers,

      totalUsers,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    customErrorRes({
      res,
      status: 500,
      message: "Internal server error",
    });
  }
};
