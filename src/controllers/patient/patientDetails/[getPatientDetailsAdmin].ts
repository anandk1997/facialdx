import { Request, Response } from "express";
import { prisma } from "../../../utils/prisma";
import { customErrorRes, customResponse } from "../../../utils";
import { predictionResponse } from "./utils";

export const getPatientDetailsAdmin = async (req: Request, res: Response) => {
  try {
    const { image_id } = req.params;

    if (!image_id)
      return customErrorRes({
        res,
        status: 400,
        message: "Image ID is required",
      });

    const getPatientById = async () =>
      await prisma.patient.findUnique({
        where: {
          image_id: parseInt(image_id),
        },
      });

    const patient = await getPatientById();

    const getPredictionById = async () =>
      await prisma.prediction.findUnique({
        where: {
          image_id: parseInt(image_id),
        },
      });

    const prediction: any = await getPredictionById();

    if (!patient && !prediction) {
      return customErrorRes({
        res,
        status: 404,
        message: "Data not found",
      });
    }

    const analysis = predictionResponse(prediction, patient);

    return customResponse({
      res,
      status: 200,
      message: "Data found successfully",
      data: analysis,
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
