-- AddForeignKey
ALTER TABLE `AdminChatRoom` ADD CONSTRAINT `AdminChatRoom_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
