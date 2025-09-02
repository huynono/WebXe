const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, email, password, phone, agreedToTerms } = req.body;

  if (!name || !email || !password || !phone) {
    return res
      .status(400)
      .json({ message: "❌ Vui lòng điền đầy đủ thông tin bắt buộc" });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "❌ Email đã được sử dụng!" });
    }

    // 🔒 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        phone: phone.trim(),
        agreedToTerms: agreedToTerms || false,
      },
    });

    res.status(201).json({
      message: "✅ Tạo người dùng thành công",
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    res.status(500).json({ message: "❌ Lỗi server", error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(400).json({ message: "❌ Email không tồn tại" });

    // 🔒 So sánh password với hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "❌ Mật khẩu không đúng" });

    // 🔑 Tạo JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.json({
      message: "✅ Đăng nhập thành công",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "❌ Lỗi server", error: error.message });
  }
};

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(
  "13487730626-552o2asvklccucrjhggcjg8ppfp3d98j.apps.googleusercontent.com"
);

exports.googleLogin = async (req, res) => {
  const { token } = req.body; // <--- đổi từ credential sang token

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience:
        "13487730626-552o2asvklccucrjhggcjg8ppfp3d98j.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();

    if (!payload.email_verified) {
      return res.status(400).json({ message: "Email chưa được xác thực" });
    }

    let user = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: payload.name,
          email: payload.email,
          password: "",
          provider: "google",
          agreedToTerms: true,
        },
      });
    }

    const jwtToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.json({ message: "✅ Google login thành công", token: jwtToken, user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "❌ Lỗi Google login", error: error.message });
  }
};

exports.facebookLogin = async (req, res) => {
  const { token } = req.body; // access token từ frontend

  try {
    // 🔹 Lấy thông tin user từ Facebook Graph API
    const fbRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`
    );
    const fbData = await fbRes.json();

    if (!fbData.email) {
      return res
        .status(400)
        .json({ message: "Không thể lấy email từ Facebook" });
    }

    // 🔹 Kiểm tra user đã tồn tại chưa
    let user = await prisma.user.findUnique({ where: { email: fbData.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: fbData.name,
          email: fbData.email,
          password: "", // đăng nhập qua Facebook nên không cần mật khẩu
          provider: "facebook",
          agreedToTerms: true,
        },
      });
    }

    // 🔹 Tạo JWT
    const jwtToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.json({
      message: "✅ Facebook login thành công",
      token: jwtToken,
      user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "❌ Lỗi Facebook login", error: error.message });
  }
};

// Lấy tất cả người dùng
// Lấy tất cả người dùng
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null, // ✅ viết đúng theo schema
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Cập nhật thông tin user
exports.updateUser = async (req, res) => {
  const id = Number(req.params.id);
  const { name, email, phone, password, agreedToTerms } = req.body;

  if (!id) return res.status(400).json({ message: "Thiếu id người dùng" });

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(email && { email: email.trim().toLowerCase() }),
        ...(phone && { phone: phone.trim() }),
        ...(password && { password }), // Lưu ý: hash password nếu cần
        ...(agreedToTerms !== undefined && { agreedToTerms }),
      },
    });

    res.status(200).json({
      message: "✅ Cập nhật người dùng thành công",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Xóa user (soft delete bằng DeletedAt)
exports.deleteUser = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ message: "Thiếu id người dùng" });

  try {
    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: "✅ Xóa người dùng thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
