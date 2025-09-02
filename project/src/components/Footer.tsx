import React from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">VIN</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">VinFast</h3>
                <p className="text-gray-400">Showroom xe hàng đầu</p>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Chuyên cung cấp xe hơi chất lượng cao với dịch vụ tận tâm. 
              Hơn 15 năm kinh nghiệm trong ngành ô tô.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold">Liên Kết Nhanh</h4>
            <div className="space-y-3">
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Trang chủ</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Xe mới</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Xe cũ</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Dịch vụ</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Tin tức</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Liên hệ</a>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold">Dịch Vụ</h4>
            <div className="space-y-3">
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Mua xe trả góp</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Thu mua xe cũ</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Bảo dưỡng xe</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Sửa chữa xe</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Bảo hiểm xe</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Đăng ký xe</a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold">Liên Hệ</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-400">437 Ymom </p>
                  <p className="text-gray-400">Buôn ma thuột, DakLak</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold">0365515124</p>
                  <p className="text-gray-400 text-sm">Hotline 24/7</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold">huy126347@gmail.com</p>
                  <p className="text-gray-400 text-sm">Email hỗ trợ</p>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="space-y-3">
              <h5 className="font-semibold">Đăng ký nhận tin</h5>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Email của bạn..."
                  className="flex-1 px-4 py-2 bg-gray-800 rounded-l-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                />
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-lg transition-colors">
                  Đăng ký
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-center md:text-left">
              © 2025 VinFast. Tất cả các quyền được bảo lưu.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a>
              <a href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</a>
              <a href="#" className="hover:text-white transition-colors">Chính sách đổi trả</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;