const { PrismaClient } = require("@prisma/client");
const cloudinary = require("cloudinary").v2;
const prisma = new PrismaClient();

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.createCategory = async (req, res) => {
  try {
    const { name, slug, description, isActive } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "❌ Tên danh mục là bắt buộc",
      });
    }

    let imageUrl = null;

    // Nếu có file thì lấy URL từ Cloudinary (multer-storage-cloudinary đã upload rồi)
    if (req.file) {
      imageUrl = req.file.path; // Cloudinary trả về URL trong req.file.path
    }

    const categoryData = {
      name: name.trim(),
      slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
      description: description || "",
      image: imageUrl,
      isActive: isActive === "true" || isActive === true,
    };

    const newCategory = await prisma.category.create({
      data: categoryData,
    });

    res.status(201).json({
      message: "✅ Tạo danh mục thành công",
      category: newCategory,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({
        message: `❌ Slug "${req.body?.slug || "unknown"}" đã tồn tại!`,
      });
    }

    res.status(500).json({
      message: "❌ Lỗi server khi tạo danh mục",
      error: error.message,
    });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: "asc" }, // Sắp xếp theo ID
    });

    res.status(200).json({
      message: "✅ Lấy danh sách category thành công",
      total: categories.length,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

exports.updateCategoryStatus = async (req, res) => {
  const id = req.params.id;
  const { isActive } = req.body;

  // Kiểm tra dữ liệu truyền vào
  if (id === undefined || isActive === undefined) {
    return res.status(400).json({ message: "Thiếu id hoặc isActive" });
  }

  try {
    // Cập nhật trường isActive trong bảng category (chữ thường)
    const updatedCategory = await prisma.category.update({
      where: { id: Number(id) },
      data: {
        isActive: isActive === "true" || isActive === true,
      },
    });

    return res.status(200).json({
      message: "✅ Cập nhật trạng thái danh mục thành công",
      category: updatedCategory,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server khi cập nhật trạng thái danh mục",
      error: error.message,
    });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params; // Lấy id category từ URL params

  if (!id) {
    return res.status(400).json({ message: "Thiếu id danh mục cần xóa" });
  }

  try {
    // Xóa category theo id
    await prisma.category.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({ message: "✅ Xóa danh mục thành công" });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server khi xóa danh mục",
      error: error.message,
    });
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params; // Lấy ID từ URL
  const { name, slug, description, isActive } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Thiếu id danh mục cần cập nhật" });
  }

  try {
    let imageUrl = undefined;

    // Nếu có file mới thì lấy URL từ Cloudinary
    if (req.file) {
      imageUrl = req.file.path; // Cloudinary trả về URL trong req.file.path
    }

    const updatedCategory = await prisma.category.update({
      where: { id: Number(id) },
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"), // nếu không có slug thì auto tạo
        description,
        isActive: isActive === "true" || isActive === true,
        ...(imageUrl && { image: imageUrl }), // chỉ update image nếu có file mới
      },
    });

    return res.status(200).json({
      message: "✅ Cập nhật danh mục thành công",
      category: updatedCategory,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({
        message: `❌ Slug "${slug}" đã tồn tại!`,
      });
    }

    return res.status(500).json({
      message: "Lỗi server khi cập nhật danh mục",
      error: error.message,
    });
  }
};
