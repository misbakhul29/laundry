/*
  Warnings:

  - You are about to drop the column `providerId` on the `Order` table. All the data in the column will be lost.
  - Added the required column `shopId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_providerId_fkey";

-- DropIndex
DROP INDEX "Order_providerId_idx";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "providerId",
ADD COLUMN     "shopId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Order_shopId_idx" ON "Order"("shopId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
