-- AddForeignKey
ALTER TABLE `AdminChatMessage` ADD CONSTRAINT `AdminChatMessage_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
