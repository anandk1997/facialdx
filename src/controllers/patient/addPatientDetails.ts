import { Request, Response, RequestHandler } from "express";

import { prisma } from "../../utils/prisma";
import { customErrorRes, customResponse } from "../../utils";

export const addPatientDetails: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id, image_id, name } = req.body;

    // Required field validation
    const requiredFields = {
      id,
      image_id,
      name,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        customErrorRes({
          res,
          status: 400,
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
        });
        return;
      }
    }

    const prediction = await prisma.prediction.findUnique({
      where: {
        user_id_image_id: {
          user_id: id,
          image_id: parseInt(image_id),
        },
      },
    });

    if (!prediction) {
      customErrorRes({
        res,
        status: 404,
        message: "Prediction details not found",
      });
      return;
    }

    const [existingPatient, existingImageID] = await Promise.all([
      await prisma.patient.findUnique({
        where: {
          user_id_image_id: {
            user_id: id,
            image_id: parseInt(image_id),
          },
        },
      }),

      prisma.patient.findUnique({ where: { image_id } }),
    ]);

    if (existingPatient) {
      customErrorRes({
        res,
        status: 400,
        message: "Patient details already exists",
      });
      return;
    }

    if (existingImageID) {
      customErrorRes({
        res,
        status: 400,
        message: "Patient ID already exists",
      });
      return;
    }

    const patient = await prisma.patient.create({
      data: {
        user_id: id,
        image_id: parseInt(image_id),
        name,
      },
    });

    customResponse({
      res,
      status: 201,
      message: "Patient details added successfully",
      data: {
        id: patient.user_id,
        image_id: patient.image_id,
        name: patient.name,
      },
    });
  } catch (error) {
    console.log("Error creating user: " + error);

    customErrorRes({
      res,
      status: 500,
      message: "Internal server error",
    });
  }
};
