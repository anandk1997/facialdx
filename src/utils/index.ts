import bcrypt from "bcrypt";
import { prisma } from "./prisma";
import { Response } from "express";
import nodemailer from "nodemailer";

import { env } from "../config/env";

export const seedDatabase = async (
  name: string,
  email: string,
  password: string,
) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.create({
        data: {
          name,
          email: email,
          phone: Date.now()?.toString()?.slice(0, 10),
          password: hashedPassword,
          role: "ADMIN",
          organization: "Default Organization",
          adminID: "admin",
        },
      });

      console.info("Database seeded successfully");
    } else {
      console.info(
        `User with email ${email} already exists. Skipping seeding process.`,
      );
    }
  } catch (error) {
    console.error("Database seeding failed:", error);
  }
};

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: parseInt(env.SMTP_PORT!, 10),
  secure: false,

  auth: {
    user: env.SMTP_EMAIL,
    pass: env.SMTP_PASSWORD,
  },
});

export const sendEmail = async (
  email: string,
  subject: string,
  html: string,
) => {
  try {
    const info = await transporter.sendMail({
      from: env.SMTP_EMAIL,
      to: email,
      subject,
      html,
      attachments: [
        {
          filename: "otp.png",
          path: __dirname + "/otp.png",
          cid: "otp",
        },

        {
          filename: "credentials.png",
          path: __dirname + "/credentials.png",
          cid: "credentials",
        },
      ],
    });

    console.info("Message sent: %s", info.messageId);

    return info;
  } catch (error) {
    console.error("Error occurred while sending email:", error);
    return error;
  }
};

interface IResParams {
  res: Response;
  status: number;
  message: string;
  data: any;
  [key: string]: any;
}

export const customResponse = ({
  res,
  status,
  message,
  data,
  ...extraParams
}: IResParams) =>
  res.status(status).json({ status, message, data, ...extraParams });

interface IErrorParams {
  res: Response;
  status: number;
  message: string;
}

export const customErrorRes = ({ res, status, message }: IErrorParams) =>
  res.status(status).json({ status, message });
