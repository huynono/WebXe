import React, { useState } from 'react';
import {
  Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, UserPlus
} from 'lucide-react';
import AuthLayout from './AuthLayout';

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('❌ Mật khẩu xác nhận không khớp!');
      return;
    }

    if (!formData.agreedToTerms) {
      alert('❌ Bạn cần đồng ý với Điều khoản & Chính sách bảo mật.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        alert('✅ Đăng ký thành công!');
        window.location.href = '/login';
      } else {
        alert(`❌ Đăng ký thất bại: ${result.message || result.error}`);
      }
    } catch (error) {
      console.error('🚨 Lỗi kết nối đến server:', error);
      alert('🚨 Có lỗi kết nối đến server!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Đăng Ký" subtitle="Tạo tài khoản để trải nghiệm dịch vụ tốt nhất">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-semibold text-gray-800">Họ và tên</label>
          <div className="relative group">
            <User className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200" />
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-500"
              placeholder="Nhập họ và tên đầy đủ"
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-gray-800">Địa chỉ Email</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200" />
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-500"
              placeholder="Nhập địa chỉ email của bạn"
            />
          </div>
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-800">Số điện thoại</label>
          <div className="relative group">
            <Phone className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200" />
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-500"
              placeholder="Nhập số điện thoại"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-semibold text-gray-800">Mật khẩu</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-12 pr-14 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-500"
              placeholder="Tạo mật khẩu mạnh"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 hover:scale-110 transition-transform duration-200"
            >
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
            </button>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800">Xác nhận mật khẩu</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full pl-12 pr-14 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-500"
              placeholder="Nhập lại mật khẩu"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-4 hover:scale-110 transition-transform duration-200"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
            </button>
          </div>
        </div>

        {/* Terms Agreement */}
        <div className="flex items-start space-x-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
          <input
            id="agreedToTerms"
            name="agreedToTerms"
            type="checkbox"
            required
            checked={formData.agreedToTerms}
            onChange={handleChange}
            className="h-5 w-5 mt-0.5 text-blue-600 focus:ring-blue-500/20 border-gray-300 rounded-lg transition-all duration-200"
          />
          <label htmlFor="agreedToTerms" className="text-sm text-gray-700 leading-relaxed">
            Tôi đồng ý với{' '}
            <button type="button" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-all duration-200">
              Điều khoản sử dụng
            </button>{' '}
            và{' '}
            <button type="button" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-all duration-200">
              Chính sách bảo mật
            </button>{' '}
            của VinFast
          </label>
        </div>

        {/* Register Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:hover:scale-100 flex items-center justify-center space-x-3 shadow-lg relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Đang tạo tài khoản...</span>
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              <span>Tạo Tài Khoản</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </>
          )}
        </button>

        {/* Sign In Link */}
        <div className="text-center pt-4">
          <p className="text-gray-600">
            Đã có tài khoản?{' '}
            <button
              type="button"
              className="font-bold text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:underline"
              onClick={() => window.location.href = '/login'}
            >
              Đăng nhập ngay
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterForm;