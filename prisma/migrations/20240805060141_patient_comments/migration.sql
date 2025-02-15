/*
  Warnings:

  - You are about to drop the column `admin_comment` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `user_comment` on the `Patient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "admin_comment",
DROP COLUMN "user_comment",
ADD COLUMN     "dark_circle_comment" TEXT,
ADD COLUMN     "mouth_alignment_comment" TEXT,
ADD COLUMN     "nose_shape_comment" TEXT,
ADD COLUMN     "nostril_comment" TEXT,
ADD COLUMN     "pupil_alignment_comment" TEXT,
ADD COLUMN     "pupil_comparison_comment" TEXT;
