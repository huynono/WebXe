import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Car, Truck, Bike, Zap } from 'lucide-react';

// Import CSS của Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// 🔹 Định nghĩa kiểu dữ liệu Category
type Category = {
  id: number;
  name: string;
  description: string;
  image: string;
  isActive: boolean;
};

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const FeaturedCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  // Mock icons for different categories
  const getIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('sedan') || name.includes('hatchback')) return Car;
    if (name.includes('suv') || name.includes('truck')) return Truck;
    if (name.includes('bike') || name.includes('motorcycle')) return Bike;
    if (name.includes('electric')) return Zap;
    return Car;
  };

  useEffect(() => {
    axios
      .get<{ categories: Category[] }>(`${BASE_URL}/api/category/allCategory`)
      .then((res) => {
        const activeCategories = (res.data.categories || []).filter(
          (c) => c.isActive === true
        );
        setCategories(activeCategories);
      })
      .catch((err) => {
        console.error('❌ Lỗi khi lấy categories:', err);
      });
  }, []);

  const handleViewDetail = (categoryId: number) => {
    navigate(`/cars?category=${categoryId}`);
  };

  return (
    <section className="py-12 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Thể Loại{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Nổi Bật
            </span>
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto text-sm">
            Khám phá các thể loại xe phổ biến với đa dạng lựa chọn
          </p>
        </div>

        {/* Categories Slider */}
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={16}
          slidesPerView={1}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            bulletClass: 'swiper-pagination-bullet !bg-blue-400',
            bulletActiveClass: 'swiper-pagination-bullet-active !bg-blue-600',
          }}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          breakpoints={{
            480: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1280: { slidesPerView: 5 },
          }}
          className="!pb-12"
        >
          {categories.map((category) => {
            const IconComponent = getIcon(category.name);


            const imgUrl = category.image
              ? category.image.startsWith('http')
                ? category.image
                : `${BASE_URL}${category.image}`
              : '';

            return (
              <SwiperSlide key={category.id}>
                <div
                  onClick={() => handleViewDetail(category.id)}
                  className="group cursor-pointer bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100"
                >
                  {/* Image */}
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={imgUrl}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                    {/* Icon Overlay */}
                    <div className="absolute top-3 right-3 p-2 bg-white/90 rounded-full group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                      <IconComponent size={16} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 text-sm group-hover:text-blue-600 transition-colors line-clamp-1">
                      {category.name}
                    </h3>
                    <p className="text-gray-500 text-xs mb-3 line-clamp-2">
                      {category.description}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-blue-600 group-hover:text-blue-700">
                        Xem chi tiết
                      </span>
                      <ArrowRight
                        size={14}
                        className="text-blue-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Custom Navigation */}
        <div className="swiper-button-prev !text-blue-600 !w-8 !h-8 !bg-white !rounded-full !shadow-lg after:!text-sm after:!font-bold"></div>
        <div className="swiper-button-next !text-blue-600 !w-8 !h-8 !bg-white !rounded-full !shadow-lg after:!text-sm after:!font-bold"></div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
