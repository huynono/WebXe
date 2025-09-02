const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;
const cron = require('node-cron');
const prisma = new PrismaClient();

// Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ================== CRON JOBS ==================

// ⏰ 0h00 hàng ngày: vô hiệu hóa voucher hết hạn
cron.schedule("0 0 * * *", async () => {
  const now = new Date();
  console.log("⏰ Cronjob chạy: kiểm tra voucher hết hạn...");

  try {
    const result = await prisma.voucher.updateMany({
      where: {
        endDate: { lt: now },
        isActive: true,
      },
      data: { isActive: false },
    });

    if (result.count > 0) {
      console.log(`✅ ${result.count} voucher đã được vô hiệu hóa.`);
    }
  } catch (error) {
    console.error("❌ Lỗi khi chạy cron job:", error);
  }
});

// ⏰ Ngày 1 hàng tháng: reset usageLimit (ví dụ đặt lại 100)
cron.schedule("0 0 1 * *", async () => {
  console.log("⏰ Cronjob chạy: reset usageLimit...");
  try {
    await prisma.voucher.updateMany({
      data: { usageLimit: 100 },
    });
    console.log("✅ Reset usageLimit thành công");
  } catch (error) {
    console.error("❌ Lỗi reset usageLimit:", error);
  }
});

// ================== CRUD VOUCHER ==================

// CREATE
exports.createVoucher = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minOrderValue,
      startDate,
      endDate,
      usageLimit,
      isActive,
    } = req.body;

    if (!code || !discountType || !startDate || !endDate) {
      return res.status(400).json({ message: "❌ Thiếu trường bắt buộc" });
    }

    let imageUrl = null;
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "vouchers",
      });
      imageUrl = uploadResult.secure_url;
    }

    const voucherData = {
      code: code.trim().toUpperCase(),
      description,
      image: imageUrl,
      discountType,
      discountValue: discountValue ? Number(discountValue) : null,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      minOrderValue: minOrderValue ? Number(minOrderValue) : null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      usageLimit: usageLimit ? Number(usageLimit) : null,
      isActive: isActive === "true" || isActive === true,
    };

    const newVoucher = await prisma.voucher.create({ data: voucherData });

    res.status(201).json({
      message: "✅ Tạo voucher thành công",
      voucher: newVoucher,
    });
  } catch (error) {
    console.error("❌ Error in createVoucher:", error);
    if (error.code === "P2002") {
      return res.status(400).json({
        message: `❌ Mã code "${req.body?.code}" đã tồn tại!`,
      });
    }
    res.status(500).json({ message: "❌ Lỗi server", error: error.message });
  }
};

// GET ALL
exports.getAllVouchers = async (req, res) => {
  try {
    const vouchers = await prisma.voucher.findMany({
      orderBy: { id: 'asc' },
    });

    res.status(200).json({
      message: '✅ Lấy danh sách voucher thành công',
      total: vouchers.length,
      vouchers,
    });
  } catch (error) {
    console.error("❌ Error in getAllVouchers:", error);
    res.status(500).json({ message: "❌ Lỗi server", error: error.message });
  }
};

// UPDATE
exports.updateVoucher = async (req, res) => {
  const { id } = req.params;
  const {
    code,
    description,
    discountType,
    discountValue,
    maxDiscount,
    minOrderValue,
    startDate,
    endDate,
    usageLimit,
    isActive,
  } = req.body;

  try {
    let imageUrl = undefined;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "vouchers",
        resource_type: "image",
      });
      imageUrl = uploadResult.secure_url;
    }

    const updatedVoucher = await prisma.voucher.update({
      where: { id: Number(id) },
      data: {
        ...(code && { code: code.trim().toUpperCase() }),
        ...(description && { description }),
        ...(discountType && { discountType }),
        ...(discountValue && { discountValue: Number(discountValue) }),
        ...(maxDiscount && { maxDiscount: Number(maxDiscount) }),
        ...(minOrderValue && { minOrderValue: Number(minOrderValue) }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(usageLimit && { usageLimit: Number(usageLimit) }),
        ...(isActive !== undefined && {
          isActive: isActive === "true" || isActive === true,
        }),
        ...(imageUrl && { image: imageUrl }),
      },
    });

    res.status(200).json({
      message: "✅ Cập nhật voucher thành công",
      voucher: updatedVoucher,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: `❌ Mã code đã tồn tại!` });
    }
    console.error("❌ Error in updateVoucher:", error);
    res.status(500).json({ message: "❌ Lỗi server", error: error.message });
  }
};

// DELETE
exports.deleteVoucher = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.voucher.delete({
      where: { id: Number(id) },
    });
    res.status(200).json({ message: "✅ Xóa voucher thành công" });
  } catch (error) {
    console.error("❌ Error in deleteVoucher:", error);
    res.status(500).json({ message: "❌ Lỗi server", error: error.message });
  }
};

// UPDATE STATUS
exports.updateVoucherStatus = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  try {
    if (isActive === undefined) {
      return res.status(400).json({ message: "❌ Thiếu trạng thái isActive" });
    }

    const updatedVoucher = await prisma.voucher.update({
      where: { id: Number(id) },
      data: { isActive: isActive === 'true' || isActive === true },
    });

    res.status(200).json({
      message: "✅ Cập nhật trạng thái voucher thành công",
      voucher: updatedVoucher,
    });
  } catch (error) {
    console.error("❌ Error in updateVoucherStatus:", error);
    res.status(500).json({ message: "❌ Lỗi server", error: error.message });
  }
};

// APPLY VOUCHER
exports.applyVoucher = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code || !orderTotal) {
      return res.status(400).json({ message: "❌ Thiếu mã voucher hoặc tổng đơn hàng" });
    }

    const voucher = await prisma.voucher.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!voucher) {
      return res.status(404).json({ message: "❌ Voucher không tồn tại" });
    }

    const now = new Date();

    if (!voucher.isActive) {
      return res.status(400).json({ message: "❌ Voucher đã bị vô hiệu hóa" });
    }

    if (voucher.startDate > now || voucher.endDate < now) {
      return res.status(400).json({ message: "❌ Voucher đã hết hạn hoặc chưa bắt đầu" });
    }

    if (voucher.usageLimit !== null && voucher.usageLimit <= 0) {
      return res.status(400).json({ message: "❌ Voucher đã hết lượt sử dụng" });
    }

    if (voucher.minOrderValue && orderTotal < voucher.minOrderValue) {
      return res.status(400).json({
        message: `❌ Đơn hàng cần tối thiểu ${voucher.minOrderValue} để áp dụng voucher "${voucher.code}"`,
      });
    }

    let discountAmount = 0;
    const discountType = (voucher.discountType || "").toUpperCase();

    switch (discountType) {
      case "PERCENT":
        discountAmount = (orderTotal * voucher.discountValue) / 100;
        if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
          discountAmount = voucher.maxDiscount;
        }
        break;

      case "FIXED":
        discountAmount = voucher.discountValue;
        break;

      case "FREESHIP":
        discountAmount = 0;
        break;

      default:
        discountAmount = 0;
    }

    const vatRate = 0.1;
    const vatAmount = orderTotal * vatRate;

    let finalShipping = 500000;
    if (discountType === "FREESHIP" && orderTotal >= (voucher.minOrderValue || 0)) {
      finalShipping = 0;
    }

    if (discountAmount > orderTotal) discountAmount = orderTotal;

    const finalTotal = orderTotal + vatAmount - discountAmount + finalShipping;

    res.status(200).json({
      message: "✅ Áp dụng voucher thành công",
      voucher: {
        id: voucher.id,
        code: voucher.code,
        discountAmount,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        finalShipping,
        finalTotal,
        description: voucher.description || "",
        remainingUsage: voucher.usageLimit,
      },
    });

  } catch (error) {
    console.error("❌ Error in applyVoucher:", error);
    res.status(500).json({ message: "❌ Lỗi server", error: error.message });
  }
};
