import React from 'react';
import { Car, Shield, Award, Users } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/10 to-cyan-400/10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-indigo-400/10 to-purple-400/10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-32 h-32 rounded-full bg-gradient-to-br from-teal-400/5 to-blue-400/5 animate-bounce delay-2000"></div>
      </div>

      <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Side - Enhanced Branding */}
        <div className="hidden lg:block space-y-8">
          {/* Brand Header */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-6 transition-transform duration-300">
                  <Car className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-3xl blur-xl"></div>
              </div>
              <div className="text-left">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent">
                  VinFast
                </h1>
                <p className="text-lg text-gray-600 font-medium">Showroom xe hàng đầu Việt Nam</p>
              </div>
            </div>
          </div>
          
          {/* Hero Image Section */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              <img
                src="https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg"
                alt="Modern Car Showroom"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-xl font-bold mb-1">Showroom hiện đại</h3>
                <p className="text-white/90">Trải nghiệm mua sắm đẳng cấp</p>
              </div>
            </div>
          </div>
          
          {/* Features Card */}
          <div className="backdrop-blur-md bg-white/80 border border-white/50 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full"></div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Award className="w-6 h-6 text-blue-600 mr-3" />
              Tại sao chọn VinFast
            </h3>
            <div className="space-y-5">
              {[
                { icon: Shield, text: "Hơn 15 năm kinh nghiệm" },
                { icon: Users, text: "10,000+ khách hàng hài lòng" },
                { icon: Award, text: "Bảo hành chính hãng toàn diện" }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-4 group">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -inset-1 bg-emerald-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors duration-300">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Enhanced Auth Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="backdrop-blur-xl bg-white/90 border border-white/50 rounded-3xl shadow-2xl p-10 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-500/5 via-cyan-500/5 to-transparent rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-500/5 via-purple-500/5 to-transparent rounded-tr-full"></div>
            
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center space-x-4 mb-8">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg">
                  <Car className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -inset-1 bg-blue-600/20 rounded-2xl blur-lg"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">VinFast</h1>
              </div>
            </div>

            <div className="text-center mb-8 relative z-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">{title}</h2>
              <p className="text-gray-600 text-lg">{subtitle}</p>
            </div>

            <div className="relative z-10">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;