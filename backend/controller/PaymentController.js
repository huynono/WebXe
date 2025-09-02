import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// ================== SOCKET ==================
export let io;
export const initSocket = (ioInstance) => {
  io = ioInstance;
};

// ================== CONFIG BANK ==================
const BANK_ACCOUNT_NO = "0365515124";
const BANK_BIN = "970417";
const BANK_NAME = "MB Bank";
const ACCOUNT_NAME = "NGUYEN DINH HOANG HUY";

// ================== HELPER ==================
async function decrementVoucher(voucherId) {
  const voucher = await prisma.voucher.findUnique({ where: { id: voucherId } });
  if (!voucher) return;

  if (voucher.usageLimit && voucher.usageLimit > 0) {
    const newUsage = voucher.usageLimit - 1;

    if (newUsage === 0) {
      await prisma.voucher.delete({ where: { id: voucherId } });
    } else {
      await prisma.voucher.update({
        where: { id: voucherId },
        data: { usageLimit: newUsage },
      });
    }
  }
}

// ================== CREATE ORDER ==================
export const createOrder = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Bạn cần đăng nhập" });

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId || decoded.id;
    } catch (err) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    if (!userId)
      return res.status(401).json({ message: "Token không có userId" });

    const {
      paymentMethod,
      voucherId,
      totalAmount,
      items = [],
      address,
    } = req.body;

    let cartItems = items;
    let cart = null;

    if (!cartItems || cartItems.length === 0) {
      cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
      });

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Giỏ hàng trống" });
      }

      cartItems = cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
        colorId:
          item.colorId !== undefined && item.colorId !== null
            ? Number(item.colorId)
            : null,
      }));
    }

    const orderItemsData = cartItems.map((item) => {
      const orderItem = {
        product: { connect: { id: item.productId } },
        quantity: item.quantity,
        price: item.price,
      };

      if (
        item.colorId !== null &&
        item.colorId !== undefined &&
        !isNaN(item.colorId)
      ) {
        orderItem.color = { connect: { id: Number(item.colorId) } };
      }

      return orderItem;
    });

    const orderData = {
      user: { connect: { id: userId } },
      totalAmount,
      paymentMethod,
      status: "pending",
      paymentStatus: "unpaid",
      address,
      items: { create: orderItemsData },
    };

    if (voucherId) orderData.voucher = { connect: { id: voucherId } };

    const order = await prisma.order.create({
      data: orderData,
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, image: true } },
            color: { select: { id: true, name: true } },
          },
        },
      },
    });

    // Trừ số lượng sản phẩm
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.product.id },
        data: { quantity: { decrement: item.quantity } },
      });
    }

    // Xóa cart items
    if (cart && cartItems.length > 0) {
      const productIdsToDelete = cartItems.map((item) => item.productId);
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id, productId: { in: productIdsToDelete } },
      });
    }

    if (voucherId) await decrementVoucher(voucherId);

    if (io) io.emit("orderCreated", order);

    if (paymentMethod === "COD") {
      return res.json({
        order,
        message: "Đơn hàng COD đã được tạo thành công",
      });
    }

    if (paymentMethod === "BANK") {
      const addInfo = encodeURIComponent(`Thanh toan don hang ${order.id}`);
      const accountNameEncoded = encodeURIComponent(ACCOUNT_NAME);
      const amountInt = Math.round(Number(totalAmount));

      const qrUrl = `https://img.vietqr.io/image/${BANK_BIN}-${BANK_ACCOUNT_NO}-compact.png?amount=${amountInt}&addInfo=${addInfo}&accountName=${accountNameEncoded}`;

      return res.json({
        order,
        bankInfo: {
          bankName: BANK_NAME,
          accountNo: BANK_ACCOUNT_NO,
          accountName: ACCOUNT_NAME,
        },
        qrCodeUrl: qrUrl,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi tạo đơn hàng", error: error.message });
  }
};

// ================== GET ORDERS ==================
export const getAllOrders = async (req, res) => {
  try {
    const { status, paymentStatus, userId } = req.query;

    const orders = await prisma.order.findMany({
      where: {
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
        userId: userId ? Number(userId) : undefined,
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, image: true } },
            color: { select: { id: true, name: true } },
          },
        },
        voucher: {
          select: {
            id: true,
            code: true,
            description: true,
            discountType: true,
            discountValue: true,
            maxDiscount: true,
            minOrderValue: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    res.json({ orders });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Lỗi khi lấy danh sách đơn hàng",
        error: error.message,
      });
  }
};

// ================== UPDATE ORDER ==================
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: { status, paymentStatus },
      include: { items: { include: { product: true } } },
    });

    if (io) io.emit("updateOrder", updatedOrder);

    res
      .status(200)
      .json({
        message: "✅ Cập nhật trạng thái thành công",
        order: updatedOrder,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "❌ Lỗi server khi cập nhật đơn hàng",
        error: error.message,
      });
  }
};

// ================== DELETE ORDER ==================
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm đơn hàng và items liên quan
    const existingOrder = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { items: true },
    });

    if (!existingOrder) {
      return res.status(404).json({ message: "❌ Đơn hàng không tồn tại" });
    }

    // Trả số lượng về lại
    for (const item of existingOrder.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { quantity: { increment: item.quantity } },
      });
    }

    // Xóa items trước
    await prisma.orderItem.deleteMany({ where: { orderId: Number(id) } });

    // Xóa đơn chính
    const deletedOrder = await prisma.order.delete({
      where: { id: Number(id) },
    });

    if (io) io.emit("deleteOrder", { orderId: Number(id) });

    return res.status(200).json({
      message: "✅ Xóa đơn hàng thành công và đã hoàn lại số lượng sản phẩm",
      deletedOrder,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "❌ Lỗi server khi xóa đơn hàng",
        error: error.message,
      });
  }
};

// ================== GET USER ORDERS ==================
export const getUserOrders = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Bạn cần đăng nhập" });

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId || decoded.id;
    } catch (err) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    if (!userId)
      return res.status(401).json({ message: "Token không có userId" });

    const orders = await prisma.order.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, image: true } },
            color: { select: { id: true, name: true } },
          },
        },
        voucher: {
          select: {
            id: true,
            code: true,
            discountType: true,
            discountValue: true,
            maxDiscount: true,
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    const formattedOrders = orders.map((order) => {
      const itemCount = order.items.reduce(
        (sum, item) => sum + (item.quantity ?? 0),
        0
      );

      const formatted = {
        ...order,
        itemCount,
        firstItemName: order.items[0]?.product?.name || "",
        firstItemImage: order.items[0]?.product?.image || "",
      };

      console.log("🛒 Order formatted:", {
        id: order.id,
        itemCount,
        items: order.items.map((i) => ({
          product: i.product?.name,
          quantity: i.quantity,
        })),
      });

      return formatted;
    });

    res.json({ orders: formattedOrders });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi server khi lấy đơn hàng", error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    // Lấy token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Bạn cần đăng nhập" });

    // Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id;

    // Lấy orderId từ params
    const orderId = parseInt(req.params.id, 10);
    if (isNaN(orderId)) {
      return res.status(400).json({ message: "ID đơn hàng không hợp lệ" });
    }

    // Query order
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, image: true },
            },
            color: {
              select: { id: true, name: true },
            },
          },
        },
        voucher: {
          select: {
            id: true,
            code: true,
            discountType: true,
            discountValue: true,
            maxDiscount: true,
          },
        },
        user: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Trả về kết quả
    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
