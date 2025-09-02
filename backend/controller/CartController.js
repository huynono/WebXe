const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

// 1️⃣ Xem giỏ hàng
exports.getCart = async (req, res) => {
  try {
    // 🔹 Xác thực token từ header
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "Bạn phải đăng nhập" });

    const token = authHeader.split(" ")[1]; // Bearer <token>
    if (!token) return res.status(401).json({ message: "Token không tồn tại" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: "Token đã hết hạn" });
      } else if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: "Token không hợp lệ" });
      } else {
        return res
          .status(500)
          .json({ message: "Lỗi server khi xác thực token" });
      }
    }

    const userId = decoded.id;

    // 🔹 Lấy giỏ hàng của user
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
            color: true,
          },
        },
      },
    });

    if (!cart)
      return res
        .status(404)
        .json({ message: "Giỏ hàng trống hoặc không tồn tại" });

    res.json({
      message: "✅ Lấy giỏ hàng thành công",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    //  Xác thực token từ header
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "Bạn phải đăng nhập" });

    const token = authHeader.split(" ")[1]; // Bearer <token>
    if (!token) return res.status(401).json({ message: "Token không tồn tại" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: "Token đã hết hạn" });
      } else if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: "Token không hợp lệ" });
      } else {
        return res
          .status(500)
          .json({ message: "Lỗi server khi xác thực token" });
      }
    }

    const userId = decoded.id;

    // Lấy dữ liệu sản phẩm từ body
    const { productId, quantity = 1, colorId } = req.body;
    if (!productId) return res.status(400).json({ message: "Thiếu productId" });

    //  Kiểm tra sản phẩm có tồn tại
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product)
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    if (quantity > product.quantity) {
      return res
        .status(400)
        .json({ message: `Số lượng tối đa là ${product.quantity}` });
    }

    // Lấy hoặc tạo cart cho user
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    //  Kiểm tra xem sản phẩm đã có trong cart chưa (cùng colorId)
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId, colorId: colorId || null },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.quantity) {
        return res
          .status(400)
          .json({
            message: `Tổng số lượng trong giỏ hàng không vượt quá ${product.quantity}`,
          });
      }

      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });

      return res.json({
        message: "✅ Cập nhật sản phẩm trong giỏ hàng thành công",
        item: updatedItem,
      });
    }

    //  Thêm sản phẩm mới vào cart
    const newItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        price: product.price,
        colorId: colorId || null,
      },
    });

    res.status(201).json({
      message: "✅ Thêm sản phẩm vào giỏ hàng thành công",
      item: newItem,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// 3️⃣ Cập nhật số lượng sản phẩm trong giỏ hàng
exports.updateCartItem = async (req, res) => {
  try {
    // Xác thực token từ header
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "Bạn phải đăng nhập" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token không tồn tại" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: "Token đã hết hạn" });
      } else if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: "Token không hợp lệ" });
      } else {
        return res
          .status(500)
          .json({ message: "Lỗi server khi xác thực token" });
      }
    }

    const userId = decoded.id;
    const { cartItemId, quantity } = req.body;

    if (!cartItemId || !quantity) {
      return res
        .status(400)
        .json({ message: "Thiếu cartItemId hoặc quantity" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: "Số lượng phải lớn hơn 0" });
    }

    // Kiểm tra cartItem có thuộc về user không
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { product: true, cart: true },
    });

    if (!cartItem) {
      return res
        .status(404)
        .json({ message: "Sản phẩm trong giỏ hàng không tồn tại" });
    }

    if (cartItem.cart.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền cập nhật sản phẩm này" });
    }

    // Kiểm tra tồn kho
    if (quantity > cartItem.product.quantity) {
      return res
        .status(400)
        .json({ message: `Số lượng tối đa là ${cartItem.product.quantity}` });
    }

    // Cập nhật số lượng
    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    res.json({
      message: "✅ Cập nhật số lượng sản phẩm thành công",
      item: updatedItem,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.deleteCartItem = async (req, res) => {
  try {
    const { cartItemId } = req.params;

    await prisma.cartItem.delete({
      where: { id: Number(cartItemId) },
    });

    return res.json({ success: true, message: "Xóa thành công" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
