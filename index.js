import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';

// Import routes
import userRoutes from './backend/routes/UserRoutes.js';
import CategoryRoutes from './backend/routes/CategoryRoutes.js';
import ProductRoutes from './backend/routes/ProductRoutes.js';
import AdminRoutes from './backend/routes/AdminRoutes.js';
import Telegram from './backend/routes/TelegramRoutes.js';
import CartRoutes from './backend/routes/CartRoutes.js';
import VoucherRoutes from './backend/routes/VoucherRoutes.js';
import PaymentRoutes, { initSocket as initPaymentSocket } from './backend/routes/PaymentRoutes.js';
import ReviewRoutes from './backend/routes/ReviewRoutes.js';
import DashboardRoutes from './backend/routes/DashboardRoutes.js';
import ChatAIRoutes from './backend/routes/ChatAIRoutes.js';
import ChatAdminRoutes, { initChatSocket } from "./backend/routes/ChatAdminRoutes.js";

// __dirname setup cho ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// API routes
app.use('/api/category', CategoryRoutes);
app.use('/api/user', userRoutes);
app.use('/api/product', ProductRoutes);
app.use('/api/admin', AdminRoutes);
app.use("/api/telegram", Telegram);
app.use("/api/cart", CartRoutes);
app.use("/api/voucher", VoucherRoutes);
app.use("/api/payment", PaymentRoutes);
app.use("/api/review", ReviewRoutes);
app.use("/api/dashboard", DashboardRoutes);
app.use("/api/chatai", ChatAIRoutes);
app.use("/api/chatadmin", ChatAdminRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Lỗi server',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// ⚡ Tạo HTTP server và Socket.io server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// init chat + payment socket
initChatSocket(io);
initPaymentSocket(io);

// Socket.io order room (ví dụ cho payment)
io.on("connection", (socket) => {
  console.log("🔥 User connected:", socket.id);

  socket.on("joinOrderRoom", (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`User ${socket.id} joined order_${orderId}`);
  });

  socket.on("leaveOrderRoom", (orderId) => {
    socket.leave(`order_${orderId}`);
    console.log(`User ${socket.id} left order_${orderId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});
