/*
  Warnings:

  - Made the column `quantity` on table `product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `product` MODIFY `quantity` INTEGER NOT NULL;
