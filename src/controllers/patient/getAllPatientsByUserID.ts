import { customErrorRes, customResponse } from "../../utils";
import { prisma } from "../../utils/prisma";
import { Request, Response } from "express";
import dayjs from "dayjs";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { format } from "date-fns";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getAllPatientsByUserID = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return customErrorRes({
        res,
        status: 400,
        message: "User ID is required",
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const search = req.query.search as string;

    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) || "asc";

    const offset = (page - 1) * limit;

    let searchFilter: any = {
      user_id: userId,
    };

    if (search) {
      searchFilter = {
        AND: [
          { user_id: userId },

          {
            OR: [
              { image_id: { contains: search, mode: "insensitive" as const } },
              { name: { contains: search, mode: "insensitive" as const } },
            ],
          },
        ],
      };
    }

    // Count the total number of patients
    const totalPatients = await prisma.patient.count({
      where: search ? searchFilter : { user_id: userId },
    });

    // Compute the total number of pages
    const totalPages = Math.ceil(totalPatients / limit);

    const patients = await prisma.patient.findMany({
      where: search ? searchFilter : { user_id: userId },

      skip: offset,
      take: limit,

      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    if (patients?.length === 0) {
      return customResponse({
        res,
        status: 404,
        message: "No data found",
        data: patients,

        totalPatients,
        totalPages,
        currentPage: page,
      });
    }

    // Transform patients into the desired response structure
    const patientHistory = patients.reduce((acc: any, patient) => {
      // const formattedDate = format(patient?.createdAt, "dd MMMM, yyyy");
      const formattedTime = format(patient?.createdAt, "hh:mm a");

      const {
        dark_circle_comment,
        pupil_comparison_comment,
        nose_shape_comment,
        nostril_comment,
        mouth_alignment_comment,
        pupil_alignment_comment,
      } = patient;

      // UTC timestamp

      const utcDate = dayjs(patient?.createdAt);
      const formattedDate = utcDate.format("DD MM YYYY");

      const utcTime = utcDate.format("HH:mm");

      const existingEntry = acc.find(
        (entry: any) => entry.date === formattedDate,
      );

      if (existingEntry) {
        existingEntry.patients.push({
          id: patient?.image_id,
          name: patient?.name,
          time: formattedTime,
          utcTime,

          dark_circle_comment,
          pupil_comparison_comment,
          nose_shape_comment,
          nostril_comment,
          mouth_alignment_comment,
          pupil_alignment_comment,
        });
      } else {
        acc.push({
          id: (acc?.length + 1).toString(),
          date: formattedDate,
          patients: [
            {
              id: patient?.image_id,
              name: patient?.name,
              time: formattedTime,
              utcTime,

              dark_circle_comment,
              pupil_comparison_comment,
              nose_shape_comment,
              nostril_comment,
              mouth_alignment_comment,
              pupil_alignment_comment,
            },
          ],
        });
      }
      return acc;
    }, []);

    return customResponse({
      res,
      status: 200,
      message: "Data found successfully",
      data: patientHistory,

      totalPatients,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching patients:", error);

    return customErrorRes({
      res,
      status: 500,
      message: "Internal server error",
    });
  }
};
