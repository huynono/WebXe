import React, { useState } from 'react';
import { Car, Lock, Mail, Eye, EyeOff, Shield, Users, BarChart3, Settings } from 'lucide-react';

const LoginAdmin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  //   const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email không hợp lệ';
    if (!password) newErrors.password = 'Vui lòng nhập mật khẩu';
    else if (password.length < 6) newErrors.password = 'Mật khẩu phải ít nhất 6 ký tự';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/admin/loginadmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminEmail', email); // lưu luôn email
        window.location.href = '/admin';
      } else {
        alert(data.message || 'Đăng nhập thất bại!');
      }
    } catch (err) {
      setIsLoading(false);
      console.error(err);
      alert('Lỗi kết nối server!');
    }
  };

  //   const handleForgot = () => alert('Tính năng quên mật khẩu sẽ được triển khai sau!');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg mb-4">
            <Car size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">VinFast</h1>
          <p className="text-slate-300">Hệ thống quản lý bán xe chuyên nghiệp</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Đăng nhập Admin</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Admin</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}

                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}

                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Remember & Forgot */}
            {/* <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
              </label>
              
              <button type="button" onClick={handleForgot} className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline">Quên mật khẩu?</button>
            </div> */}

            {/* Submit */}
            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Shield size={18} /> Đăng nhập Admin</>}
            </button>
          </form>

          {/* Tính năng hệ thống */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-gray-600">
            <p className="text-sm mb-3 font-medium">Tính năng hệ thống:</p>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <Car size={20} className="text-blue-600" />
                </div>
                <span className="text-xs">Quản Lý Sản Phẩm</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                  <Users size={20} className="text-green-600" />
                </div>
                <span className="text-xs">Quản Lý Khách hàng</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                  <BarChart3 size={20} className="text-purple-600" />
                </div>
                <span className="text-xs">Báo cáo Doanh thu</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                  <Settings size={20} className="text-orange-600" />
                </div>
                <span className="text-xs">Cài đặt</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center text-sm text-slate-300 bg-slate-800/50 px-4 py-2 rounded-full backdrop-blur-sm">
            <Shield size={16} className="mr-2 text-green-400" />
            Hệ thống được bảo mật bởi SSL 256-bit encryption
          </div>
          <div className="mt-4 text-xs text-slate-400">© 2025 VinFast. Phát triển bởi Admin System.</div>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;
