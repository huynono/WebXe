/*
  Warnings:

  - You are about to drop the column `booking` on the `product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `product` DROP COLUMN `booking`,
    ADD COLUMN `km` VARCHAR(191) NULL;
