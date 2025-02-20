import { z } from "zod";

const emailSchema = z
  .string({ required_error: "Email is required" })
  .email("Invalid email format");

const passwordSchema = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
  );

const nameSchema = z
  .string({ required_error: "Name is required" })
  .min(2, "Name must be at least 2 characters");

export const registerSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
    name: nameSchema,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z
      .string({ required_error: "Password is required" })
      .min(1, "Password is required"),
  }),
});
