const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");

// 📌 Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.createReview = async (req, res) => {
  try {
    // 📌 Lấy token từ header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "❌ Bạn cần đăng nhập" });
    }

    // 📌 Decode token để lấy userId
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId || decoded.id;
    } catch (err) {
      return res.status(401).json({ message: "❌ Token không hợp lệ" });
    }

    if (!userId) {
      return res.status(401).json({ message: "❌ Không xác thực được user" });
    }

    const { productId, orderId, rating, comment } = req.body;

    // 📌 Kiểm tra bắt buộc
    if (!productId || !orderId || !rating) {
      return res.status(400).json({ message: "❌ Thiếu thông tin review" });
    }

    // 📌 Lấy danh sách ảnh từ Cloudinary (multer-cloudinary đã upload xong)
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map((file) => file.path); // Cloudinary trả về `path`
    }

    // 📌 Tạo review trong DB
    const newReview = await prisma.review.create({
      data: {
        userId: Number(userId),
        productId: Number(productId),
        orderId: Number(orderId),
        rating: Number(rating),
        comment: comment || null,
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
      },
      include: {
        images: true,
        user: { select: { id: true, name: true } },
      },
    });

    return res.status(201).json({
      message: "✅ Review thành công",
      review: newReview,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "❌ Lỗi server", error: error.message });
  }
};

exports.getReviewsByProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: Number(productId), isVisible: true },
      include: {
        user: { select: { id: true, name: true } },
        images: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      message: "✅ Lấy review thành công",
      total: reviews.length,
      reviews,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
};

exports.updateReview = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  try {
    // 🔑 Lấy token từ header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "❌ Thiếu token" });
    }

    // 🔑 Giải mã token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "❌ Token không hợp lệ" });
    }

    const userId = decoded.id; // lấy id từ payload

    // 🔍 Tìm review
    const review = await prisma.review.findUnique({
      where: { id: Number(id) },
      include: { images: true },
    });

    if (!review) {
      return res.status(404).json({ message: "❌ Review không tồn tại" });
    }

    // 🚫 Kiểm tra quyền sở hữu
    if (review.userId !== userId) {
      return res
        .status(403)
        .json({ message: "❌ Bạn không được sửa review này" });
    }

    // 📸 Xử lý ảnh mới
    let newImages = [];
    if (req.files?.length > 0) {
      newImages = req.files.map((file) => file.path);

      // Xóa ảnh cũ
      await prisma.reviewImage.deleteMany({ where: { reviewId: review.id } });
    }

    // ✏️ Cập nhật review
    const updated = await prisma.review.update({
      where: { id: Number(id) },
      data: {
        rating: rating !== undefined ? Number(rating) : review.rating,
        comment: comment ?? review.comment,
        isEdited: true,
        ...(newImages.length > 0 && {
          images: { create: newImages.map((url) => ({ url })) },
        }),
      },
      include: { images: true },
    });

    return res.status(200).json({
      message: "✅ Cập nhật review thành công",
      review: updated,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
};

// Xóa review với quyền ADMIN
exports.adminDeleteReview = async (req, res) => {
  const { id } = req.params;

  try {
    const review = await prisma.review.findUnique({
      where: { id: Number(id) },
      include: { images: true },
    });

    if (!review) {
      return res.status(404).json({ message: "❌ Review không tồn tại" });
    }

    // Nếu có ảnh trong review thì xóa trước
    await prisma.reviewImage.deleteMany({
      where: { reviewId: review.id },
    });

    // Xóa review hẳn
    await prisma.review.delete({
      where: { id: review.id },
    });

    return res
      .status(200)
      .json({ message: "✅ Admin đã xóa review thành công" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
};

exports.deleteReviewByUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "❌ Thiếu token" });
    }
    const token = authHeader.split(" ")[1];

    // Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.userId;

    const review = await prisma.review.findUnique({
      where: { id: Number(id) },
      include: { images: true },
    });

    if (!review) {
      return res.status(404).json({ message: "❌ Review không tồn tại" });
    }

    if (review.userId !== Number(userId)) {
      return res
        .status(403)
        .json({ message: "❌ Bạn không được xóa review này" });
    }

    // Xoá ảnh review trước
    await prisma.reviewImage.deleteMany({
      where: { reviewId: review.id },
    });

    // Xoá review
    await prisma.review.delete({
      where: { id: review.id },
    });

    return res.status(200).json({ message: "✅ Review đã được xóa hoàn toàn" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "❌ Lỗi server", error: error.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { isVisible: true },
        include: {
          user: { select: { id: true, name: true } },
          product: { select: { id: true, name: true, image: true } }, // ✅ lấy tên sp
          images: { select: { id: true, url: true } }, // ✅ lấy url ảnh
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { isVisible: true } }),
    ]);

    return res.status(200).json({
      message: "✅ Lấy tất cả review thành công",
      total,
      page,
      totalPages: Math.ceil(total / limit),
      reviews,
    });
  } catch (error) {
    return res.status(500).json({
      message: "❌ Lỗi server",
      error: error.message,
    });
  }
};
