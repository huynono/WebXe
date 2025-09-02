// components/CarCard.tsx
import React from 'react';
import { Calendar, Users, Gauge } from 'lucide-react';
import { Car } from './types/car';
import { useNavigate } from 'react-router-dom';

interface CarCardProps {
  car: Car;
}

const CarCard: React.FC<CarCardProps> = ({ car }) => {
  const navigate = useNavigate();

  const formatPrice = (price?: number) =>
    price != null ? price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ';
  const formatMileage = (km?: number) =>
    km != null ? km.toLocaleString('vi-VN') : '—';
  const getFuelColor = (fuelType?: string) => {
    if (!fuelType) return 'bg-gray-100 text-gray-800';
    switch (fuelType.toLowerCase()) {
      case 'xăng':
        return 'bg-green-100 text-green-800';
      case 'dầu':
        return 'bg-yellow-100 text-yellow-800';
      case 'điện':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
     onClick={() => navigate(`/product/${car.slug || car.id}`)}
    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {car.image && car.image.startsWith('http') ? (
          <img
            src={car.image}
            alt={car.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-300" />
        )}
        {car.fuelType && (
          <div className="absolute top-3 left-3">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getFuelColor(car.fuelType)}`}
            >
              {car.fuelType}
            </span>
          </div>
        )}
        {car.category && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
            <span className="text-xs font-semibold text-gray-700">{car.category}</span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-3">{car.name}</h3>
        <div className="text-2xl font-bold text-blue-600 mb-4">{formatPrice(car.price)}</div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={14} />
              <span>Năm sản xuất</span>
            </div>
            <span className="font-medium text-gray-900">{car.year || '—'}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Gauge size={14} />
              <span>Số km</span>
            </div>
            <span className="font-medium text-gray-900">{formatMileage(car.km)} km</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Users size={14} />
              <span>Số chỗ ngồi</span>
            </div>
            <span className="font-medium text-gray-900">{car.seats || '—'} chỗ</span>
          </div>
        </div>

        <button
          onClick={() => navigate(`/product/${car.slug || car.id}`)}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  );
};

export default CarCard;
