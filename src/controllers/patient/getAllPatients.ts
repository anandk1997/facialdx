import { Request, Response, RequestHandler } from "express";
import { customErrorRes, customResponse } from "../../utils";
import { prisma } from "../../utils/prisma";

export const getAllPatients: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const search = req.query.search as string;

    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) || "asc";

    const offset = (page - 1) * limit;

    let searchFilter: any = {};

    if (search) {
      searchFilter = {
        OR: [
          { image_id: { contains: search, mode: "insensitive" as const } },
          { name: { contains: search, mode: "insensitive" as const } },
        ],
      };
    }

    // Count the total number of patients
    const totalPatients = await prisma.patient.count({
      where: searchFilter,
    });

    // Compute the total number of pages
    const totalPages = Math.ceil(totalPatients / limit);

    const patients = await prisma.patient.findMany({
      where: searchFilter,

      skip: offset,
      take: limit,

      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    if (patients?.length === 0) {
      customResponse({
        res,
        status: 404,
        message: "No patients found",

        data: [],
        totalPatients,
        totalPages,
        currentPage: page,
      });
      return;
    }

    customResponse({
      res,
      status: 200,
      message: "Patients retrieved successfully",

      data: patients,
      totalPatients,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching patients:", error);

    customErrorRes({
      res,
      status: 500,
      message: "Internal server error",
    });
  }
};
