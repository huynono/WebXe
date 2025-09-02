// controllers/product.controller.js
const { PrismaClient } = require("@prisma/client");
const cloudinary = require("cloudinary").v2;
const prisma = new PrismaClient();

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware upload
exports.addProduct = async (req, res) => {
  try {
    const {
      name,
      year,
      discount = 0,
      slug,
      description,
      isActive = true,
      categoryId,
      price,
      warranty,
      fuelType,
      quantity,
      power,
      seats,
      contactInfo,
      km,
    } = req.body;

    // Parse JSON fields an toàn
    const parseJSON = (field) => {
      try {
        return field ? JSON.parse(field) : [];
      } catch {
        return [];
      }
    };

    const specifications = parseJSON(req.body.specifications);
    const features = parseJSON(req.body.features);
    const safeties = parseJSON(req.body.safeties);
    const rawColors = parseJSON(req.body.colors);

    // Chuẩn hóa colors
    const colorsBody = rawColors
      .map((c) => {
        if (typeof c === "string" && c.trim() !== "") {
          return { name: c.trim(), hex: null, gradient: null };
        } else if (c && typeof c === "object" && c.name) {
          return {
            name: c.name.trim(),
            hex: c.hex || null,
            gradient: c.gradient || null,
          };
        }
        return null;
      })
      .filter(Boolean);

    console.log("🎨 Colors từ FE:", rawColors);
    console.log("🎨 ColorsBody sau validate:", colorsBody);

    // Upload ảnh
    const imageFile = req.files?.image?.[0] || null;
    const imageFiles = req.files?.images || [];

    let imageUrl = null;
    let imageUrls = [];

    if (imageFile) {
      try {
        const result = await cloudinary.uploader.upload(imageFile.path, {
          folder: "products/main",
          resource_type: "auto",
        });
        imageUrl = result.secure_url;
      } catch (err) {
        console.error("❌ Lỗi upload ảnh chính:", err);
        return res
          .status(500)
          .json({ message: "❌ Upload ảnh chính thất bại" });
      }
    }

    if (imageFiles.length > 0) {
      try {
        for (const file of imageFiles) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "products/gallery",
            resource_type: "auto",
          });
          imageUrls.push(result.secure_url);
        }
      } catch (err) {
        console.error("❌ Lỗi upload ảnh phụ:", err);
        return res.status(500).json({ message: "❌ Upload ảnh phụ thất bại" });
      }
    }

    // Tạo product mới
    const newProduct = await prisma.product.create({
      data: {
        name,
        year: Number(year),
        discount: Number(discount),
        slug,
        image: imageUrl,
        description,
        isActive: isActive === "true" || isActive === true,
        categoryId: Number(categoryId),
        price: Number(price),
        warranty,
        quantity: quantity ? Number(quantity) : null,
        fuelType,
        power,
        seats: seats ? Number(seats) : null,
        contactInfo,
        km: km ? Number(km) : null,

        ...(specifications.length > 0 && {
          specifications: {
            create: specifications.map((s) => ({ key: s.key, value: s.value })),
          },
        }),
        ...(features.length > 0 && {
          features: { create: features.map((f) => ({ name: f.name })) },
        }),
        ...(safeties.length > 0 && {
          safeties: { create: safeties.map((s) => ({ name: s.name })) },
        }),
        ...(colorsBody.length > 0 && {
          colors: { create: colorsBody },
        }),
        ...(imageUrls.length > 0 && {
          images: { create: imageUrls.map((url) => ({ url })) },
        }),
      },
      include: {
        category: true,
        specifications: true,
        features: true,
        safeties: true,
        colors: true,
        images: true,
      },
    });

    res.status(201).json({
      message: "✅ Thêm sản phẩm thành công",
      product: newProduct,
    });
  } catch (error) {
    if (error.code === "P2002" && error.meta?.target?.includes("slug")) {
      return res
        .status(400)
        .json({ message: `❌ Slug "${req.body.slug}" đã tồn tại!` });
    }
    console.error("❌ Lỗi server:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Backend - product.controller.js
// ... existing code ...

exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    // Lấy tất cả query parameters cho search và filter
    const {
      category,
      fuelType,
      seats,
      yearFrom,
      yearTo,
      priceFrom,
      priceTo,
      kmFrom,
      kmTo,
      search, // Thêm parameter search
      sortBy, // Thêm parameter sort
      sortOrder, // Thêm parameter sort order
    } = req.query;

    const where = { isActive: true };

    // �� SEARCH THEO TÊN, MÔ TẢ, SLUG
    if (search && search.trim()) {
      where.OR = [
        {
          name: {
            contains: search.trim(),
            mode: "insensitive", // Tìm kiếm không phân biệt hoa thường
          },
        },
        {
          description: {
            contains: search.trim(),
            mode: "insensitive",
          },
        },
        {
          slug: {
            contains: search.trim().toLowerCase().replace(/\s+/g, "-"),
            mode: "insensitive",
          },
        },
        {
          category: {
            name: {
              contains: search.trim(),
              mode: "insensitive",
            },
          },
        },
      ];
    }

    // Filter theo category
    if (category) {
      where.categoryId = parseInt(category);
    }

    // Filter theo loại nhiên liệu
    if (fuelType) {
      const fuels = fuelType.split(",").map((f) => f.trim());
      where.fuelType = { in: fuels };
    }

    // Filter theo số ghế
    if (seats) {
      const seatsArray = seats.split(",").map((s) => parseInt(s.trim()));
      where.seats = { in: seatsArray };
    }

    // Filter theo năm sản xuất
    if (yearFrom || yearTo) {
      where.year = {};
      if (yearFrom) where.year.gte = parseInt(yearFrom);
      if (yearTo) where.year.lte = parseInt(yearTo);
    }

    // Filter theo giá
    if (priceFrom || priceTo) {
      where.price = {};
      if (priceFrom) where.price.gte = parseFloat(priceFrom);
      if (priceTo) where.price.lte = parseFloat(priceTo);
    }

    // Filter theo số km đã chạy
    if (kmFrom || kmTo) {
      where.km = {};
      if (kmFrom) where.km.gte = parseInt(kmFrom);
      if (kmTo) where.km.lte = parseInt(kmTo);
    }

    // 🎯 SẮP XẾP KẾT QUẢ
    let orderBy = { createdAt: "desc" }; // Mặc định sắp xếp theo ngày tạo mới nhất

    if (sortBy) {
      const validSortFields = [
        "name",
        "price",
        "year",
        "km",
        "createdAt",
        "discount",
      ];
      if (validSortFields.includes(sortBy)) {
        orderBy = { [sortBy]: sortOrder === "desc" ? "desc" : "asc" };
      }
    }

    const [totalProducts, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          category: true,
          specifications: true,
          features: true,
          safeties: true,
          colors: true,
          images: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    // 📊 TÍNH TOÁN THÔNG TIN PHÂN TRANG
    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      message: "✅ Lấy danh sách sản phẩm thành công",
      total: totalProducts,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
      products,
      searchInfo: {
        searchQuery: search || null,
        appliedFilters: {
          category: category || null,
          fuelType: fuelType || null,
          seats: seats || null,
          yearFrom: yearFrom || null,
          yearTo: yearTo || null,
          priceFrom: priceFrom || null,
          priceTo: priceTo || null,
          kmFrom: kmFrom || null,
          kmTo: kmTo || null,
          sortBy: sortBy || "createdAt",
          sortOrder: sortOrder || "desc",
        },
      },
    });
  } catch (error) {
    console.error("❌ Lỗi server khi lấy sản phẩm:", error);
    res.status(500).json({
      message: "Lỗi server khi lấy sản phẩm",
      error: error.message,
    });
  }
};

exports.getProductBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { slug: slug },
      include: {
        category: true,
        specifications: true,
        features: true,
        safeties: true,
        colors: true,
        images: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: `Không tìm thấy sản phẩm với slug = ${slug}`,
      });
    }

    // ✅ Tính rating và tổng số review
    const stats = await prisma.review.aggregate({
      where: { productId: product.id, isVisible: true },
      _avg: { rating: true },
      _count: { id: true },
    });

    res.status(200).json({
      message: "✅ Lấy sản phẩm thành công",
      product: {
        ...product,
        rating: stats._avg.rating || 0,
        totalReviews: stats._count.id,
      },
    });
  } catch (error) {
    console.error("❌ Lỗi server khi lấy sản phẩm theo slug:", error);
    res.status(500).json({
      message: "Lỗi server khi lấy sản phẩm theo slug",
      error: error.message,
    });
  }
};

// Xóa sản phẩm theo id
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Xóa các bản ghi con trước
    await prisma.specification.deleteMany({ where: { productId: Number(id) } });
    await prisma.feature.deleteMany({ where: { productId: Number(id) } });
    await prisma.safety.deleteMany({ where: { productId: Number(id) } });
    await prisma.color.deleteMany({ where: { productId: Number(id) } });
    await prisma.productImage.deleteMany({ where: { productId: Number(id) } });

    // Xóa product chính
    await prisma.product.delete({ where: { id: Number(id) } });

    res.status(200).json({ message: "✅ Xóa sản phẩm thành công" });
  } catch (error) {
    console.error("Lỗi server khi xóa sản phẩm:", error);
    res.status(500).json({
      message: "Lỗi server khi xóa sản phẩm",
      error: error.message,
    });
  }
};

// Cập nhật sản phẩm với hỗ trợ ảnh Cloudinary
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    year,
    discount,
    slug,
    description,
    isActive,
    categoryId,
    price,
    warranty,
    fuelType,
    quantity,
    power,
    seats,
    contactInfo,
    km,
    colors,
  } = req.body;

  try {
    const existing = await prisma.product.findUnique({
      where: { id: Number(id) },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ message: `Không tìm thấy sản phẩm với id = ${id}` });
    }

    // Xử lý ảnh chính
    let imageUrl = existing.image;
    let imageUrls = [];

    const imageFile = req.files?.image?.[0] || null;
    if (imageFile) {
      try {
        const result = await cloudinary.uploader.upload(imageFile.path, {
          folder: "products/main",
          resource_type: "auto",
        });
        imageUrl = result.secure_url;
      } catch (uploadError) {
        console.error("❌ Lỗi upload ảnh chính:", uploadError);
        return res
          .status(500)
          .json({ message: "❌ Lỗi upload ảnh chính lên Cloudinary" });
      }
    }

    // Xử lý ảnh phụ
    const imageFiles = req.files?.images || [];
    if (imageFiles.length > 0) {
      try {
        for (const file of imageFiles) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "products/gallery",
            resource_type: "auto",
          });
          imageUrls.push(result.secure_url);
        }
      } catch (uploadError) {
        console.error("❌ Lỗi upload ảnh phụ:", uploadError);
        return res
          .status(500)
          .json({ message: "❌ Lỗi upload ảnh phụ lên Cloudinary" });
      }
    }

    // Cập nhật sản phẩm
    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(year !== undefined && { year: Number(year) }),
        ...(discount !== undefined && { discount: Number(discount) }),
        ...(slug !== undefined && { slug }),
        ...(imageUrl !== existing.image && { image: imageUrl }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && {
          isActive: isActive === "true" || isActive === true,
        }),
        ...(categoryId !== undefined && { categoryId: Number(categoryId) }),
        ...(price !== undefined && { price: Number(price) }),
        ...(warranty !== undefined && { warranty }),
        ...(fuelType !== undefined && { fuelType }),
        ...(power !== undefined && { power }),
        ...(seats !== undefined && { seats: Number(seats) }),
        ...(contactInfo !== undefined && { contactInfo }),
        ...(km !== undefined && { km: Number(km) }),
        ...(quantity !== undefined && { quantity: Number(quantity) }),
      },
    });

    // Cập nhật ảnh phụ nếu có
    if (imageUrls.length > 0) {
      await prisma.productImage.deleteMany({
        where: { productId: Number(id) },
      });
      await prisma.productImage.createMany({
        data: imageUrls.map((url) => ({ productId: Number(id), url })),
      });
    }

    // Cập nhật colors
    if (colors !== undefined) {
      let colorsArray = [];
      try {
        colorsArray = typeof colors === "string" ? JSON.parse(colors) : colors;
      } catch (_) {
        colorsArray = [];
      }

      await prisma.color.deleteMany({ where: { productId: Number(id) } });

      if (Array.isArray(colorsArray) && colorsArray.length > 0) {
        await prisma.color.createMany({
          data: colorsArray.map((c) => ({
            productId: Number(id),
            name: c.name ?? "",
            hex: c.hex ?? "",
            gradient: c.gradient ?? "",
          })),
        });
      }
    }

    res.status(200).json({
      message: "✅ Cập nhật sản phẩm thành công",
      product: updatedProduct,
    });
  } catch (error) {
    if (error.code === "P2002" && error.meta?.target?.includes("slug")) {
      return res.status(400).json({ message: `❌ Slug "${slug}" đã tồn tại!` });
    }
    console.error("❌ Lỗi server khi cập nhật sản phẩm:", error);
    res.status(500).json({
      message: "Lỗi server khi cập nhật sản phẩm",
      error: error.message,
    });
  }
};

// controllers/product.controller.js (hoặc file xử lý API update sản phẩm)

exports.updateProductStatus = async (req, res) => {
  const id = req.params.id; // Lấy id từ params URL
  const { isActive } = req.body;

  if (id === undefined || isActive === undefined) {
    return res.status(400).json({ message: "Thiếu id hoặc isActive" });
  }

  try {
    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        isActive: isActive === "true" || isActive === true,
      },
    });

    res.status(200).json({
      message: "✅ Cập nhật trạng thái sản phẩm thành công",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("❌ Lỗi server khi cập nhật trạng thái sản phẩm:", error);
    res.status(500).json({
      message: "Lỗi server khi cập nhật trạng thái sản phẩm",
      error: error.message,
    });
  }
};
