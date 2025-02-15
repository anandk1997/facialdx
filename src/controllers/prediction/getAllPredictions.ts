import { customErrorRes, customResponse } from "../../utils";
import { prisma } from "../../utils/prisma";
import { Request, Response, RequestHandler } from "express";

export const getPredictions: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const search = req.query.search as string;

    const sortBy = (req.query.sortBy as string) || "image_id";
    const sortOrder = (req.query.sortOrder as string) || "asc";

    const offset = (page - 1) * limit;

    let searchFilter = {};

    if (search) {
      searchFilter = {
        OR: [
          { image_id: { contains: search, mode: "insensitive" as const } },
          { user_id: { contains: search, mode: "insensitive" as const } },
        ],
      };
    }

    // Count the total number of predictions
    const totalPredictions = await prisma.prediction.count({
      where: search ? searchFilter : undefined,
    });

    // Compute the total number of pages
    const totalPages = Math.ceil(totalPredictions / limit);

    const getAllPredictionsPaginated = async () =>
      await prisma.prediction.findMany({
        where: search ? searchFilter : undefined,

        skip: offset,
        take: limit,

        orderBy: {
          [sortBy]: sortOrder,
        },
      });

    const predictions = await getAllPredictionsPaginated();

    if (predictions?.length === 0) {
      customResponse({
        res,
        status: 404,
        message: "No data found",
        data: predictions,

        totalPredictions,
        totalPages,
        currentPage: page,
      });
      return;
    }

    customResponse({
      res,
      status: 200,
      message: "Data found successfully",
      data: predictions,

      totalPredictions,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching predictions:", error);
    customErrorRes({
      res,
      status: 500,
      message: "Internal server error",
    });
  }
};
