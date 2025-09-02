import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingCart, Check } from 'lucide-react';

interface Color {
  id: number;
  name: string;
  hex: string;
  gradient?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  colors?: Color[];
}

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onAddToCart: (data: { 
    productId: number; 
    colorId: number | null; 
    quantity: number 
  }) => void;
}


const AddToCartModal: React.FC<AddToCartModalProps> = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
}) => {
  const [selectedColorId, setSelectedColorId] = useState<number | null>(
    product.colors && product.colors.length > 0 ? product.colors[0].id : null
  );
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

 const handleSubmit = async () => {
  if (product.colors && product.colors.length > 0 && selectedColorId === null) return;

  setIsSubmitting(true);

  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Bạn phải đăng nhập');

    const response = await fetch('http://localhost:3000/api/cart/addcart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId: product.id,
        quantity,
        colorId: selectedColorId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Thêm vào giỏ hàng thất bại');
    }

    // ✅ Gửi item mới lên parent để cập nhật giỏ hàng
    onAddToCart({
      productId: product.id,
      colorId: selectedColorId,
      quantity,
    });

    // Reset
    onClose();
    setSelectedColorId(product.colors && product.colors.length > 0 ? product.colors[0].id : null);
    setQuantity(1);
  } catch (error: unknown) {
    if (error instanceof Error) {
      alert(error.message);
    } else {
      alert('Có lỗi xảy ra');
    }
  } finally {
    setIsSubmitting(false);
  }
};




  

  const incrementQuantity = () => {
    if (quantity < 10) setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const totalPrice = product.price * quantity;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <ShoppingCart className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Thêm vào giỏ hàng</h2>
              <p className="text-blue-100 text-sm">Chọn màu sắc và số lượng</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Product Info */}
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg border-2 border-white shadow-md"
              />
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{product.name}</h3>
              <p className="text-blue-600 font-bold text-lg">
                {product.price.toLocaleString('vi-VN')} ₫
              </p>
            </div>
          </div>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h4 className="font-semibold text-gray-900">Chọn màu sắc</h4>
                <span className="text-red-500">*</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColorId(color.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                      selectedColorId === color.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-10 h-10 rounded-full border-3 border-white shadow-lg"
                        style={{ background: color.gradient || color.hex }}
                      ></div>
                      <span className="font-medium text-gray-700">{color.name}</span>
                    </div>
                    {selectedColorId === color.id && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <h4 className="font-semibold text-gray-900">Số lượng</h4>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
              <span className="text-gray-700 font-medium">Chọn số lượng:</span>
              <div className="flex items-center space-x-4">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                >
                  <Minus className="h-4 w-4 text-gray-600" />
                </button>
                <div className="w-16 h-10 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-lg text-gray-900">{quantity}</span>
                </div>
                <button
                  onClick={incrementQuantity}
                  disabled={quantity >= 10}
                  className="w-10 h-10 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                >
                  <Plus className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Tổng cộng:</p>
                <p className="text-sm text-gray-500">
                  {product.price.toLocaleString('vi-VN')} ₫ × {quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  {totalPrice.toLocaleString('vi-VN')} ₫
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (product.colors && product.colors.length > 0 && selectedColorId === null)}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang thêm...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  <span>Thêm vào giỏ</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;
