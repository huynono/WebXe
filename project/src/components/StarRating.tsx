import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // VD: 4.6
  totalReviews: number; // VD: 127
  showReviews?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  totalReviews, 
  showReviews = true,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const full = star <= Math.floor(rating);
          const half = star === Math.ceil(rating) && rating % 1 !== 0;

          return (
            <Star
              key={star}
              className={`${sizeClasses[size]} ${
                full
                  ? 'text-yellow-400 fill-yellow-400'
                  : half
                  ? 'text-yellow-400 fill-yellow-200'
                  : 'text-gray-300'
              }`}
            />
          );
        })}
      </div>
      <span className={`font-semibold text-gray-900 ${textSizeClasses[size]}`}>
        {rating.toFixed(1)}
      </span>
      {showReviews && (
        <span className={`text-gray-500 ${textSizeClasses[size]}`}>
          ({totalReviews.toLocaleString('vi-VN')} đánh giá)
        </span>
      )}
    </div>
  );
};

export default StarRating;
