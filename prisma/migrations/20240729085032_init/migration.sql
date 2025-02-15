-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "Patient" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "user_comment" TEXT,
    "admin_comment" TEXT,
    "image_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prediction" (
    "image_id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "input_image" BYTEA NOT NULL,
    "dark_circle" JSONB NOT NULL,
    "dark_circle_output" BYTEA,
    "pupil_comparison" JSONB,
    "pupil_comparison_output" BYTEA,
    "nose_shape" JSONB,
    "nose_shape_output" BYTEA,
    "nostril" JSONB,
    "nostril_output" BYTEA,
    "mouth_alignment" JSONB,
    "mouth_alignment_output" BYTEA,
    "pupil_alignment" JSONB,
    "pupil_alignment_output" BYTEA,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prediction_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "organization" TEXT NOT NULL,
    "adminID" TEXT NOT NULL,
    "firebaseToken" TEXT,
    "deviceDetails" TEXT,
    "deviceOS" TEXT,
    "appVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_image_id_key" ON "Patient"("image_id");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_user_id_image_id_key" ON "Patient"("user_id", "image_id");

-- CreateIndex
CREATE UNIQUE INDEX "prediction_user_id_image_id_key" ON "prediction"("user_id", "image_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
