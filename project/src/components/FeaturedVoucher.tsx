import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Percent,
  Gift,
  Truck,
  Tag,
  Clock,
  Users,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';

// Import CSS của Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// 🔹 Định nghĩa kiểu dữ liệu Voucher
type Voucher = {
  id: number;
  code: string;
  description: string | null;
  image: string | null;
  discountType: 'percent' | 'fixed' | 'freeship';
  discountValue: number | null;
  maxDiscount: number | null;
  minOrderValue: number | null;
  startDate: string;
  endDate: string;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
};

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const FeaturedVoucher: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const navigate = useNavigate();

  // Get appropriate icon for voucher type
  const getVoucherIcon = (discountType: string) => {
    switch (discountType) {
      case 'percent':
        return Percent;
      case 'fixed':
        return Tag;
      case 'freeship':
        return Truck;
      default:
        return Gift;
    }
  };

  // Get voucher color scheme based on type
  const getVoucherColors = (discountType: string) => {
    switch (discountType) {
      case 'percent':
        return {
          gradient: 'from-emerald-500 to-teal-600',
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200'
        };
      case 'fixed':
        return {
          gradient: 'from-blue-500 to-indigo-600',
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200'
        };
      case 'freeship':
        return {
          gradient: 'from-orange-500 to-red-600',
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          border: 'border-orange-200'
        };
      default:
        return {
          gradient: 'from-purple-500 to-pink-600',
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          border: 'border-purple-200'
        };
    }
  };

  // Format discount display
  const formatDiscount = (voucher: Voucher) => {
    if (voucher.discountType === 'freeship') {
      return 'Miễn phí vận chuyển';
    }
    if (voucher.discountType === 'percent') {
      return `Giảm ${voucher.discountValue}%`;
    }
    if (voucher.discountType === 'fixed') {
      return `Giảm ${formatPrice(voucher.discountValue || 0)}`;
    }
    return 'Ưu đãi đặc biệt';
  };

  // Format price
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Check if voucher is expiring soon (within 3 days)
  const isExpiringSoon = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  };

  // Copy voucher code
  const copyVoucherCode = async (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  useEffect(() => {
    axios
      .get<{ vouchers: Voucher[] }>(`${BASE_URL}/api/voucher/getvoucher`)
      .then((res) => {
        const activeVouchers = (res.data.vouchers || []).filter(
          (v) => v.isActive === true && new Date(v.endDate) > new Date()
        );
        setVouchers(activeVouchers);
      })
      .catch((err) => {
        console.error('❌ Lỗi khi lấy vouchers:', err);
      });
  }, []);


  const handleViewAllVouchers = () => {
    navigate('/vouchers');
  };

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Ưu Đãi{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Đặc Biệt
            </span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Khám phá những voucher hấp dẫn và tiết kiệm chi phí cho đơn hàng của bạn
          </p>
        </div>

        {vouchers.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Gift className="w-16 h-16 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Chưa có voucher nào</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              Hãy quay lại sau để khám phá những ưu đãi tuyệt vời
            </p>
          </div>
        ) : (
          <>
            {/* Vouchers Slider */}
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
              }}
              pagination={{
                clickable: true,
                bulletClass: 'swiper-pagination-bullet !bg-indigo-300',
                bulletActiveClass: 'swiper-pagination-bullet-active !bg-indigo-600',
              }}
              navigation={{
                nextEl: '.voucher-swiper-button-next',
                prevEl: '.voucher-swiper-button-prev',
              }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 },
              }}
              className="!pb-16"
            >
              {vouchers.map((voucher) => {
                const IconComponent = getVoucherIcon(voucher.discountType);
                const colors = getVoucherColors(voucher.discountType);
                const isExpiring = isExpiringSoon(voucher.endDate);

                const imgUrl = voucher.image
                  ? voucher.image.startsWith('http')
                    ? voucher.image
                    : `${BASE_URL}${voucher.image}`
                  : '';

                return (
                  <SwiperSlide key={voucher.id}>
                    <div className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-slate-200/60">
                      {/* Header with gradient */}
                      <div className={`relative h-32 bg-gradient-to-r ${colors.gradient} overflow-hidden`}>
                        {imgUrl && (
                          <img
                            src={imgUrl}
                            alt={voucher.code}
                            className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>

                        {/* Discount Badge */}
                        <div className="absolute top-4 left-4 flex items-center space-x-2">
                          <div className="p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
                            <IconComponent className="w-5 h-5 text-slate-700" />
                          </div>
                          <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1 shadow-lg">
                            <span className="text-sm font-bold text-slate-800">
                              {formatDiscount(voucher)}
                            </span>
                          </div>
                        </div>

                        {/* Expiring Soon Badge */}
                        {isExpiring && (
                          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                            <Clock className="w-3 h-3 inline mr-1" />
                            Sắp hết hạn
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-4">
                        {/* Voucher Code */}
                        <div className="flex items-center justify-between">
                          <div className={`px-4 py-2 ${colors.bg} ${colors.border} border-2 border-dashed rounded-xl`}>
                            <span className={`font-mono font-bold text-lg ${colors.text}`}>
                              {voucher.code}
                            </span>
                          </div>
                          <button
                            onClick={(e) => copyVoucherCode(voucher.code, e)}
                            className="p-2 hover:bg-slate-100 rounded-xl transition-colors group/copy"
                          >
                            {copiedCode === voucher.code ? (
                              <Check className="w-5 h-5 text-green-600" />
                            ) : (
                              <Copy className="w-5 h-5 text-slate-400 group-hover/copy:text-slate-600" />
                            )}
                          </button>
                        </div>

                        {/* Description */}
                        <div>
                          <p className="text-slate-700 font-semibold text-lg leading-tight line-clamp-2">
                            {voucher.description || 'Ưu đãi đặc biệt'}
                          </p>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 text-sm text-slate-600">
                          {voucher.minOrderValue && (
                            <div className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                              <span>Đơn tối thiểu: {formatPrice(voucher.minOrderValue)}</span>
                            </div>
                          )}
                          {voucher.maxDiscount && voucher.discountType === 'percent' && (
                            <div className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                              <span>Giảm tối đa: {formatPrice(voucher.maxDiscount)}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                            <span>Hết hạn: {formatDate(voucher.endDate)}</span>
                          </div>
                          {voucher.usageLimit && (
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-slate-400" />
                              <span>Còn lại: {voucher.usageLimit - voucher.usedCount} lượt</span>
                            </div>
                          )}
                        </div>

                        {/* CTA */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <span className="text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
                            Sử dụng ngay
                          </span>
                          <ArrowRight className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300" />
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            {/* Custom Navigation */}
            <div className="voucher-swiper-button-prev !text-indigo-600 !w-12 !h-12 !bg-white/90 !backdrop-blur-sm !rounded-2xl !shadow-xl !border !border-slate-200/60 after:!text-lg after:!font-bold hover:!bg-white transition-all duration-200"></div>
            <div className="voucher-swiper-button-next !text-indigo-600 !w-12 !h-12 !bg-white/90 !backdrop-blur-sm !rounded-2xl !shadow-xl !border !border-slate-200/60 after:!text-lg after:!font-bold hover:!bg-white transition-all duration-200"></div>

            {/* View All Button */}
            <div className="text-center mt-12">
              <button
                onClick={handleViewAllVouchers}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 group"
              >
                <span className="flex items-center space-x-3">
                  <span>Xem tất cả voucher</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedVoucher;