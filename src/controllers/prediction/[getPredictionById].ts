import { Request, Response } from "express";
import { prisma } from "../../utils/prisma";
import { customErrorRes, customResponse } from "../../utils";

export const getPredictionById = async (req: Request, res: Response) => {
  try {
    const { id, image_id } = req.params;

    if (!id)
      return customErrorRes({
        res,
        status: 400,
        message: "User ID is required",
      });

    if (!image_id)
      return customErrorRes({
        res,
        status: 400,
        message: "Image ID is required",
      });

    const getUserById = async () =>
      await prisma.prediction.findUnique({
        where: {
          user_id_image_id: {
            user_id: id,
            image_id: parseInt(image_id),
          },
        },
      });

    const data = await getUserById();

    if (!data)
      return customErrorRes({
        res,
        status: 404,
        message: "Data not found",
      });

    const darkCircleOutput = data.dark_circle_output?.toString("base64");
    const inputImage = data.input_image?.toString("base64");
    const pupil_comparison_output =
      data.pupil_comparison_output?.toString("base64");
    const nose_shape_output = data.nose_shape_output?.toString("base64");
    const nostril_output = data.nostril_output?.toString("base64");
    const mouth_alignment_output =
      data.mouth_alignment_output?.toString("base64");

    const structured = {
      ...data,
      image_id: data.image_id,
      input_image: `data:image/jpeg;base64,${inputImage}`,
      dark_circle: data.dark_circle,
      dark_circle_output: `data:image/jpeg;base64,${darkCircleOutput}`,
      pupil_comparison: data.pupil_comparison,
      pupil_comparison_output: `data:image/jpeg;base64,${pupil_comparison_output}`,
      nose_shape: data.nose_shape,
      nose_shape_output: `data:image/jpeg;base64,${nose_shape_output}`,
      nostril: data.nostril,
      nostril_output: `data:image/jpeg;base64,${nostril_output}`,
      mouth_alignment: data.mouth_alignment,
      mouth_alignment_output: `data:image/jpeg;base64,${mouth_alignment_output}`,
    };

    return customResponse({
      res,
      status: 200,
      message: "Data found successfully",
      data: structured,
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
