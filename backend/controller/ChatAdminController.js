import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Transform message data để phù hợp với frontend Message type
const transformMessage = (dbMessage) => ({
  id: dbMessage.id,
  roomId: dbMessage.roomId,
  content: dbMessage.content,
  role: dbMessage.role,
  from: {
    id: dbMessage.user.id,
    name: dbMessage.user.name,
    email: dbMessage.user.email,
    role: dbMessage.role
  }
});

// Lấy tất cả phòng chat (dành cho admin)
export const getChatRooms = async (req, res) => {
  try {
    const rooms = await prisma.adminChatRoom.findMany({
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi lấy phòng chat" });
  }
};

// Lấy tin nhắn theo room
export const getMessagesByRoom = async (req, res) => {
  const { roomId } = req.params;
  try {
    const messages = await prisma.adminChatMessage.findMany({
      where: { roomId: Number(roomId) },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    // Transform messages để phù hợp với frontend Message type
    const transformedMessages = messages.map(transformMessage);
    res.json(transformedMessages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi lấy tin nhắn" });
  }
};

// Tạo phòng mới (nếu user chưa có)
export const createRoom = async (req, res) => {
  const { userId } = req.body;
  try {
    const room = await prisma.adminChatRoom.upsert({
      where: { userId },
      update: {},      // không update gì nếu đã tồn tại
      create: { userId }, // tạo mới nếu chưa có
    });
    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi tạo phòng" });
  }
};

export const sendMessage = async (req, res) => {
  const { conversationId, userId, message, senderType } = req.body;

  if (!conversationId || !userId || !message || !senderType) {
    return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });
  }

  try {
    // Tạo message mới
    const newMessage = await prisma.adminChatMessage.create({
      data: {
        roomId: Number(conversationId),
        userId,
        content: message,
        role: senderType, // 'admin' hoặc 'user'
        isRead: false
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.json({ success: true, message: newMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi gửi tin nhắn" });
  }
};

// Đánh dấu tin nhắn đã đọc
export const markMessagesAsRead = async (req, res) => {
  const { conversationId } = req.params;
  try {
    await prisma.adminChatMessage.updateMany({
      where: { roomId: Number(conversationId), isRead: false },
      data: { isRead: true },
    });

    res.json({ success: true, message: "Đã đánh dấu tin nhắn là đã đọc" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi đánh dấu tin nhắn" });
  }
};

// Lấy tin nhắn cho user (ChatWidget)
export const getUserMessages = async (req, res) => {
  const { userId } = req.params;

  try {
    // Dùng findFirst thay vì findUnique
    const room = await prisma.adminChatRoom.findFirst({
      where: { userId: Number(userId) },
    });

    if (!room) return res.json({ success: true, messages: [] });

    const messages = await prisma.adminChatMessage.findMany({
      where: { roomId: room.id },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    const transformedMessages = messages.map((msg) => ({
      id: msg.id,
      roomId: msg.roomId,
      content: msg.content,
      role: msg.role || "user",
      from: {
        id: msg.user?.id || 0,
        name: msg.user?.name || "User",
        email: msg.user?.email,
        role: msg.role || "user",
      },
    }));

    res.json({ success: true, messages: transformedMessages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi lấy tin nhắn" });
  }
};
