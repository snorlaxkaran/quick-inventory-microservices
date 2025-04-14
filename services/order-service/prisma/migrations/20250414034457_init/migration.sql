-- CreateEnum
CREATE TYPE "Status" AS ENUM ('pending', 'success', 'failed');

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "items" JSONB NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
