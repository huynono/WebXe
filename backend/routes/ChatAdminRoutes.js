import express from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import {
  getChatRooms,
  getMessagesByRoom,
  createRoom,
  sendMessage,
  markMessagesAsRead,
  getUserMessages,
} from "../controller/ChatAdminController.js";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = express.Router();

// REST API
router.get("/rooms", getChatRooms);
router.get("/messages/:roomId", getMessagesByRoom);
router.post("/rooms", createRoom);
router.post("/send", sendMessage);
router.put("/mark-read/:conversationId", markMessagesAsRead);

// ✅ route lấy tin nhắn user
router.get("/user/:userId/messages", getUserMessages);

export default router;

// ---- Socket ----

export const initChatSocket = (io) => {
  io.on("connection", async (socket) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        socket.disconnect();
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const isAdmin = decoded.email === process.env.ADMIN_EMAIL;

      socket.user = { ...decoded, role: isAdmin ? "admin" : "user" };

      // =========================
      // User tự tạo/join room
      // =========================
      if (!isAdmin) {
        let room = await prisma.adminChatRoom.findUnique({
          where: { userId: socket.user.id },
        });

        if (!room) {
          room = await prisma.adminChatRoom.create({
            data: { userId: socket.user.id },
          });
        }

        socket.join(`chat_${room.id}`);
        socket.data.roomId = room.id;
      }

      // =========================
      // Admin join room khi click user
      // =========================
      socket.on("sendMessage", async ({ content, roomId }) => {
        console.log("✉️ sendMessage event:", {
          content,
          roomId,
          socketUser: socket.user,
        });

        try {
          const targetRoomId = roomId || socket.data.roomId;
          if (!targetRoomId) {
            return;
          }

          const room = await prisma.adminChatRoom.findUnique({
            where: { id: targetRoomId },
          });
          if (!room) {
            return;
          }

          const message = await prisma.adminChatMessage.create({
            data: {
              content,
              role: socket.user.role, // "user" hoặc "admin"
              isRead: false,
              room: { connect: { id: room.id } },
              user: {
                connect: {
                  id:
                    socket.user.role === "user" ? socket.user.id : room.userId,
                },
              },
              ...(socket.user.role === "admin"
                ? { adminId: socket.user.id }
                : {}),
            },
          });

          const messageData = {
            id: message.id,
            roomId: message.roomId,
            content: message.content,
            role: message.role,
            from: {
              id: socket.user.role === "admin" ? 1 : socket.user.id,
              name:
                socket.user.role === "admin"
                  ? "Admin"
                  : socket.user.name || "User",
              email: socket.user.email,
              role: socket.user.role,
            },
          };

          // 🔥 Gửi cho tất cả trong room (user + admin đã join)
          io.in(`chat_${room.id}`).emit("newMessage", messageData);

          // 🔥 Nếu người gửi là user thì bắn thêm cho tất cả admin
          if (socket.user.role === "user") {
            io.sockets.sockets.forEach((s) => {
              if (s.user?.role === "admin") {
                s.emit("newMessage", messageData);
              }
            });
          }
        } catch (err) {}
      });

      // =========================
      // Disconnect
      // =========================
      socket.on("disconnect", () => {
        console.log(
          `❌ User disconnected: ${socket.user?.id} (${socket.user?.role})`
        );
      });
    } catch (err) {
      console.error("❌ Xác thực thất bại:", err.message);
      socket.disconnect();
    }
  });
};
