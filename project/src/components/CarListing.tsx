import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Car as CarIcon, ChevronLeft, ChevronRight, X, Sliders } from 'lucide-react';
import axios from 'axios';
import CarCard from './CarCard';
import { Car } from './types/car';
import Footer from './Footer';
import Header from './Header';
import Services from './Services';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

interface ApiProduct {
  id: number;
  name: string;
  year?: number;
  price?: number;
  km?: number;
  seats?: number;
  fuelType?: string;
  category?: { id: number; name: string };
  image?: string;
  slug?: string;
  isActive?: boolean | string | number;
}

const CarListing: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [category, setCategory] = useState<string>('');
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [fuelTypes, setFuelTypes] = useState<string[]>([]);
  const [seats, setSeats] = useState<string[]>([]);

  const [yearFrom, setYearFrom] = useState<string>('');
  const [yearTo, setYearTo] = useState<string>('');

  // Đồng bộ với slider max: price max = 2,000,000,000; km max = 200,000
  const PRICE_MAX = 2000000000;
  const KM_MAX = 200000;
  const [priceRange, setPriceRange] = useState<[number, number]>([0, PRICE_MAX]);
  const [kmRange, setKmRange] = useState<[number, number]>([0, KM_MAX]);

  // Get category from URL when page loads
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryFromURL = params.get('category');
    if (categoryFromURL) {
      setCategory(categoryFromURL);
    }
  }, []);

  // Toggle fuel type selection
  const toggleFuelType = (type: string) => {
    setFuelTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
    setPage(1);
  };

  // Fetch cars from API
  const fetchCars = async (pageNumber: number) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: pageNumber, limit: 6 };

      if (category) params.category = category;
      if (fuelTypes.length > 0) params.fuelType = fuelTypes.join(',');
      if (seats.length > 0) params.seats = seats.join(',');
      if (yearFrom) params.yearFrom = yearFrom;
      if (yearTo) params.yearTo = yearTo;
      // Chỉ gửi khi khác mặc định để tránh lọc ngoài ý muốn (đặc biệt km null)
      if (priceRange[0] > 0) params.priceFrom = priceRange[0];
      if (priceRange[1] < PRICE_MAX) params.priceTo = priceRange[1];
      if (kmRange[0] > 0) params.kmFrom = kmRange[0];
      if (kmRange[1] < KM_MAX) params.kmTo = kmRange[1];
      if (searchTerm && searchTerm.trim()) params.search = searchTerm.trim();

      const res = await axios.get<{ products: ApiProduct[]; totalPages: number; total: number }>(
        'http://localhost:3000/api/product/allProducts',
        { params }
      );

      const mappedCars: Car[] = res.data.products.map((p: ApiProduct) => ({
        id: p.id,
        name: p.name,
        year: p.year,
        price: p.price,
        km: p.km,
        seats: p.seats,
        fuelType: p.fuelType,
        category: p.category?.name || '',
        image: p.image && p.image.startsWith('http') ? p.image : '',
        slug: p.slug,
        isActive: p.isActive,
      }));

      setCars(mappedCars);
      setTotalPages(res.data.totalPages || 1);
      setTotalProducts(res.data.total || 0);
    } catch (err) {
      console.error(err);
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for dropdown
  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/category/allCategory');
      setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
      setCategories([]);
    }
  };

  const clearAllFilters = () => {
    setCategory('');
    setFuelTypes([]);
    setSeats([]);
    setYearFrom('');
    setYearTo('');
    setPriceRange([0, PRICE_MAX]);
    setKmRange([0, KM_MAX]);
    setSearchTerm('');
    setPage(1);
  };

  const hasActiveFilters = category || fuelTypes.length > 0 || seats.length > 0 || 
                          yearFrom || yearTo || searchTerm ||
                          priceRange[0] > 0 || priceRange[1] < PRICE_MAX ||
                          kmRange[0] > 0 || kmRange[1] < KM_MAX;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCars(page);
  }, [page, category, fuelTypes, seats, yearFrom, yearTo, priceRange, kmRange]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-indigo-800/90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
                <CarIcon className="text-white" size={40} />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white">
                Showroom Xe Hơi
              </h1>
            </div>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl">
              Khám phá {totalProducts.toLocaleString()} chiếc xe chất lượng cao với giá tốt nhất
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto lg:mx-0">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên xe hoặc hãng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 text-lg bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl 
                         focus:ring-4 focus:ring-white/25 focus:border-white focus:outline-none 
                         shadow-lg placeholder-gray-500 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toggle for Mobile */}
      <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-3">
        <button
          onClick={() => setShowFilters(prev => !prev)}
          className="flex items-center justify-between w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 
                   text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <Sliders size={20} />
            <span className="font-semibold">Bộ lọc tìm kiếm</span>
            {hasActiveFilters && (
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                Đang lọc
              </span>
            )}
          </div>
          {showFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className={`w-full lg:w-80 flex-shrink-0 transition-all duration-300 ${
          showFilters ? 'block' : 'hidden lg:block'
        }`}>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 space-y-6 sticky top-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Filter className="text-blue-600" size={24} />
                Bộ lọc
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 
                           bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
                >
                  <X size={16} />
                  Xóa tất cả
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-lg">Loại xe</h4>
              <select
                value={category}
                onChange={e => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl 
                         focus:ring-4 focus:ring-blue-500/25 focus:border-blue-500 transition-all duration-200
                         shadow-sm hover:shadow-md"
              >
                <option value="">Tất cả loại xe</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Fuel Filter */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-lg">Nhiên liệu</h4>
              <div className="grid grid-cols-2 gap-2">
                {['Xăng', 'Dầu', 'Điện', 'Khác'].map(type => (
                  <button
                    key={type}
                    onClick={() => toggleFuelType(type)}
                    className={`px-4 py-3 rounded-xl border-2 font-medium transition-all duration-300 text-center
                      ${fuelTypes.includes(type)
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-lg transform scale-105'
                        : 'bg-white/50 text-gray-700 border-gray-200 hover:border-blue-400 hover:shadow-md hover:bg-blue-50'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Seats Filter */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-lg">Số chỗ ngồi</h4>
              <select
                value={seats[0] || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setSeats(value ? [value] : []);
                  setPage(1);
                }}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl 
                         focus:ring-4 focus:ring-blue-500/25 focus:border-blue-500 transition-all duration-200
                         shadow-sm hover:shadow-md"
              >
                <option value="">Chọn số ghế</option>
                {Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={String(num)}>
                    {num} chỗ ngồi
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-lg">Năm sản xuất</h4>
              <div className="flex gap-3">
                <select
                  value={yearFrom}
                  onChange={e => { setYearFrom(e.target.value); setPage(1); }}
                  className="flex-1 px-3 py-3 bg-white/50 border border-gray-200 rounded-xl 
                           focus:ring-4 focus:ring-blue-500/25 focus:border-blue-500 transition-all duration-200
                           shadow-sm hover:shadow-md"
                >
                  <option value="">Từ năm</option>
                  {Array.from({ length: 11 }, (_, i) => 2015 + i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>

                <select
                  value={yearTo}
                  onChange={e => { setYearTo(e.target.value); setPage(1); }}
                  className="flex-1 px-3 py-3 bg-white/50 border border-gray-200 rounded-xl 
                           focus:ring-4 focus:ring-blue-500/25 focus:border-blue-500 transition-all duration-200
                           shadow-sm hover:shadow-md"
                >
                  <option value="">Đến năm</option>
                  {Array.from({ length: 11 }, (_, i) => 2015 + i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 text-lg">Khoảng giá (VNĐ)</h4>
              <div className="px-2">
                <Slider
                  range
                  min={0}
                  max={2000000000}
                  step={10000000}
                  value={priceRange}
                  onChange={(val: number | number[]) => {
                    if (Array.isArray(val)) setPriceRange([val[0], val[1]]);
                  }}
                  allowCross={false}
                  trackStyle={[{ backgroundColor: '#2563EB', height: 6 }]}
                  handleStyle={[
                    { backgroundColor: '#2563EB', border: '3px solid #fff', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' },
                    { backgroundColor: '#2563EB', border: '3px solid #fff', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }
                  ]}
                  railStyle={{ backgroundColor: '#E5E7EB', height: 6 }}
                />
                <div className="flex justify-between text-sm font-medium text-gray-600 mt-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg">
                    {priceRange[0].toLocaleString()}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg">
                    {priceRange[1].toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* KM Filter */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 text-lg">Số km đã đi</h4>
              <div className="px-2">
                <Slider
                  range
                  min={0}
                  max={200000}
                  step={1000}
                  value={kmRange}
                  onChange={(val: number | number[]) => {
                    if (Array.isArray(val)) setKmRange([val[0], val[1]]);
                  }}
                  allowCross={false}
                  trackStyle={[{ backgroundColor: '#0D9488', height: 6 }]}
                  handleStyle={[
                    { backgroundColor: '#0D9488', border: '3px solid #fff', boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)' },
                    { backgroundColor: '#0D9488', border: '3px solid #fff', boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)' }
                  ]}
                  railStyle={{ backgroundColor: '#E5E7EB', height: 6 }}
                />
                <div className="flex justify-between text-sm font-medium text-gray-600 mt-3">
                  <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-lg">
                    {kmRange[0].toLocaleString()} km
                  </span>
                  <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-lg">
                    {kmRange[1].toLocaleString()} km
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Car List */}
        <main className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {totalProducts > 0 ? `${totalProducts.toLocaleString()} xe được tìm thấy` : 'Danh sách xe'}
            </h2>
            <div className="text-sm text-gray-600 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-lg">
              Trang {page} / {totalPages}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-xl mb-4"></div>
                  <div className="space-y-3">
                    <div className="bg-gray-300 h-6 rounded-lg w-3/4"></div>
                    <div className="bg-gray-300 h-4 rounded-lg w-1/2"></div>
                    <div className="bg-gray-300 h-4 rounded-lg w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : cars.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CarIcon className="text-gray-400" size={48} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy xe nào</h3>
                <p className="text-gray-600 mb-6">
                  Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm khác
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                             transition-colors duration-200 shadow-lg hover:shadow-xl"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {cars.map((car, index) => (
                <div 
                  key={car.id} 
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CarCard car={car} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg
                  ${page === 1
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:scale-105'}`}
              >
                <ChevronLeft size={20} />
                Trang trước
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i));
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-12 h-12 rounded-xl font-semibold transition-all duration-200
                        ${page === pageNum
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110'
                          : 'bg-white/70 text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-sm'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg
                  ${page === totalPages
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:scale-105'}`}
              >
                Trang sau
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </main>
      </div>

      <Services />
      <Footer />
    </div>
  );
};

export default CarListing;