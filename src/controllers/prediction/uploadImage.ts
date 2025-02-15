import axios from "axios";
import { customErrorRes, customResponse } from "../../utils";
import { Request, Response } from "express";
import { env } from "../../config/env";

import multer from "multer";
import FormData from "form-data";
import fs from "fs";
import path from "path";

export const uploadImages = async (req: Request, res: Response) => {
  try {
    const { id, images } = req.body;

    if (!id) {
      return customErrorRes({
        res,
        status: 400,
        message: "User ID is required",
      });
    }

    const files: Express.Multer.File[] = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return customErrorRes({
        res,
        status: 400,
        message: "No files uploaded",
      });
    }

    // Prepare the files to be sent to the other API
    const form = new FormData();
    files.forEach((file) => {
      form.append("file", fs.createReadStream(file.path), {
        filename: file.originalname,
        contentType: file.mimetype,
      });
    });
    form.append("user_id", id);

    const apiUrl = env.PYTHON_URL + "/image/upload/";

    const apiResponse = await axios.post(apiUrl, form, {
      // headers: form.getHeaders(),
    });

    // Clean up uploaded files if necessary
    files.forEach((file) => {
      fs.unlinkSync(file.path);
    });

    // if (!images || !Array?.isArray(images) || images?.length === 0) {
    //   return customErrorRes({
    //     res,
    //     status: 400,
    //     message: "Images are required",
    //   });
    // }

    // const formData = new FormData();

    // formData.append("userId", id?.toString());

    // images.forEach((image, index) => {
    //   formData.append(`image${index + 1}`, image);
    // });

    // const apiResponse = await axios.post(apiUrl, formData);

    return customResponse({
      res,
      status: 200,
      message: "Images uploaded successfully",
      data: apiResponse?.data,
    });
  } catch (error) {
    return customErrorRes({
      res,
      status: 500,
      message: "Internal server error",
    });
  }
};
