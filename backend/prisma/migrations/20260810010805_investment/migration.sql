/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "InvestmentStatus" AS ENUM ('ACTIVE', 'WITHDRAWN');

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Investment" (
    "id" SERIAL NOT NULL,
    "owner" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "withdrawalDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);
