import React, { useState, useEffect } from "react";
import { Phone, Mail, MapPin, Menu, LogInIcon, ChevronDown, X, User, Settings, ShoppingBag, Heart, LogOut, Bell, CreditCard, ShoppingCart, Plus, Minus, Trash2, Bot } from "lucide-react";
import LogoutOnInactivity from './LogoutOnInactivity';
import { useNavigate } from "react-router-dom";
import axios from "axios";

// 🔹 Định nghĩa kiểu dữ liệu Category
type Category = {
  id: number;
  name: string;
  description: string;
  image: string;
  isActive: boolean;
};

// 🔹 Định nghĩa kiểu dữ liệu CartItem
// 🔹 Dữ liệu từ API trả về (nguyên gốc từ DB)
export type CartItemAPI = {
  id: number; // cartItemId
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    category?: { id: number; name: string } | string | null;
  };
  color?: {
    id: number;
    name: string;
    hex: string;
  } | null;
};

// 🔹 Dữ liệu dùng trong React state (flatten cho dễ xử lý)
export interface CartItem {
  id: number;          // cartItemId từ DB
  productId: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  category: string;
  color?: {
    id: number;
    name: string;
    hex: string;
  } | null;
}

// 🔹 API response chuẩn
export interface CartResponse {
  cart: {
    items: CartItemAPI[];
  };
}



const BASE_URL = "http://localhost:3000";

const Header = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:3000/api/cart/getcartuser", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: CartResponse = await res.json();

      setCartItems(
        data.cart.items.map((item) => ({
          id: item.id,                // cartItemId
          productId: item.product.id,
          name: item.product.name,
          image: item.product.image,
          price: item.product.price,
          quantity: item.quantity,
          // flatten khi fetch
          category: typeof item.product.category === 'string'
            ? item.product.category
            : item.product.category?.name || 'Unknown',

          color: item.color ?? null,
        }))
      );
    };

    fetchCart();
  }, []);






  // 🔹 Tính tổng tiền giỏ hàng
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };


  // 🔹 Tính tổng số lượng sản phẩm
  const getTotalItems = () => {
    return cartItems.length;
  };


  // 🔹 Cập nhật số lượng sản phẩm (Frontend)
  const updateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(cartItemId); // nhớ cũng sửa remove API nhận cartItemId
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
        body: JSON.stringify({
          cartItemId,
          quantity: newQuantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Lỗi khi cập nhật giỏ hàng");
        return;
      }

      // ✅ Cập nhật lại state local
      setCartItems(prev =>
        prev.map(item =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );

    } catch (error) {
      console.error("❌ Lỗi updateQuantity:", error);
    }
  };


  // 🔹 Xóa sản phẩm khỏi giỏ hàng 
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
        // Thử đọc text để debug lỗi (có thể là HTML)
        const errorText = await response.text();
        console.error("❌ Lỗi API:", errorText);
        alert("Lỗi khi xóa sản phẩm");
        return;
      }

      // ✅ Chỉ parse JSON khi chắc chắn là JSON
      const data = await response.json();
      console.log("✅ Xóa thành công:", data);

      setCartItems(prev => prev.filter(item => item.id !== cartItemId));
    } catch (error) {
      console.error("❌ Lỗi removeItem:", error);
    }
  };






  // 🔹 Format tiền VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // 🔹 Logout
  const handleLogout = () => {
    setUserName(null);
    setUserAvatar(null);
    setUserEmail(null);
    localStorage.removeItem("userName");
    localStorage.removeItem("userAvatar");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("token");
    navigate("/");
    setActiveDropdown(null);
  };

  // 🔹 Lấy user info từ localStorage
  useEffect(() => {
    const name = localStorage.getItem("userName");
    const avatar = localStorage.getItem("userAvatar");
    const email = localStorage.getItem("userEmail");
    setUserName(name);
    setUserAvatar(avatar);
    setUserEmail(email);

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "userName") setUserName(event.newValue);
      if (event.key === "userAvatar") setUserAvatar(event.newValue);
      if (event.key === "userEmail") setUserEmail(event.newValue);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // 🔹 Fetch categories từ backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/category/allCategory`);
        setCategories(res.data.categories || []);
      } catch (error) {
        console.error("❌ Lỗi khi lấy category:", error);
      }
    };
    fetchCategories();
  }, []);

  const services = [
    "Bảo dưỡng định kỳ",
    "Sửa chữa chuyên nghiệp",
    "Đăng ký xe",
    "Bảo hiểm xe",
    "Cho thuê xe",
    "Thu mua xe cũ"
  ];

  const userMenuItems = [
    {
      icon: User,
      label: "Thông tin cá nhân",
      action: () => navigate("/profile"),
      color: "text-blue-600"
    },
    {
      icon: ShoppingBag,
      label: "Đơn hàng của tôi",
      action: () => navigate("/myorders"),
      color: "text-green-600"
    },
    {
      icon: Heart,
      label: "Xe yêu thích",
      action: () => navigate("/favorites"),
      color: "text-red-500"
    },
    {
      icon: CreditCard,
      label: "Phương thức thanh toán",
      action: () => navigate("/payment-methods"),
      color: "text-purple-600"
    },
    {
      icon: Bell,
      label: "Thông báo",
      action: () => navigate("/notifications"),
      color: "text-yellow-600"
    },
    {
      icon: Settings,
      label: "Cài đặt",
      action: () => navigate("/settings"),
      color: "text-gray-600"
    },
    {
      icon: Bot,
      label: "Chat AI",
      action: () => navigate("/chatai"),
      color: "text-blue-600"
      ,
    }

  ];

  const handleViewCategory = (categoryId: number) => {
    navigate(`/cars?category=${categoryId}`);
  };

  // 🔹 Hàm tạo url ảnh
  const getImageUrl = (image?: string) => {
    if (!image) return `${BASE_URL}/uploads/default.png`;
    return image.startsWith("http") ? image : `${BASE_URL}${image}`;
  };

  // 🔹 Tạo avatar fallback
  const getAvatarFallback = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      <LogoutOnInactivity onLogout={handleLogout} />

      {/* Top Bar */}
      <div className="bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 text-white py-3 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10"></div>
        <div className="container mx-auto flex justify-between items-center text-sm relative z-10">
          {/* Contact Info */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2 hover:text-blue-300 cursor-pointer transition-colors">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <span className="font-medium">0365515124</span>
            </div>
            <div className="flex items-center space-x-2 hover:text-blue-300 cursor-pointer transition-colors">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <span className="font-medium">huy126347@gmail.com</span>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2 hover:text-blue-300 transition-colors">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="font-medium">473 Ymom, Buôn Ma Thuột, Daklak</span>
            </div>

            {userName ? (
              <div className="relative">
                {/* User Info Button */}
                <button
                  onClick={() => setActiveDropdown(activeDropdown === "user" ? null : "user")}
                  className="flex items-center space-x-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-4 py-2 rounded-full border border-blue-400/30 cursor-pointer hover:from-blue-500/30 hover:to-cyan-500/30 transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/20">
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt={userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {getAvatarFallback(userName)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-blue-200 text-sm font-medium">Xin chào!</span>
                    <span className="text-white font-semibold text-sm">{userName}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-blue-300 transition-transform duration-200 ${activeDropdown === "user" ? "rotate-180" : ""}`} />
                </button>

              </div>
            ) : (
              <a
                href="/login"
                className="flex items-center space-x-2 hover:text-blue-300 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 px-4 py-2 rounded-full border border-blue-400/30 transition-all duration-300 hover:from-blue-600/30 hover:to-cyan-600/30"
              >
                <LogInIcon className="w-4 h-4" />
                <span className="font-medium">Đăng nhập</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* User Popup Overlay */}
      {activeDropdown === "user" && (
        <div className="fixed inset-0 z-[9999]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setActiveDropdown(null)}
          ></div>

          {/* Popup */}
          <div className="absolute top-20 right-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 animate-in slide-in-from-top-2 duration-200">
            {/* User Header */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-2xl border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-3 border-white shadow-lg">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={userName || "User"}   // 🔹 nếu null thì dùng "User"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">
                        {getAvatarFallback(userName || "U")}  // 🔹 fallback nếu null
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{userName}</h3>
                  {userEmail && (
                    <p className="text-sm text-gray-500">{userEmail}</p>
                  )}
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-green-600 ml-2 font-medium">Online</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveDropdown(null)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {userMenuItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      item.action();
                      setActiveDropdown(null);
                    }}
                    className="flex items-center space-x-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 hover:shadow-sm group"
                  >
                    <div className={`w-10 h-10 rounded-lg ${item.color} bg-opacity-10 flex items-center justify-center group-hover:bg-opacity-20 transition-colors`}>
                      <IconComponent className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <span className="font-medium flex-1">{item.label}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400 rotate-[-90deg] group-hover:text-gray-600" />
                  </button>
                );
              })}
            </div>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => {
                  handleLogout();
                  setActiveDropdown(null);
                }}
                className="flex items-center space-x-3 w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                  <LogOut className="w-5 h-5 text-red-600" />
                </div>
                <span className="font-semibold">Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Popup Overlay */}
      {activeDropdown === "cart" && (
        <div className="fixed inset-0 z-[9999]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setActiveDropdown(null)}
          ></div>

          {/* Cart Popup */}
          <div className="absolute top-20 right-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 animate-in slide-in-from-top-2 duration-200 max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-2xl border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Giỏ hàng</h3>
                  <p className="text-sm text-gray-500">{getTotalItems()} sản phẩm</p>
                </div>
              </div>
              <button
                onClick={() => setActiveDropdown(null)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Giỏ hàng trống</p>
                  <p className="text-sm text-gray-400">Thêm sản phẩm để bắt đầu mua sắm</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-gray-500 mb-1">{item.category}</p>

                      {item.color && (
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs text-gray-600">Màu:</span>
                          <span className="text-xs font-medium">{item.color.name}</span>
                          <span
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: item.color.hex }}
                          />
                        </div>
                      )}

                      <p className="font-bold text-blue-600 text-sm">{formatPrice(item.price)}</p>
                    </div>


                    <div className="flex flex-col items-end space-y-2">


                      {/* Quantity Controls */}



                      <div className="flex items-center space-x-2">
                        {/* Giảm số lượng */}
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)} // ✅ item.id = cartItemId
                          className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3 h-3 text-gray-600" />
                        </button>

                        {/* Hiển thị số lượng */}
                        <span className="font-semibold text-sm min-w-[20px] text-center">
                          {item.quantity}
                        </span>

                        {/* Tăng số lượng */}
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)} // ✅
                          className="w-6 h-6 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3 h-3 text-blue-600" />
                        </button>
                      </div>

                      {/* Nút xóa sản phẩm */}
                      <button
                        onClick={() => removeItem(item.id)} // ✅ item.id = cartItemId
                        className="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </button>



                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 bg-gray-50 rounded-b-2xl border-t border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-gray-900">Tổng cộng:</span>
                  <span className="font-bold text-xl text-blue-600">{formatPrice(getTotalPrice())}</span>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      navigate("/cart");
                      setActiveDropdown(null);
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
                  >
                    Xem giỏ hàng
                  </button>
                  {/* <button
                    onClick={() => {
                      navigate("/checkout");
                      setActiveDropdown(null);
                    }}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
                  >
                    Thanh toán ngay
                  </button> */}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className="bg-white shadow-xl sticky top-0 z-50 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center space-x-4 group cursor-pointer" onClick={() => navigate("/")}>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="text-white font-black text-xl">VIN</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 group-hover:text-blue-700 transition-colors">VinFast</h1>
                <p className="text-sm text-gray-500">Showroom xe hàng đầu Việt Nam</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <a href="/" className="px-4 py-2 text-gray-700 hover:text-blue-600 font-semibold transition-colors">Trang chủ</a>

              {/* Thể loại xe */}
              <div
                className="relative group"
                onMouseEnter={() => setActiveDropdown("cars")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center space-x-1 px-4 py-2 text-gray-700 hover:text-blue-600 font-semibold transition-colors">
                  <span>Thể loại xe</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === "cars" ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown categories */}
                <div
                  className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[600px] bg-white rounded-2xl shadow-2xl border transition-all duration-300 z-[9999] ${activeDropdown === "cars" ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-4"}`}
                >
                  <div className="p-6 grid grid-cols-2 gap-4">
                    {categories.map((category) => {
                      const imgUrl = getImageUrl(category.image);
                      return (
                        <div
                          key={category.id}
                          className="cursor-pointer flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition group"
                          onClick={() => {
                            handleViewCategory(category.id);
                            setActiveDropdown(null);
                          }}
                        >
                          <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:shadow-lg transition-shadow">
                            {category.image ? (
                              <img
                                src={imgUrl}
                                alt={category.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-bold text-lg">
                                {category.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{category.name}</h3>
                            <p className="text-sm text-gray-500">{category.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 text-center border-t">
                    <button
                      onClick={() => {
                        navigate("/cars");
                        setActiveDropdown(null);
                      }}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-shadow"
                    >
                      Xem tất cả xe
                    </button>
                  </div>
                </div>
              </div>

              <a href="/cars" className="px-4 py-2 text-gray-700 hover:text-blue-600 font-semibold transition-colors">Sản phẩm</a>

              {/* Dịch vụ */}
              <div
                className="relative group"
                onMouseEnter={() => setActiveDropdown("services")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center space-x-1 px-4 py-2 text-gray-700 hover:text-blue-600 font-semibold transition-colors">
                  <span>Dịch vụ</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === "services" ? "rotate-180" : ""}`} />
                </button>

                <div
                  className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-white rounded-xl shadow-2xl border transition-all duration-300 z-[9999] ${activeDropdown === "services" ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-4"}`}
                >
                  <div className="p-6 space-y-2">
                    {services.map((service, index) => (
                      <a
                        key={index}
                        href="#"
                        className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        onClick={() => setActiveDropdown(null)}
                      >
                        {service}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <a href="/contact" className="px-4 py-2 text-gray-700 hover:text-blue-600 font-semibold transition-colors">Liên hệ</a>
            </nav>

            {/* CTA & Cart */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Shopping Cart */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === "cart" ? null : "cart")}
                  className="relative p-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-cyan-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 group"
                >
                  <ShoppingCart className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />

                  {/* Badge */}
                  {getTotalItems() > 0 && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-lg">
                      {getTotalItems() > 99 ? '99+' : getTotalItems()}
                    </div>
                  )}

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </div>

              {/* Consultation Button */}
              <button className="bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-shadow">
                Tư vấn miễn phí
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`lg:hidden transition-all duration-300 overflow-hidden ${isMenuOpen ? "max-h-screen opacity-100 pb-6" : "max-h-0 opacity-0"}`}>
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <a href="/" className="block px-4 py-3 text-gray-700 hover:text-blue-600 transition-colors">Trang chủ</a>

              {/* Mobile Cart */}
              <button
                onClick={() => {
                  setActiveDropdown(activeDropdown === "cart" ? null : "cart");
                  setIsMenuOpen(false);
                }}
                className="flex items-center justify-between w-full px-4 py-3 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="font-medium">Giỏ hàng</span>
                </div>
                {getTotalItems() > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              {/* User Menu Mobile */}
              {userName && (
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      {userAvatar ? (
                        <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                          <span className="text-white font-bold">{getAvatarFallback(userName)}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{userName}</p>
                      {userEmail && <p className="text-sm text-gray-500">{userEmail}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {userMenuItems.slice(0, 3).map((item, index) => {
                      const IconComponent = item.icon;
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            item.action();
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center space-x-3 w-full text-left px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                        >
                          <IconComponent className="w-4 h-4" />
                          <span className="text-sm">{item.label}</span>
                        </button>
                      );
                    })}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Thể loại xe (mobile) */}
              <div className="space-y-2">
                <div className="px-4 py-2 text-gray-900 font-bold text-sm uppercase">Thể loại xe</div>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      handleViewCategory(category.id);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full text-left px-6 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    {category.image ? (
                      <img
                        src={getImageUrl(category.image)}
                        alt={category.name}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold">
                        {category.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </div>

              {/* Dịch vụ (mobile) */}
              <div className="space-y-2">
                <div className="px-4 py-2 text-gray-900 font-bold text-sm uppercase">Dịch vụ</div>
                {services.map((service, index) => (
                  <a key={index} href="#" className="block px-6 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    {service}
                  </a>
                ))}
              </div>

              <a href="/contact" className="block px-4 py-3 text-gray-700 hover:text-blue-600 transition-colors">Liên hệ</a>

              <div className="pt-4">
                <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg">
                  Tư vấn miễn phí
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;