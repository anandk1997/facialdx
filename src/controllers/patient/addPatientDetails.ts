import { Request, Response } from "express";

import { prisma } from "../../utils/prisma";
import { customErrorRes, customResponse } from "../../utils";

export const addPatientDetails = async (req: Request, res: Response) => {
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
        return customErrorRes({
          res,
          status: 400,
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
        });
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
      return customErrorRes({
        res,
        status: 404,
        message: "Prediction details not found",
      });
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
      return customErrorRes({
        res,
        status: 400,
        message: "Patient details already exists",
      });
    }

    if (existingImageID) {
      return customErrorRes({
        res,
        status: 400,
        message: "Patient ID already exists",
      });
    }

    const patient = await prisma.patient.create({
      data: {
        user_id: id,
        image_id: parseInt(image_id),
        name,
      },
    });

    return customResponse({
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

    return customErrorRes({
      res,
      status: 500,
      message: "Internal server error",
    });
  }
};
