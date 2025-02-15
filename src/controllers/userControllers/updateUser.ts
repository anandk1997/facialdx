import { Request, Response } from "express";
import bcrypt from "bcrypt";

import { User } from "../../models/user";
import { prisma } from "../../utils/prisma";
import validator from "validator";
import { customErrorRes, customResponse } from "../../utils";

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, password, isActive, organization } = req.body;

    if (!id)
      return customErrorRes({
        res,
        status: 400,
        message: "User ID is required",
      });

    // Validate fields if they are provided
    const minPhoneLength = 4;
    const maxPhoneLength = 15;

    if (phone) {
      if (phone.length < minPhoneLength || phone.length > maxPhoneLength) {
        return customErrorRes({
          res,
          status: 400,
          message: `Phone number must be between ${minPhoneLength} and ${maxPhoneLength} digits`,
        });
      }

      if (!validator.isNumeric(phone)) {
        return customErrorRes({
          res,
          status: 400,
          message: "Phone number must contain only digits",
        });
      }
    }

    if (email && !validator.isEmail(email)) {
      return customErrorRes({
        res,
        status: 400,
        message: "Invalid email format",
      });
    }

    // Check for empty email or phone number
    if (email === "") {
      return customErrorRes({
        res,
        status: 400,
        message: "Email cannot be empty",
      });
    }

    if (phone === "") {
      return customErrorRes({
        res,
        status: 400,
        message: "Phone number cannot be empty",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user)
      return customErrorRes({
        res,
        status: 404,
        message: "User not found",
      });

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
        return customErrorRes({
          res,
          status: 400,
          message: "Email already exists",
        });
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
        return customErrorRes({
          res,
          status: 400,
          message: "Phone number already exists",
        });
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

    return customResponse({
      res,
      status: 200,
      message: "User details updated successfully",
      data: sanitizedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return customErrorRes({
      res,
      status: 500,
      message: "Internal server error",
    });
  }
};
