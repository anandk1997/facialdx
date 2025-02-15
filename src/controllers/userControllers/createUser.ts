import validator from "validator";
import bcrypt from "bcrypt";

import { User } from "../../models/user";
import { prisma } from "../../utils/prisma";
import { Request, Response, RequestHandler } from "express";
import { customErrorRes, customResponse, sendEmail } from "../../utils";

export const createUser: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id, name, email, phone, password, confirmPassword, organization } =
      req.body;

    // Required field validation
    const requiredFields = {
      id,
      name,
      email,
      phone,
      password,
      confirmPassword,
      organization,
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

    if (password !== confirmPassword) {
      customErrorRes({
        res,
        status: 400,
        message: "Passwords do not match",
      });
      return;
    }

    // Convert email to lowercase
    const normalizedEmail = email.toLowerCase();

    // Validate email format
    if (!validator.isEmail(normalizedEmail)) {
      customErrorRes({
        res,
        status: 400,
        message: "Invalid email format",
      });
      return;
    }

    // Validate phone number length and format
    const minPhoneLength = 4;
    const maxPhoneLength = 15;

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

    const [existingEmail, existingPhone] = await Promise.all([
      prisma.user.findUnique({ where: { email: normalizedEmail } }),
      prisma.user.findUnique({ where: { phone } }),
    ]);

    if (existingEmail) {
      customErrorRes({
        res,
        status: 400,
        message: "Email already exists",
      });
      return;
    }

    if (existingPhone) {
      customErrorRes({
        res,
        status: 400,
        message: "Phone number already exists",
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        phone,
        password: hashedPassword,
        organization,
        adminID: id,
      },
    });

    sendEmail(
      normalizedEmail,
      userEmail.subject,
      userEmail.html(normalizedEmail, password),
    );

    customResponse({
      res,
      status: 201,
      message: "User created successfully",
      data: User.sanitizeUser(user),
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

const userEmail = Object.freeze({
  subject: "Welcome to FacialDX - Your Account Credentials",

  html: (email: string, password: string) => `
    <main>
      <div
        style="
          margin: 0;
          background: #ffffff;
          border-radius: 30px;
          text-align: center;
        "
      >
        <div style="width: 100%; max-width: 489px; margin: 0 auto">
          <h1><span style="color: #218bec">FACIAL</span>DX</h1>

          <img src="cid:credentials" style="max-width: 489px" alt="FACIALDX" />

          <img src="cid:otp" style="display: none" alt="" />

          <h2
            style="
              margin-top: 20px;
              font-size: 24px;
              font-weight: 600;
              color: #1f1f1f;
            "
          >
            Welcome to FacialDX
          </h2>
          <p style="font-size: 16px; font-weight: 500">Dear User,</p>

          <p style="font-weight: 500; letter-spacing: 0.56px">
            Welcome to FacialDX! We are excited to have you on board. Here are
            your account credentials:
          </p>

          <div
            style="
              background: black;
              color: white;
              /* display: flex;
              flex-direction: column;
              justify-content: center;
              gap: 10px;
              margin: auto; */
              padding: 40px 100px;
            "
          >
            <div style="display: flex">
              <label for="">Email:</label>
              <span
                style="margin-left: 20px; color: white; text-decoration: none"
                >${email}</span
              >
            </div>

            <div style="display: flex">
              <label for="">Pass:</label>
              <span style="margin-left: 28px">${password}</span>
            </div>
          </div>

          <p style="font-size: 16px; font-weight: 500; margin-top: 25px">
            Please keep this information secure and do not share it with anyone.
          </p>

          <p
            style="
              font-size: 16px;
              font-weight: 500;
              margin-top: 25px;
              margin-bottom: 2px;
            "
          >
            Thank you,
          </p>

          <p style="font-size: 16px; font-weight: 500; margin-top: 0">
            FacialDX Team
          </p>
        </div>
      </div>
    </main>
`,
});
