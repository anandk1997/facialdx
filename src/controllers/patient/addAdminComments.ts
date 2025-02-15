import { Request, Response } from "express";
import { customErrorRes, customResponse } from "../../utils";
import { prisma } from "../../utils/prisma";

export const addAdminComments = async (req: Request, res: Response) => {
  const {
    image_id,

    dark_circle_comment,
    pupil_comparison_comment,
    nose_shape_comment,
    nostril_comment,
    mouth_alignment_comment,
    pupil_alignment_comment,
  } = req.body;

  try {
    if (!image_id) {
      return customErrorRes({
        res,
        status: 400,
        message: "Patient ID is required",
      });
    }

    const patient = await prisma.patient.findUnique({
      where: { image_id: parseInt(image_id) },
    });

    if (!patient) {
      return customErrorRes({
        res,
        status: 404,
        message: "Patient not found",
      });
    }

    const updatedPatient = await prisma.patient.update({
      where: { image_id: parseInt(image_id) },
      data: {
        dark_circle_comment,
        pupil_comparison_comment,
        nose_shape_comment,
        nostril_comment,
        mouth_alignment_comment,
        pupil_alignment_comment,
      },
    });

    return customResponse({
      res,
      status: 200,
      message: "Comments updated successfully",
      data: updatedPatient,
    });
  } catch (error) {
    console.error("Error updating patient:", error);

    return customErrorRes({
      res,
      status: 500,
      message: "Internal server error",
    });
  }
};
