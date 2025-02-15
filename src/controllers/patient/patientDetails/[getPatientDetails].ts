import { Request, Response, RequestHandler } from "express";
import { prisma } from "../../../utils/prisma";
import { customErrorRes, customResponse } from "../../../utils";
import { predictionResponse } from "./utils";

export const getPatientDetails: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id, image_id } = req.params;

    if (!id) {
      customErrorRes({
        res,
        status: 400,
        message: "User ID is required",
      });
      return;
    }

    if (!image_id) {
      customErrorRes({
        res,
        status: 400,
        message: "Image ID is required",
      });
      return;
    }

    const getPatientById = async () =>
      await prisma.patient.findUnique({
        where: {
          user_id_image_id: {
            user_id: id,
            image_id: parseInt(image_id),
          },
        },
      });

    const patient = await getPatientById();

    const getPredictionById = async () =>
      await prisma.prediction.findUnique({
        where: {
          user_id_image_id: {
            user_id: id,
            image_id: parseInt(image_id),
          },
        },
      });

    const prediction: any = await getPredictionById();

    if (!patient && !prediction) {
      customErrorRes({
        res,
        status: 404,
        message: "Data not found",
      });
      return;
    }

    const analysis = predictionResponse(prediction, patient);

    customResponse({
      res,
      status: 200,
      message: "Data found successfully",
      data: analysis,
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
