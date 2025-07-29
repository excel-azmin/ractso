/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "roles" "UserRole"[] DEFAULT ARRAY['USER']::"UserRole"[],
ALTER COLUMN "clerkId" DROP NOT NULL;
