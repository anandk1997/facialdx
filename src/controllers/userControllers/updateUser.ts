import { Request, Response, RequestHandler } from "express";
import bcrypt from "bcrypt";

import { User } from "../../models/user";
import { prisma } from "../../utils/prisma";
import validator from "validator";
import { customErrorRes, customResponse } from "../../utils";

export const updateUser: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, password, isActive, organization } = req.body;

    if (!id) {
      customErrorRes({
        res,
        status: 400,
        message: "User ID is required",
      });
      return;
    }

    // Validate fields if they are provided
    const minPhoneLength = 4;
    const maxPhoneLength = 15;

    if (phone) {
      if (phone.length < minPhoneLength || phone.length > maxPhoneLength) {
        customErrorRes({
          res,
          status: 400,
          message: `Phone number must be between ${minPhoneLength} and ${maxPhoneLength} digits`,
        });
        return;
      }

      if (!validator.isNumeric(phone)) {
        customErrorRes({
          res,
          status: 400,
          message: "Phone number must contain only digits",
        });
        return;
      }
    }

    if (email && !validator.isEmail(email)) {
      customErrorRes({
        res,
        status: 400,
        message: "Invalid email format",
      });
      return;
    }

    // Check for empty email or phone number
    if (email === "") {
      customErrorRes({
        res,
        status: 400,
        message: "Email cannot be empty",
      });
      return;
    }

    if (phone === "") {
      customErrorRes({
        res,
        status: 400,
        message: "Phone number cannot be empty",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      customErrorRes({
        res,
        status: 404,
        message: "User not found",
      });
      return;
    }

    const updateData: any = {};

    if (name) updateData.name = name;

    // Normalize email to lowercase
    const normalizedEmail = email?.toLowerCase();

    if (normalizedEmail) {
      // Check if the new email already exists for another user
      const existingEmail = await prisma.user.findFirst({
        where: {
          email: normalizedEmail,
          id: {
            not: id,
          },
        },
      });

      if (existingEmail) {
        customErrorRes({
          res,
          status: 400,
          message: "Email already exists",
        });
        return;
      }

      updateData.email = normalizedEmail;
    }

    if (phone) {
      // Check if the new phone already exists for another user
      const existingPhone = await prisma.user.findFirst({
        where: {
          phone,
          id: {
            not: id,
          },
        },
      });

      if (existingPhone) {
        customErrorRes({
          res,
          status: 400,
          message: "Phone number already exists",
        });
        return;
      }

      updateData.phone = phone;
    }

    if (organization) updateData.organization = organization;
    if (typeof isActive === "boolean") updateData.isActive = isActive;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    const sanitizedUser = User.sanitizeUser(updatedUser);

    customResponse({
      res,
      status: 200,
      message: "User details updated successfully",
      data: sanitizedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    customErrorRes({
      res,
      status: 500,
      message: "Internal server error",
    });
  }
};
