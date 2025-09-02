import React, { useState, useEffect } from 'react';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingCart, Package, Heart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { emitter } from './types/emitter';
import { CartItem } from './types/types';

export interface CartApiItem {
  id: number; // cartItemId
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    image?: string | null;
    category?: { id: number; name: string } | string | null;
    year?: number | null;
    km?: number | null;
    fuelType?: string | null;
    seats?: number | null;
  };
  color?: { id: string; name: string } | null;
}

export interface CartApiResponse {
  message: string;
  cart: {
    id: number;
    userId: number;
    items: CartApiItem[];
  } | null;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Key duy nhất cho từng item (product + color)
  const getCartItemKey = (item: CartItem) =>
    item.color ? `${item.cartItemId}-${item.color}` : `${item.cartItemId}-default`;

  // Fetch giỏ hàng
  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/cart/getcartuser', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      if (!res.ok) throw new Error('Không thể lấy giỏ hàng');

      const data: CartApiResponse = await res.json();
      const cartArray: CartItem[] = (data.cart?.items ?? []).map(item => ({
        cartItemId: item.id,
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image || '/placeholder.png',
        category: typeof item.product.category === 'string'
          ? item.product.category
          : item.product.category?.name || 'Unknown',
        year: item.product.year ?? 0,
        km: item.product.km ?? 0,
        fuelType: item.product.fuelType || 'Unknown',
        seats: item.product.seats ?? 0,
        color: item.color?.name || 'Unknown',
      }));
      setCartItems(cartArray);
    } catch (error) {
      console.error(error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Lắng nghe sự kiện cập nhật giỏ hàng
  useEffect(() => {
    const handler = (newItem: CartItem) => {
      setCartItems(prev => {
        const existing = prev.find(item => item.cartItemId === newItem.cartItemId);
        if (existing) {
          return prev.map(item =>
            item.cartItemId === newItem.cartItemId
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item
          );
        } else {
          return [...prev, newItem];
        }
      });
    };
    emitter.on('cartUpdated', handler);

    const removeHandler = (removedId: number) => {
      setCartItems(prev => prev.filter(item => item.cartItemId !== removedId));
    };
    emitter.on('cartItemRemoved', removeHandler);

    return () => {
      emitter.off('cartUpdated', handler);
      emitter.off('cartItemRemoved', removeHandler);
    };
  }, []);

  // Toggle checkbox
  const toggleSelectItem = (key: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  };

  // Update số lượng
  const updateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(cartItemId);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Bạn phải đăng nhập");
        return;
      }

      const response = await fetch("http://localhost:3000/api/cart/updatecart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ cartItemId, quantity: newQuantity }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Lỗi khi cập nhật giỏ hàng");
        return;
      }

      setCartItems(prev =>
        prev.map(item =>
          item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );

    } catch (error) {
      console.error("❌ Lỗi updateQuantity:", error);
    }
  };

  // Xóa sản phẩm
  const removeItem = async (cartItemId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Bạn phải đăng nhập");
        return;
      }

      const response = await fetch(`http://localhost:3000/api/cart/deletecart/${cartItemId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Lỗi API:", errorText);
        alert("Lỗi khi xóa sản phẩm");
        return;
      }

      const data = await response.json();
      console.log("✅ Xóa thành công:", data);

      setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
      emitter.emit("cartItemRemoved", cartItemId);

    } catch (error) {
      console.error("❌ Lỗi removeItem:", error);
    }
  };

  // Tổng tiền & số lượng của item được chọn
  const getSelectedTotalPrice = () =>
    cartItems.reduce(
      (total, item) =>
        selectedItems.has(getCartItemKey(item)) ? total + item.price * item.quantity : total,
      0
    );

  const getSelectedTotalQuantity = () =>
    cartItems.reduce(
      (total, item) =>
        selectedItems.has(getCartItemKey(item)) ? total + item.quantity : total,
      0
    );

  const getSelectedTotalItems = () => selectedItems.size;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-10 shadow-2xl border border-slate-200/50">
          <div className="w-20 h-20 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">Đang tải giỏ hàng</h2>
          <p className="text-slate-600">Vui lòng chờ trong giây lát...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header với gradient tinh tế */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl shadow-slate-200/50 border-b border-slate-200/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate(-1)}
                className="group p-3 hover:bg-slate-100/60 rounded-xl transition-all duration-200 hover:shadow-lg"
              >
                <ArrowLeft className="w-6 h-6 text-slate-700 group-hover:text-slate-900 transition-colors" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  Giỏ hàng của bạn
                </h1>
                <p className="text-slate-600 mt-2 flex items-center space-x-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                  <span>{getSelectedTotalItems()} sản phẩm được chọn</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full mx-3"></span>
                  <span>{getSelectedTotalQuantity()} chiếc</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {cartItems.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-36 h-36 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <ShoppingCart className="w-20 h-20 text-slate-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Giỏ hàng trống</h2>
            <p className="text-slate-600 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
              Hãy khám phá bộ sưu tập xe hơi tuyệt vời của chúng tôi và thêm những chiếc xe yêu thích vào giỏ hàng
            </p>
            <button
              onClick={() => navigate('/cars')}
              className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
            >
              Khám phá xe hơi
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="xl:col-span-2 space-y-8">
              {cartItems.map(item => {
                const key = getCartItemKey(item);
                const isSelected = selectedItems.has(key);
                return (
                  <div
                    key={key}
                    className={`group bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${isSelected
                        ? 'border-slate-300 ring-2 ring-slate-200/50 shadow-slate-300/50'
                        : 'border-slate-200/60 hover:border-slate-300'
                      }`}
                  >
                    <div className="p-8">
                      <div className="flex flex-col lg:flex-row gap-8">
                        {/* Checkbox & Image */}
                        <div className="flex items-start space-x-6">
                          <label className="flex items-center cursor-pointer mt-4">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectItem(key)}
                                className="w-6 h-6 text-slate-700 rounded-lg border-2 border-slate-300 focus:ring-slate-500 focus:ring-2 transition-all"
                              />
                              {isSelected && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div className="w-3 h-3 bg-slate-700 rounded-sm"></div>
                                </div>
                              )}
                            </div>
                          </label>

                          <div className="relative group/image">
                            <div className="w-56 h-40 lg:w-72 lg:h-52 rounded-2xl overflow-hidden shadow-lg">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <button className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-xl opacity-0 group-hover/image:opacity-100 transition-all duration-200 hover:scale-110">
                              <Heart className="w-5 h-5 text-slate-600" />
                            </button>
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 space-y-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-4">
                              <h3 className="text-2xl font-bold text-slate-900 leading-tight group-hover:text-slate-700 transition-colors">
                                {item.name}
                              </h3>

                              <div className="flex flex-wrap gap-3">
                                <span className="px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded-full text-sm font-semibold shadow-inner">
                                  {item.category}
                                </span>
                                {item.year && (
                                  <span className="px-4 py-2 bg-slate-50 text-slate-600 rounded-full text-sm border border-slate-200">
                                    Đời {item.year}
                                  </span>
                                )}
                                <span className="px-4 py-2 bg-slate-50 text-slate-600 rounded-full text-sm border border-slate-200">
                                  {item.color}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                                {item.km !== undefined && (
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                                    <span>Đã chạy {item.km.toLocaleString()} km</span>
                                  </div>
                                )}
                                {item.fuelType && (
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                                    <span>Nhiên liệu: {item.fuelType}</span>
                                  </div>
                                )}
                                {item.seats !== undefined && (
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                                    <span>Số ghế: {item.seats}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => removeItem(item.cartItemId)}
                              className="group/trash p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                            >
                              <Trash2 className="w-6 h-6 group-hover/trash:scale-110 transition-transform" />
                            </button>
                          </div>

                          {/* Price & Quantity Controls */}
                          <div className="flex justify-between items-end pt-6 border-t border-slate-100">
                            <div className="space-y-1">
                              <p className="text-sm text-slate-500 font-medium">Giá mỗi chiếc</p>
                              <p className="text-3xl font-bold text-slate-800 tracking-tight">
                                {formatPrice(item.price)}
                              </p>
                            </div>

                            <div className="flex items-center space-x-1 bg-slate-50 rounded-2xl p-1 shadow-inner">
                              <button
                                onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                className="w-12 h-12 rounded-xl bg-white hover:bg-slate-100 flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md group/btn"
                              >
                                <Minus className="w-5 h-5 text-slate-600 group-hover/btn:text-slate-800 transition-colors" />
                              </button>
                              <span className="text-xl font-bold text-slate-900 min-w-[3rem] text-center px-4">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-900 flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl group/btn"
                              >
                                <Plus className="w-5 h-5 text-white group-hover/btn:scale-110 transition-transform" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary với thiết kế cao cấp */}
            <div className="xl:col-span-1">
              <div className="sticky top-32">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-50 to-white p-8 border-b border-slate-100">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
                      Chi tiết đơn hàng
                    </h3>
                    <p className="text-slate-600 flex items-center">
                      <Star className="w-4 h-4 mr-2 text-amber-400 fill-current" />
                      {getSelectedTotalItems()} sản phẩm được chọn
                    </p>
                  </div>

                  <div className="p-8">
                    <div className="space-y-6 mb-8">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-700 font-medium">Tạm tính</span>
                        <span className="text-lg font-bold text-slate-800">{formatPrice(getSelectedTotalPrice())}</span>
                      </div>

                      {/* <div className="flex justify-between items-center py-2"> */}
                      {/* <span className="text-slate-700 font-medium">Phí vận chuyển</span> */}
                      {/* <span className="text-emerald-600 font-bold">Miễn phí</span> */}
                      {/* </div> */}

                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-700 font-medium">Thuế VAT (10%)</span>
                        <span className="text-lg font-bold text-slate-800">{formatPrice(getSelectedTotalPrice() * 0.1)}</span>
                      </div>

                      <div className="border-t border-slate-200 pt-6">
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-slate-900">Tổng cộng</span>
                          <div className="text-right">
                            <span className="text-3xl font-bold text-slate-800 tracking-tight">{formatPrice(getSelectedTotalPrice() * 1.1)}</span>
                            <p className="text-sm text-slate-500 mt-1">Đã bao gồm VAT</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={() => {
                          const selectedCartItems = cartItems.filter(item =>
                            selectedItems.has(getCartItemKey(item))
                          );
                          navigate('/checkout', { state: { selectedCartItems } });
                        }}
                        disabled={getSelectedTotalItems() === 0}
                        className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black 
                            disabled:from-slate-300 disabled:to-slate-400 text-white py-5 rounded-2xl font-bold text-lg 
                            transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 
                            disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none group"
                      >
                        <span className="flex items-center justify-center space-x-3">
                          <Package className="w-6 h-6 group-hover:scale-110 transition-transform" />
                          <span>Thanh toán ngay</span>
                        </span>
                      </button>


                      <button
                        onClick={() => navigate('/cars')}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-2xl font-semibold transition-all duration-200 hover:shadow-lg"
                      >
                        Tiếp tục khám phá
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;