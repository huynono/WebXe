/*
  Warnings:

  - You are about to drop the column `senderId` on the `adminchatmessage` table. All the data in the column will be lost.
  - You are about to drop the column `senderRole` on the `adminchatmessage` table. All the data in the column will be lost.
  - You are about to drop the `chatroom` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `role` to the `AdminChatMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `AdminChatMessage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `adminchatmessage` DROP FOREIGN KEY `AdminChatMessage_roomId_fkey`;

-- DropIndex
DROP INDEX `AdminChatMessage_roomId_fkey` ON `adminchatmessage`;

-- AlterTable
ALTER TABLE `adminchatmessage` DROP COLUMN `senderId`,
    DROP COLUMN `senderRole`,
    ADD COLUMN `role` VARCHAR(191) NOT NULL,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `chatroom`;

-- CreateTable
CREATE TABLE `AdminChatRoom` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AdminChatRoom_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AdminChatMessage` ADD CONSTRAINT `AdminChatMessage_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `AdminChatRoom`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
