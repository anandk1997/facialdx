import { Request, Response } from "express";
import { prisma } from "../../utils/prisma";
import { customErrorRes, customResponse } from "../../utils";

export const getPredictionHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return customErrorRes({
        res,
        status: 400,
        message: "User ID is required",
      });
    }

    const getPredictionById = async () =>
      await prisma.prediction.findMany({
        where: { user_id: id },
      });

    const data = await getPredictionById();

    if (!data || data.length === 0) {
      return customErrorRes({
        res,
        status: 404,
        message: "Data not found",
      });
    }

    const structuredData = data?.map((item) => {
      const darkCircleOutput = item?.dark_circle_output?.toString("base64");
      const inputImage = item?.input_image?.toString("base64");
      const pupilComparisonOutput =
        item?.pupil_comparison_output?.toString("base64");
      const noseShapeOutput = item?.nose_shape_output?.toString("base64");
      const nostrilOutput = item?.nostril_output?.toString("base64");
      const mouthAlignmentOutput =
        item?.mouth_alignment_output?.toString("base64");

      return {
        ...item,
        image_id: item?.image_id,
        input_image: inputImage ? `data:image/jpeg;base64,${inputImage}` : null,
        dark_circle: item?.dark_circle,
        dark_circle_output: darkCircleOutput
          ? `data:image/jpeg;base64,${darkCircleOutput}`
          : null,
        pupil_comparison: item?.pupil_comparison,
        pupil_comparison_output: pupilComparisonOutput
          ? `data:image/jpeg;base64,${pupilComparisonOutput}`
          : null,
        nose_shape: item?.nose_shape,
        nose_shape_output: noseShapeOutput
          ? `data:image/jpeg;base64,${noseShapeOutput}`
          : null,
        nostril: item?.nostril,
        nostril_output: nostrilOutput
          ? `data:image/jpeg;base64,${nostrilOutput}`
          : null,
        mouth_alignment: item?.mouth_alignment,
        mouth_alignment_output: mouthAlignmentOutput
          ? `data:image/jpeg;base64,${mouthAlignmentOutput}`
          : null,
      };
    });

    return customResponse({
      res,
      status: 200,
      message: "Data found successfully",
      data: structuredData,
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
