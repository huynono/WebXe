/*
  Warnings:

  - You are about to drop the column `bookingLink` on the `product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `product` DROP COLUMN `bookingLink`,
    ADD COLUMN `booking` DATETIME(3) NULL;
