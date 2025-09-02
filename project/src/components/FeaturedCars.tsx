import React, { useState, useEffect } from 'react';
import { Eye, Heart, Calendar, Fuel, Gauge, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  slug?: string;
  year: number;
  km?: string;
  fuelType?: string;
  image?: string;
  isNew?: boolean;
  isHot?: boolean;
  isActive?: boolean | string | number;
  colors?: {
    id: number;
    name: string;
    hex?: string;
    category?: 'solid' | 'metallic' | 'pearl' | 'matte';
    popular?: boolean;
  }[];
}

const BASE_URL = 'http://localhost:3000';

// Loading skeleton component
const CarSkeleton = () => (
  <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
    <div className="animate-pulse">
      <div className="w-full h-56 bg-gray-300"></div>
      <div className="p-6">
        <div className="h-6 bg-gray-300 rounded mb-4"></div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="h-12 bg-gray-200 rounded-lg"></div>
          <div className="h-12 bg-gray-200 rounded-lg"></div>
          <div className="h-12 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-8 bg-gray-300 rounded mb-4"></div>
        <div className="h-12 bg-gray-300 rounded-xl"></div>
      </div>
    </div>
  </div>
);

// Car card component
const CarCard: React.FC<{ car: Product; onNavigate: (slug: string) => void }> = ({ car, onNavigate }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const imgUrl = car.image
    ? car.image.startsWith('http')
      ? car.image
      : `${BASE_URL}${car.image}`
    : '';

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);

  const discountPercentage = car.originalPrice
    ? Math.round(((car.originalPrice - car.price) / car.originalPrice) * 100)
    : 0;

  return (
    <div
      onClick={() => onNavigate(car.slug || '')}
      className="group bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 overflow-hidden border border-gray-100">
      {/* Image Section */}
      <div className="relative overflow-hidden">
        <div className="aspect-[4/3] relative bg-gray-100">
          <img
            src={imgUrl}
            alt={car.name}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {car.isNew && (
            <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
              Mới
            </span>
          )}
          {car.isHot && (
            <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg flex items-center gap-1">
              <Star className="w-3 h-3" fill="currentColor" />
              Hot
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 backdrop-blur-sm ${isLiked
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
              }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(car.slug || '');
            }}
            className="w-11 h-11 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300 text-gray-600 hover:text-blue-600"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
          {car.name}
        </h3>

        {/* Car Details Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gray-50 rounded-xl p-3 text-center transition-all duration-300 hover:bg-blue-50 hover:border-blue-200 border border-transparent">
            <Calendar className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <div className="text-xs text-gray-500 mb-1">Năm sản xuất</div>
            <div className="font-semibold text-gray-900">{car.year}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center transition-all duration-300 hover:bg-blue-50 hover:border-blue-200 border border-transparent">
            <Gauge className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <div className="text-xs text-gray-500 mb-1">Số km</div>
            <div className="font-semibold text-gray-900">{car.km || 'N/A'}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center transition-all duration-300 hover:bg-blue-50 hover:border-blue-200 border border-transparent">
            <Fuel className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <div className="text-xs text-gray-500 mb-1">Nhiên liệu</div>
            <div className="font-semibold text-gray-900 text-xs">{car.fuelType || 'N/A'}</div>
          </div>
        </div>

        {/* Price Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              {formatPrice(car.price)}
            </span>
            {car.originalPrice && (
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(car.originalPrice)}
              </span>
            )}
          </div>
        </div>
        {/* Colors Section */}
        {car.colors && car.colors.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600">Màu sắc:</span>
              <div className="flex flex-wrap gap-2">
                {car.colors.slice(0, 5).map((color) => (
                  <div
                    key={color.id}
                    title={color.name}
                    className="w-6 h-6 rounded-full border shadow-sm cursor-pointer hover:scale-110 transition-transform"
                    style={{
                      background: color.hex || '#ccc',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={() => onNavigate(car.slug || '')}
          className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-bold py-3.5 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl active:scale-95"
        >
          Xem Chi Tiết
        </button>
      </div>
    </div>
  );
};

const FeaturedCars = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/product/allProducts?limit=8`);
        const data = await res.json();

        if (res.ok) {
          console.log('Sản phẩm lấy được:', data.products);

          const activeProducts = (data.products || []).filter((car: Product) => {
            if (typeof car.isActive === 'boolean') return car.isActive === true;
            if (typeof car.isActive === 'string') return car.isActive.toLowerCase() === 'true';
            if (typeof car.isActive === 'number') return car.isActive === 1;
            return false;
          });

          setProducts(activeProducts);
          setError(null);
        } else {
          setError(data.message || 'Lỗi khi lấy sản phẩm');
        }
      } catch (err) {
        setError('Lỗi kết nối tới server');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleNavigate = (slug: string) => {
    if (slug) {
      navigate(`/product/${slug}`);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-100/40 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-cyan-100/40 to-transparent rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Star className="w-4 h-4 fill-current" />
            Sản phẩm nổi bật
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Xe{' '}
            <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 bg-clip-text text-transparent">
              Nổi Bật
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Khám phá những chiếc xe được yêu thích nhất với giá cả hấp dẫn và chất lượng đảm bảo
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 text-center">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Grid Products */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => <CarSkeleton key={index} />)
            : products.slice(0, 8).map((car) => (
              <CarCard key={car.id} car={car} onNavigate={handleNavigate} />
            ))
          }
        </div>

        {/* View More Button */}
        {!loading && products.length > 0 && (
          <div className="text-center mt-16">
            <button
              onClick={() => navigate('/cars')}
              className="group bg-white hover:bg-blue-600 border-2 border-blue-600 text-blue-600 hover:text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95"
            >
              <span className="flex items-center gap-2">
                Xem Thêm Xe
                <Eye className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Chưa có sản phẩm nào</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Hiện tại chúng tôi đang cập nhật sản phẩm. Vui lòng quay lại sau.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCars;