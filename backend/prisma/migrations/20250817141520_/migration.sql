-- AlterTable
ALTER TABLE `product` MODIFY `quantity` INTEGER NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `provider` VARCHAR(191) NULL;
