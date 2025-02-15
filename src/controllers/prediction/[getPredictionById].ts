import { Request, Response, RequestHandler } from "express";
import { prisma } from "../../utils/prisma";
import { customErrorRes, customResponse } from "../../utils";

export const getPredictionById: RequestHandler = async (
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

    if (!data) {
      customErrorRes({
        res,
        status: 404,
        message: "Data not found",
      });
      return;
    }

    const darkCircleOutput = data.dark_circle_output?.toString();
    const inputImage = data.input_image?.toString();
    const pupil_comparison_output = data.pupil_comparison_output?.toString();
    const nose_shape_output = data.nose_shape_output?.toString();
    const nostril_output = data.nostril_output?.toString();
    const mouth_alignment_output = data.mouth_alignment_output?.toString();

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

    customResponse({
      res,
      status: 200,
      message: "Data found successfully",
      data: structured,
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
