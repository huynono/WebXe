import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const loginAdmin = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' });
  }

  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

  return res.json({ message: 'Đăng nhập thành công', token });
};
