import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Users, Package, Eye, EyeOff, Menu, X, Home, Settings, BarChart3, FileText, Shield, Bell, HelpCircle, Tag, Calendar, Clock, CreditCard, Truck, CheckCircle, XCircle, AlertCircle, DollarSign, MapPin, Phone, Mail, User, Star, MessageSquare, TrendingUp, TrendingDown, Activity, PieChart, BarChart, LineChart } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useNavigate } from "react-router-dom";
import AdminChatWidget from './AdminChatWidget';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
}

interface CustomerGrowthData {
  month: string;
  newCustomers: number;
}

interface BestSellingProduct {
  id: string;
  name: string;
  price: number;
  totalSold: number;
}

interface TopCustomer {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  totalOrders: number;
}




// Types
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  agreedToTerms: boolean;
  createdAt: string | Date;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  createdAt: string | Date;
  isActive: boolean;
}

interface Product {
  id: string;
  name: string;
  productionYear: number;
  price: number;
  fuelType: string;
  year: number;
  warranty: string;
  power: string;
  seats: number;
  discount: number;
  image?: string;
  km: number;
  quantity: number;
  createdAt: string | Date;
  isActive: boolean;
}

interface Voucher {
  id: number;
  code: string;
  description?: string;
  image?: string;
  discountType: "percent" | "fixed" | "freeship";
  discountValue?: number;
  maxDiscount?: number;
  minOrderValue?: number;
  startDate: string | Date;
  endDate: string | Date;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface ReviewImage {
  id: number;
  url: string;
}

interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  user: {
    id: number;
    name: string;
    email: string;
  };
  product: {
    id: number;
    name: string;
    image?: string;
  };
  images: ReviewImage[];
}

interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  colorId?: number;
  product: {
    id: number;
    name: string;
    image?: string;
  };
  color?: {
    id: number;
    name: string;
    hex?: string;
  };
}

interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  paymentMethod: 'COD' | 'MOMO' | 'BANK';
  status: 'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'failed';
  voucherId?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  address?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    ward: string;
  };
  momoTransactionId?: string;
  momoRequestId?: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  voucher?: {
    id: number;
    code: string;
    discountType: string;
    discountValue?: number;
  };
  items: OrderItem[];
}

type TabId =
  | 'dashboard'
  | 'users'
  | 'products'
  | 'category'
  | 'vouchers'
  | 'reviews'
  | 'reports'
  | 'orders'
  | 'chat'
  | 'settings'
  | 'security'
  | 'notifications'
  | 'help';

interface MenuItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  count?: number;
}

const BASE_URL = 'http://localhost:3000/';
const API_BASE_URL = 'http://localhost:3000/api/dashboard';

interface PopupAddCategoryProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onCategoryAdded?: (category: Category) => void;
  onCategoryUpdated?: (category: Category) => void;
}

interface PopupAddVoucherProps {
  isOpen: boolean;
  onClose: () => void;
  voucher?: Voucher | null;
  onVoucherAdded?: (voucher: Voucher) => void;
  onVoucherUpdated?: (voucher: Voucher) => void;
}

interface PopupOrderDetailProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order | null;
  onOrderUpdated?: (order: Order) => void;
}

// Dashboard API Functions
const fetchRevenueData = async (): Promise<RevenueData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/revenue`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<RevenueData[]> = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch revenue data');
    }

    return result.data;
  } catch (error) {
    console.error('🔥 Error fetching revenue data:', error);
    return [];
  }
};

const fetchCustomerGrowthData = async (): Promise<CustomerGrowthData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/customers-growth`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<CustomerGrowthData[]> = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch customer growth data');
    }

    return result.data;
  } catch (error) {
    console.error('🔥 Error fetching customer growth:', error);
    return [];
  }
};

const fetchBestSellingProducts = async (): Promise<BestSellingProduct[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/best-products`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<BestSellingProduct[]> = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch best selling products');
    }

    return result.data;
  } catch (error) {
    console.error('🔥 Error fetching best selling products:', error);
    return [];
  }
};

const fetchTopCustomers = async (): Promise<TopCustomer[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/top-customers`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<TopCustomer[]> = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch top customers');
    }

    return result.data;
  } catch (error) {
    console.error('🔥 Error fetching top customers:', error);
    return [];
  }
};

// Order Detail Popup Component
const PopupOrderDetail: React.FC<PopupOrderDetailProps> = ({
  isOpen,
  onClose,
  order,
  onOrderUpdated,
}) => {
  const [status, setStatus] = useState<Order['status']>('pending');
  const [paymentStatus, setPaymentStatus] = useState<Order['paymentStatus']>('unpaid');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setPaymentStatus(order.paymentStatus);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleUpdateStatus = async () => {
    if (!order) return;
    setIsUpdating(true);

    try {
      const res = await fetch(`http://localhost:3000/api/payment/update-status/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, paymentStatus }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || '❌ Lỗi cập nhật đơn hàng');

      const updatedOrder = { ...order, status, paymentStatus };
      onOrderUpdated?.(updatedOrder);

      alert('✅ Cập nhật đơn hàng thành công');
      onClose();
    } catch (err) {
      console.error('🔥 handleUpdateStatus error:', err);
      alert('❌ ' + (err instanceof Error ? err.message : 'Cập nhật thất bại'));
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-purple-100 text-purple-800 border-purple-200',
      shipping: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      unpaid: 'bg-red-100 text-red-800 border-red-200',
      paid: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      processing: 'Đang xử lý',
      shipping: 'Đang giao hàng',
      delivered: 'Đã giao hàng',
      cancelled: 'Đã hủy',
      unpaid: 'Chưa thanh toán',
      paid: 'Đã thanh toán',
      failed: 'Thanh toán thất bại',
    };
    return labels[status] || status;
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatDateTime = (dateString: string | Date) =>
    new Date(dateString).toLocaleString('vi-VN');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <FileText className="h-6 w-6 mr-3 text-blue-600" />
              Chi tiết đơn hàng #{order.id}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div className="flex flex-wrap gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(order.paymentStatus)}`}>
              {getStatusLabel(order.paymentStatus)}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm border border-gray-200">
              {order.paymentMethod}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Thông tin khách hàng
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-gray-600 w-24">Tên:</span>
                    <span className="font-medium">{order.user?.name || '-'}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 w-22">Email:</span>
                    <span className="font-medium">{order.user?.email || '-'}</span>
                  </div>
                  {order.user?.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600 w-22">SĐT:</span>
                      <span className="font-medium">{order.user.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {order.address && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-green-600" />
                    Địa chỉ giao hàng
                  </h3>
                  <div className="space-y-2">
                    <div className="font-medium">{order.address.fullName}</div>
                    <div className="text-gray-600">{order.address.phone}</div>
                    <div className="text-gray-600">
                      {order.address.address}, {order.address.ward}, {order.address.district}, {order.address.city}
                    </div>
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-blue-600" />
                  Cập nhật trạng thái
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái đơn hàng
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as Order['status'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pending">Chờ xác nhận</option>
                      <option value="confirmed">Đã xác nhận</option>
                      <option value="processing">Đang xử lý</option>
                      <option value="shipping">Đang giao hàng</option>
                      <option value="delivered">Đã giao hàng</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái thanh toán
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as Order['paymentStatus'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="unpaid">Chưa thanh toán</option>
                      <option value="paid">Đã thanh toán</option>
                      <option value="failed">Thanh toán thất bại</option>
                    </select>
                  </div>

                  <button
                    onClick={handleUpdateStatus}
                    disabled={isUpdating}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {isUpdating ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Order Items & Summary */}
            <div className="space-y-6">
              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-purple-600" />
                  Sản phẩm đã đặt ({order.items?.length || 0})
                </h3>

                <div className="space-y-4">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item) => {
                      const product = item.product;

                      if (!product) {
                        return (
                          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="text-gray-500">Sản phẩm không xác định</div>
                          </div>
                        );
                      }

                      return (
                        <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center space-x-4">
                            <img
                              src={product.image || `${BASE_URL}placeholder.jpg`}
                              alt={product.name || 'Sản phẩm'}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{product.name}</h4>

                              {item.color && (
                                <div className="flex items-center mt-1">
                                  <div
                                    className="w-4 h-4 rounded-full border border-gray-300 mr-2"
                                    style={{ backgroundColor: item.color?.hex || '#cccccc' }}
                                  />
                                  <span className="text-sm text-gray-600">{item.color?.name || '-'}</span>
                                </div>
                              )}

                              <div className="flex justify-between items-center mt-2">
                                <span className="text-sm text-gray-600">Số lượng: {item.quantity}</span>
                                <span className="font-semibold text-blue-600">{formatCurrency(item.price)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500">Chưa có sản phẩm nào.</p>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-6 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Tổng kết đơn hàng
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>Tổng cộng:</span>
                    <span className="text-blue-600">{formatCurrency(order.totalAmount)}</span>
                  </div>
                  <div className="text-sm text-gray-500 space-y-1">
                    <div>Ngày đặt: {formatDateTime(order.createdAt)}</div>
                    <div>Cập nhật: {formatDateTime(order.updatedAt)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PopupAddVoucher: React.FC<PopupAddVoucherProps> = ({
  isOpen,
  onClose,
  voucher,
  onVoucherAdded,
  onVoucherUpdated,
}) => {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [discountType, setDiscountType] = useState("percent");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [maxDiscount, setMaxDiscount] = useState<number>(0);
  const [minOrderValue, setMinOrderValue] = useState<number>(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [usageLimit, setUsageLimit] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  // Format date for input
  const formatDateForInput = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (voucher) {
      setCode(voucher.code);
      setDescription(voucher.description || "");
      setDiscountType(voucher.discountType);
      setDiscountValue(voucher.discountValue || 0);
      setMaxDiscount(voucher.maxDiscount || 0);
      setMinOrderValue(voucher.minOrderValue || 0);
      setStartDate(formatDateForInput(voucher.startDate));
      setEndDate(formatDateForInput(voucher.endDate));
      setUsageLimit(voucher.usageLimit || 0);
      setIsActive(voucher.isActive);
      setImage(null);
    } else {
      setCode("");
      setDescription("");
      setDiscountType("percent");
      setDiscountValue(0);
      setMaxDiscount(0);
      setMinOrderValue(0);
      setStartDate("");
      setEndDate("");
      setUsageLimit(0);
      setIsActive(true);
      setImage(null);
    }
  }, [voucher]);

  const validateForm = () => {
    if (!code.trim()) {
      alert("Vui lòng nhập mã voucher");
      return false;
    }
    if (!startDate) {
      alert("Vui lòng chọn ngày bắt đầu");
      return false;
    }
    if (!endDate) {
      alert("Vui lòng chọn ngày kết thúc");
      return false;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      alert("Ngày kết thúc phải sau ngày bắt đầu");
      return false;
    }
    if (discountType !== "freeship" && (!discountValue || discountValue <= 0)) {
      alert("Vui lòng nhập giá trị giảm giá");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("code", code.trim().toUpperCase());
    formData.append("description", description);
    formData.append("discountType", discountType);
    formData.append("discountValue", discountValue.toString());
    formData.append("maxDiscount", maxDiscount.toString());
    formData.append("minOrderValue", minOrderValue.toString());
    formData.append("startDate", new Date(startDate).toISOString());
    formData.append("endDate", new Date(endDate).toISOString());
    formData.append("usageLimit", usageLimit.toString());
    formData.append("isActive", String(isActive));
    if (image) formData.append("image", image);

    try {
      let res, data;
      if (voucher) {
        // Edit
        res = await fetch(`http://localhost:3000/api/voucher/updatevoucher/${voucher.id}`, {
          method: "PUT",
          body: formData,
        });

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server trả về dữ liệu không hợp lệ. Vui lòng kiểm tra console server.");
        }

        data = await res.json();
        if (!res.ok) throw new Error(data.message || "Lỗi cập nhật voucher");
        onVoucherUpdated?.(data.voucher);
        alert("✅ Cập nhật voucher thành công");
      } else {
        // Add
        res = await fetch("http://localhost:3000/api/voucher/createvoucher", {
          method: "POST",
          body: formData,
        });

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server trả về dữ liệu không hợp lệ. Vui lòng kiểm tra console server.");
        }

        data = await res.json();
        if (!res.ok) throw new Error(data.message || "Lỗi tạo voucher");
        onVoucherAdded?.(data.voucher);
        alert("✅ Tạo voucher thành công");
      }
      onClose();
    } catch (err: unknown) {
      console.error("❌ Error details:", err);
      let errorMessage = "Thao tác thất bại";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      alert("❌ " + errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Tag className="h-6 w-6 mr-3 text-purple-600" />
              {voucher ? "Chỉnh sửa voucher" : "Thêm voucher mới"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-600">
            {voucher ? "Cập nhật thông tin voucher hiện tại" : "Tạo voucher giảm giá mới cho khách hàng"}
          </p>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mã voucher */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Mã voucher <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="VD: SALE10, FREESHIP"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Loại giảm giá */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Loại giảm giá <span className="text-red-500">*</span>
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              >
                <option value="percent">Giảm theo phần trăm (%)</option>
                <option value="fixed">Giảm cố định (VND)</option>
                <option value="freeship">Miễn phí vận chuyển</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Giá trị giảm */}
            {discountType !== "freeship" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Giá trị giảm {discountType === "percent" ? "(%)" : "(VND)"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder={discountType === "percent" ? "Nhập %" : "Nhập số tiền"}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  min="0"
                  max={discountType === "percent" ? "100" : undefined}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>
            )}

            {/* Giảm tối đa */}
            {discountType === "percent" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Giảm tối đa (VND)
                </label>
                <input
                  type="number"
                  placeholder="Nhập số tiền giảm tối đa"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(Number(e.target.value))}
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Đơn hàng tối thiểu */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Đơn hàng tối thiểu (VND)
              </label>
              <input
                type="number"
                placeholder="Nhập giá trị đơn hàng tối thiểu"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(Number(e.target.value))}
                min="0"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Giới hạn sử dụng */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Giới hạn sử dụng
              </label>
              <input
                type="number"
                placeholder="Số lần sử dụng tối đa"
                value={usageLimit}
                onChange={(e) => setUsageLimit(Number(e.target.value))}
                min="0"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ngày bắt đầu */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Ngày kết thúc */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Mô tả <span className="text-gray-400">(Tùy chọn)</span>
            </label>
            <textarea
              placeholder="Nhập mô tả chi tiết về voucher"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
            />
          </div>

          {/* Upload Ảnh */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Hình ảnh <span className="text-gray-400">(Tùy chọn)</span>
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                className="hidden"
                id="voucher-image-upload"
              />
              <label
                htmlFor="voucher-image-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Tag className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click để upload</span> hoặc kéo thả
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 10MB)</p>
                </div>
              </label>
              {image && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 flex items-center">
                    <Tag className="w-4 h-4 mr-2" />
                    {image.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Trạng thái hoạt động */}
          <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              id="voucherActive"
              className="h-5 w-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
            />
            <label htmlFor="voucherActive" className="ml-3 flex-1">
              <span className="text-sm font-semibold text-gray-700">Trạng thái hoạt động</span>
              <p className="text-xs text-gray-600">Voucher sẽ có thể sử dụng cho khách hàng</p>
            </label>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 border-2 border-gray-200 hover:border-gray-300"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {voucher ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PopupAddCategory: React.FC<PopupAddCategoryProps> = ({
  isOpen,
  onClose,
  category,
  onCategoryAdded,
  onCategoryUpdated,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || "");
      setIsActive(category.isActive);
      setImage(null);
    } else {
      setName("");
      setDescription("");
      setIsActive(true);
      setImage(null);
    }
  }, [category]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Vui lòng nhập tên danh mục");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", name.toLowerCase().replace(/\s+/g, "-"));
    formData.append("description", description);
    formData.append("isActive", String(isActive));
    if (image) formData.append("image", image);

    try {
      let res, data;
      if (category) {
        res = await fetch(`http://localhost:3000/api/category/updateCategory/${category.id}`, {
          method: "PUT",
          body: formData,
        });

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server trả về dữ liệu không hợp lệ. Vui lòng kiểm tra console server.");
        }

        data = await res.json();
        if (!res.ok) throw new Error(data.message || "Lỗi cập nhật danh mục");
        onCategoryUpdated?.(data.category);
        alert("✅ Cập nhật danh mục thành công");
      } else {
        res = await fetch("http://localhost:3000/api/category/createCategory", {
          method: "POST",
          body: formData,
        });

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server trả về dữ liệu không hợp lệ. Vui lòng kiểm tra console server.");
        }

        data = await res.json();
        if (!res.ok) throw new Error(data.message || "Lỗi tạo danh mục");
        onCategoryAdded?.(data.category);
        alert("✅ Tạo danh mục thành công");
      }
      onClose();
    } catch (err: unknown) {
      console.error("❌ Error details:", err);
      let errorMessage = "Thao tác thất bại";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      alert("❌ " + errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Package className="h-6 w-6 mr-3 text-blue-600" />
              {category ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-600">
            {category ? "Cập nhật thông tin danh mục hiện tại" : "Tạo danh mục mới cho hệ thống"}
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nhập tên danh mục"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Mô tả <span className="text-gray-400">(Tùy chọn)</span>
            </label>
            <textarea
              placeholder="Nhập mô tả chi tiết về danh mục"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Hình ảnh <span className="text-gray-400">(Tùy chọn)</span>
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Package className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click để upload</span> hoặc kéo thả
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 10MB)</p>
                </div>
              </label>
              {image && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    {image.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              id="isActive"
              className="h-5 w-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="isActive" className="ml-3 flex-1">
              <span className="text-sm font-semibold text-gray-700">Trạng thái hoạt động</span>
              <p className="text-xs text-gray-600">Danh mục sẽ hiển thị cho người dùng</p>
            </label>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 border-2 border-gray-200 hover:border-gray-300"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {category ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PopupAddUserProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded?: (user: User) => void;
}

interface PopupEditUserProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onUserUpdated?: (user: User) => void;
}

const PopupEditUser: React.FC<PopupEditUserProps> = ({
  isOpen,
  onClose,
  user,
  onUserUpdated,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setPassword(user.password || "");
      setIsActive(user.agreedToTerms || false);
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setIsActive(true);
    }
  }, [user, isOpen]);

  const validateForm = () => {
    if (!name.trim()) {
      alert("Vui lòng nhập tên người dùng");
      return false;
    }
    if (!email.trim()) {
      alert("Vui lòng nhập email");
      return false;
    }
    if (!email.includes("@")) {
      alert("Email không hợp lệ");
      return false;
    }
    if (!phone.trim()) {
      alert("Vui lòng nhập số điện thoại");
      return false;
    }
    if (phone.length < 10) {
      alert("Số điện thoại phải có ít nhất 10 chữ số");
      return false;
    }
    if (!password.trim()) {
      alert("Vui lòng nhập mật khẩu");
      return false;
    }
    if (password.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user) return;

    const userData = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password: password.trim(),
      agreedToTerms: isActive,
    };

    try {
      const res = await fetch(`http://localhost:3000/api/user/updateuser/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Lỗi cập nhật người dùng");
      }

      const updatedUser = { ...user, ...userData };
      onUserUpdated?.(updatedUser);

      alert("✅ Cập nhật người dùng thành công");
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Cập nhật thất bại";
      alert("❌ " + errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="h-6 w-6 mr-2 text-blue-600" />
              Chỉnh sửa người dùng
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên người dùng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nhập tên người dùng"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="Nhập email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="Nhập số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                maxLength={11}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Mật khẩu phải có ít nhất 6 ký tự</p>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                id="userActive"
                className="h-5 w-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="userActive" className="ml-3 flex-1">
                <span className="text-sm font-semibold text-gray-700">Đồng ý điều khoản</span>
                <p className="text-xs text-gray-500">Người dùng đã đồng ý với điều khoản sử dụng</p>
              </label>
            </div>
          </div>

          <div className="flex space-x-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200 border border-gray-300"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Cập nhật
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PopupAddUser: React.FC<PopupAddUserProps> = ({
  isOpen,
  onClose,
  onUserAdded,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setAgreedToTerms(false);
    setShowPassword(false);
  };

  const validateForm = () => {
    if (!name.trim()) {
      alert("Vui lòng nhập tên người dùng");
      return false;
    }
    if (!email.trim()) {
      alert("Vui lòng nhập email");
      return false;
    }
    if (!email.includes("@")) {
      alert("Email không hợp lệ");
      return false;
    }
    if (!phone.trim()) {
      alert("Vui lòng nhập số điện thoại");
      return false;
    }
    if (phone.length < 10) {
      alert("Số điện thoại phải có ít nhất 10 chữ số");
      return false;
    }
    if (!password.trim()) {
      alert("Vui lòng nhập mật khẩu");
      return false;
    }
    if (password.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }
    if (!agreedToTerms) {
      alert("Người dùng phải đồng ý với điều khoản sử dụng");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    const userData = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password: password.trim(),
      agreedToTerms,
    };

    try {
      const res = await fetch("http://localhost:3000/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Lỗi tạo người dùng");
      }

      onUserAdded?.(data.user);
      alert("✅ Tạo người dùng thành công");
      resetForm();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Tạo người dùng thất bại";
      alert("❌ " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="h-6 w-6 mr-3 text-blue-600" />
              Thêm người dùng mới
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Tạo tài khoản người dùng mới cho hệ thống
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Tên người dùng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nhập tên người dùng"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              maxLength={11}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Mật khẩu phải có ít nhất 6 ký tự</p>
          </div>

          <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              id="userTerms"
              className="h-5 w-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="userTerms" className="ml-3 flex-1">
              <span className="text-sm font-semibold text-gray-700">Đồng ý điều khoản</span>
              <p className="text-xs text-gray-600">Người dùng đồng ý với điều khoản sử dụng</p>
            </label>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 border-2 border-gray-200 hover:border-gray-300"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Đang tạo..." : "Thêm mới"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Updated Chat state to match backend structure

  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(1);

  const [adminEmail, setAdminEmail] = useState<string>('');

  // Category popup states
  const [isCategoryPopupOpen, setIsCategoryPopupOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // User popup states
  const [isUserPopupOpen, setIsUserPopupOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isUserAddPopupOpen, setIsUserAddPopupOpen] = useState<boolean>(false);

  // Voucher popup states
  const [isVoucherPopupOpen, setIsVoucherPopupOpen] = useState<boolean>(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  // Order popup states
  const [isOrderPopupOpen, setIsOrderPopupOpen] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Order filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  // Dashboard Stats
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    averageRating: 0,
    recentOrders: [] as Order[],
    recentReviews: [] as Review[],
    lowStockProducts: [] as Product[]
  });

  // Report Stats - Now with API data
  const [reportStats, setReportStats] = useState({
    monthlyRevenue: [] as RevenueData[],
    customerGrowth: [] as CustomerGrowthData[],
    bestSellingProducts: [] as BestSellingProduct[],
    topCustomers: [] as TopCustomer[],
    orderStatusDistribution: {} as { [key: string]: number },
    revenueGrowthRate: 0,
    orderGrowthRate: 0,
    conversionRate: 0,
    averageOrderValue: 0,
    returningCustomers: 0,
  });

  const [isLoadingReports, setIsLoadingReports] = useState(false);



  // Fetch report data from API
  useEffect(() => {
    const fetchReportData = async () => {
      if (activeTab !== 'reports') return;

      setIsLoadingReports(true);
      try {
        const [revenueData, customerGrowthData, bestProductsData, topCustomersData] = await Promise.all([
          fetchRevenueData(),
          fetchCustomerGrowthData(),
          fetchBestSellingProducts(),
          fetchTopCustomers(),
        ]);

        // Calculate order status distribution from local orders data
        const orderStatusDistribution = orders.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });

        // Calculate growth rates
        const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
        const currentMonth = revenueData[revenueData.length - 1];
        const previousMonth = revenueData[revenueData.length - 2];
        const revenueGrowthRate = previousMonth
          ? ((currentMonth?.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
          : 0;

        const orderGrowthRate = 15.5; // You can calculate this similarly if you have historical order data

        const averageOrderValue = totalRevenue / (orders.length || 1);
        const conversionRate = (orders.length / (users.length || 1)) * 100;
        const returningCustomers = Math.floor(users.length * 0.3); // Mock: 30% returning customers

        setReportStats({
          monthlyRevenue: revenueData,
          customerGrowth: customerGrowthData,
          bestSellingProducts: bestProductsData,
          topCustomers: topCustomersData,
          orderStatusDistribution,
          revenueGrowthRate,
          orderGrowthRate,
          conversionRate,
          averageOrderValue,
          returningCustomers,
        });
      } catch (error) {
        console.error('🔥 Error fetching report data:', error);
      } finally {
        setIsLoadingReports(false);
      }
    };

    fetchReportData();
  }, [activeTab, orders, users]);

  useEffect(() => {
    console.log("🚀 useEffect admin orders started");

    const fetchOrdersWithLog = async () => {
      console.log("📡 Fetching orders...");
      try {
        const res = await fetch("http://localhost:3000/api/payment/getorder");
        const data = await res.json();
        console.log("📦 Fetch result:", data);

        if (res.ok) {
          setOrders(data.orders || []);
          console.log("✅ Orders set:", data.orders?.length);
        } else {
          console.error("❌ API error:", data.message);
        }
      } catch (error) {
        console.error("🔥 Lỗi fetchOrders:", error);
      }
    };

    fetchOrdersWithLog();
  }, []);

  const handleCategoryUpdated = (updatedCategory: Category) => {
    setCategories(prev =>
      prev.map(cat => (cat.id === updatedCategory.id ? updatedCategory : cat))
    );
  };

  const handleUserUpdated = (updatedUser: User) => {
    setUsers(prev =>
      prev.map(user => (user.id === updatedUser.id ? updatedUser : user))
    );
  };

  const handleUserAdded = (newUser: User) => {
    setUsers(prev => [newUser, ...prev]);
  };

  const handleVoucherAdded = (newVoucher: Voucher) => {
    setVouchers(prev => [newVoucher, ...prev]);
  };

  const handleVoucherUpdated = (updatedVoucher: Voucher) => {
    setVouchers(prev =>
      prev.map(voucher => (voucher.id === updatedVoucher.id ? updatedVoucher : voucher))
    );
  };

  const handleOrderUpdated = (updatedOrder: Order) => {
    setOrders(prev =>
      prev.map(order => (order.id === updatedOrder.id ? updatedOrder : order))
    );
  };

  // Fetch data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/user/alluser');
        const data = await res.json();

        if (res.ok) {
          setUsers(data.data);
        } else {
          console.error('Lỗi khi lấy user:', data.message);
        }
      } catch (error) {
        console.error('❌ Lỗi fetch API:', error);
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/product/allProducts?page=${page}`);
        const data = await res.json();

        if (res.ok) {
          setProducts(data.products || []);
          setTotalPages(data.totalPages || 1);
          setTotalProducts(data.total || 0);
        } else {
          console.error("❌ API error:", data.message);
        }
      } catch (error) {
        console.error('🔥 Lỗi fetchProducts:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/category/allCategory');
        const data = await res.json();

        if (res.ok) {
          setCategories(data.categories || []);
        } else {
          console.error("❌ API error:", data.message);
        }
      } catch (error) {
        console.error('🔥 Lỗi fetchCategories:', error);
      }
    };

    const fetchVouchers = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/voucher/getvoucher');
        const data = await res.json();

        if (res.ok) {
          setVouchers(data.vouchers || []);
        } else {
          console.error("❌ API error:", data.message);
        }
      } catch (error) {
        console.error('🔥 Lỗi fetchVouchers:', error);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/review/getallreview');
        const data = await res.json();

        if (res.ok) {
          setReviews(data.reviews || []);
        } else {
          console.error("❌ API error:", data.message);
        }
      } catch (error) {
        console.error('🔥 Lỗi fetchReviews:', error);
      }
    };

    fetchUsers();
    fetchProducts();
    fetchCategories();
    fetchVouchers();
    fetchReviews();
  }, [page]);

  // Calculate dashboard stats
  useEffect(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    const recentReviews = reviews
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    const lowStockProducts = products.filter(product => product.quantity <= 5);

    setDashboardStats({
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      averageRating,
      recentOrders,
      recentReviews,
      lowStockProducts
    });
  }, [orders, reviews, products]);

  useEffect(() => {
    const email = localStorage.getItem("adminEmail");
    if (email) {
      setAdminEmail(email);
    }
  }, []);

  const handleLogoutx = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminEmail');
    window.location.href = '/loginadmin';
  };

  const handleCategoryAdded = (category: Category) => {
    setCategories(prev => [...prev, category]);
  };

  // Filter functions
  const filteredUsers = users.filter(user =>
    (user.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.phone ?? "").includes(searchTerm)
  );


  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.fuelType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.quantity.toString().includes(searchTerm) ||
    (product.quantity > 10 && searchTerm.toLowerCase().includes('còn nhiều')) ||
    (product.quantity > 5 && searchTerm.toLowerCase().includes('còn khá')) ||
    (product.quantity > 0 && searchTerm.toLowerCase().includes('còn ít')) ||
    (product.quantity === 0 && searchTerm.toLowerCase().includes('hết hàng'))
  );

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVouchers = vouchers.filter(voucher =>
    voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (voucher.description && voucher.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    voucher.discountType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReviews = reviews.filter(review =>
    review.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.rating.toString().includes(searchTerm) ||
    (review.comment && review.comment.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toString().includes(searchTerm) ||
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });



  // CRUD operations
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) return;

    try {
      const res = await fetch(`http://localhost:3000/api/user/deleteuser/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        setUsers(users.filter(user => user.id !== id));
        alert(data.message || 'Xóa người dùng thành công');
      } else {
        alert(data.message || 'Xóa người dùng thất bại');
      }
    } catch (error) {
      alert('Lỗi khi kết nối tới server');
      console.error(error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

    try {
      const res = await fetch(`http://localhost:3000/api/product/deleteproduct/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        setProducts(products.filter(product => product.id !== id));
        alert(data.message || 'Xóa sản phẩm thành công');
      } else {
        alert(data.message || 'Xóa sản phẩm thất bại');
      }
    } catch (error) {
      alert('Lỗi khi kết nối tới server');
      console.error(error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;

    try {
      const res = await fetch(`http://localhost:3000/api/category/deleteCategory/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        setCategories(prev => prev.filter(category => category.id !== id));
        alert(data.message || 'Xóa danh mục thành công');
      } else {
        alert(data.message || 'Xóa danh mục thất bại');
      }
    } catch (error) {
      alert('Lỗi khi kết nối tới server');
      console.error(error);
    }
  };

  const handleDeleteVoucher = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa voucher này không?')) return;

    try {
      const res = await fetch(`http://localhost:3000/api/voucher/deletevoucher/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        setVouchers(prev => prev.filter(voucher => voucher.id !== id));
        alert(data.message || 'Xóa voucher thành công');
      } else {
        alert(data.message || 'Xóa voucher thất bại');
      }
    } catch (error) {
      alert('Lỗi khi kết nối tới server');
      console.error(error);
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) return;

    try {
      const res = await fetch(`http://localhost:3000/api/review/admindelete/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        setReviews(prev => prev.filter(review => review.id !== id));
        alert(data.message || 'Xóa đánh giá thành công');
      } else {
        alert(data.message || 'Xóa đánh giá thất bại');
      }
    } catch (error) {
      alert('Lỗi khi kết nối tới server');
      console.error(error);
    }
  };

  const handleDeleteOrder = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này không?')) return;

    try {
      const res = await fetch(`http://localhost:3000/api/payment/delete/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        setOrders(prev => prev.filter(order => order.id !== id));
        alert(data.message || 'Xóa đơn hàng thành công');
      } else {
        alert(data.message || 'Xóa đơn hàng thất bại');
      }
    } catch (error) {
      alert('Lỗi khi kết nối tới server');
      console.error(error);
    }
  };

  const handleAddNew = () => {
    if (activeTab === 'users') {
      setIsUserAddPopupOpen(true);
    } else if (activeTab === 'products') {
      navigate('/admin/product');
    } else if (activeTab === 'category') {
      setIsCategoryPopupOpen(true);
    } else if (activeTab === 'vouchers') {
      setIsVoucherPopupOpen(true);
    }
  };

  const handleEdit = (item: User | Product | Category | Voucher | Order) => {
    if ('email' in item) {
      setEditingUser(item);
      setIsUserPopupOpen(true);
    } else if ('price' in item) {
      navigate(`/admin/product/edit/${item.id}`, { state: { product: item } });
    } else if ('code' in item) {
      setEditingVoucher(item);
      setIsVoucherPopupOpen(true);
    } else if ('totalAmount' in item) {
      setSelectedOrder(item);
      setIsOrderPopupOpen(true);
    } else if (activeTab === 'category') {
      setEditingCategory(item);
      setIsCategoryPopupOpen(true);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderPopupOpen(true);
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString: string | Date) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };



  const toggleProductStatus = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newStatus = !product.isActive;

    try {
      const res = await fetch(`http://localhost:3000/api/product/updateStatus/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });

      const data = await res.json();

      if (res.ok) {
        setProducts(prevProducts =>
          prevProducts.map(p =>
            p.id === productId ? { ...p, isActive: newStatus } : p
          )
        );
        alert(data.message || 'Cập nhật trạng thái thành công');
      } else {
        alert(data.message || 'Lỗi khi cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Lỗi kết nối server');
    }
  };

  const toggleCategoryStatus = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const newStatus = !category.isActive;

    try {
      const res = await fetch(`http://localhost:3000/api/category/updateStatus/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });

      const data = await res.json();

      if (res.ok) {
        setCategories(prevCategories =>
          prevCategories.map(c =>
            c.id === categoryId ? { ...c, isActive: newStatus } : c
          )
        );
        alert(data.message || 'Cập nhật trạng thái danh mục thành công');
      } else {
        alert(data.message || 'Lỗi khi cập nhật trạng thái danh mục');
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi kết nối server');
    }
  };

  const toggleVoucherStatus = async (voucherId: number) => {
    const voucher = vouchers.find(v => v.id === voucherId);
    if (!voucher) return;

    const newStatus = !voucher.isActive;

    try {
      const res = await fetch(`http://localhost:3000/api/voucher/updatestatus/${voucherId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });

      const data = await res.json();

      if (res.ok) {
        setVouchers(prevVouchers =>
          prevVouchers.map(v =>
            v.id === voucherId ? { ...v, isActive: newStatus } : v
          )
        );
        alert(data.message || 'Cập nhật trạng thái voucher thành công');
      } else {
        alert(data.message || 'Lỗi khi cập nhật trạng thái voucher');
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi kết nối server');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-purple-100 text-purple-800 border-purple-200',
      shipping: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      unpaid: 'bg-red-100 text-red-800 border-red-200',
      paid: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      processing: 'Đang xử lý',
      shipping: 'Đang giao hàng',
      delivered: 'Đã giao hàng',
      cancelled: 'Đã hủy',
      unpaid: 'Chưa thanh toán',
      paid: 'Đã thanh toán',
      failed: 'Thanh toán thất bại',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: <Clock className="h-4 w-4" />,
      confirmed: <CheckCircle className="h-4 w-4" />,
      processing: <Settings className="h-4 w-4" />,
      shipping: <Truck className="h-4 w-4" />,
      delivered: <CheckCircle className="h-4 w-4" />,
      cancelled: <XCircle className="h-4 w-4" />,
      unpaid: <XCircle className="h-4 w-4" />,
      paid: <CheckCircle className="h-4 w-4" />,
      failed: <AlertCircle className="h-4 w-4" />,
    };
    return icons[status as keyof typeof icons] || <AlertCircle className="h-4 w-4" />;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
      />
    ));
  };

  // Get unread message count for chat tab


  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Tổng quan', icon: Home },
    { id: 'users', label: 'Quản lý người dùng', icon: Users, count: users.length },
    { id: 'products', label: 'Quản lý sản phẩm', icon: Package, count: totalProducts },
    { id: 'category', label: 'Quản lý danh mục', icon: Package, count: categories.length },
    { id: 'vouchers', label: 'Quản lý voucher', icon: Tag, count: vouchers.length },
    { id: 'reviews', label: 'Quản lý đánh giá', icon: MessageSquare, count: reviews.length },
    { id: 'orders', label: 'Quản lý đơn hàng', icon: FileText, count: orders.length },
    { id: 'reports', label: 'Báo cáo', icon: BarChart3 },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
    { id: 'security', label: 'Bảo mật', icon: Shield },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'help', label: 'Trợ giúp', icon: HelpCircle },
  ];



  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              <p className="text-xs text-blue-600 mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                Đang hoạt động: {users.filter(u => u.agreedToTerms).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              <p className="text-xs text-red-600 mt-1">
                <AlertCircle className="h-3 w-3 inline mr-1" />
                Sắp hết: {dashboardStats.lowStockProducts.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              <p className="text-xs text-orange-600 mt-1">
                <Clock className="h-3 w-3 inline mr-1" />
                Chờ xử lý: {dashboardStats.pendingOrders}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(dashboardStats.totalRevenue)}
              </p>
              <p className="text-xs text-green-600 mt-1">
                <CheckCircle className="h-3 w-3 inline mr-1" />
                Hoàn thành: {dashboardStats.deliveredOrders}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <MessageSquare className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng đánh giá</p>
              <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
              <div className="flex items-center mt-2">
                <div className="flex">{renderStars(Math.round(dashboardStats.averageRating))}</div>
                <span className="ml-2 text-sm text-gray-600">
                  {dashboardStats.averageRating.toFixed(1)}/5
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100">
              <Tag className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Voucher hoạt động</p>
              <p className="text-2xl font-bold text-gray-900">
                {vouchers.filter(v => v.isActive).length}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Tổng cộng: {vouchers.length} voucher
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-pink-100">
              <Activity className="h-6 w-6 text-pink-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Danh mục hoạt động</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.filter(c => c.isActive).length}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Tổng cộng: {categories.length} danh mục
              </p>
            </div>
          </div>
        </div>


      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Đơn hàng gần đây
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardStats.recentOrders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">#{order.id}</p>
                      <p className="text-sm text-gray-600">{order.user.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>
              ))}
              {dashboardStats.recentOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Chưa có đơn hàng nào</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Reviews & Low Stock Alert */}
        <div className="space-y-6">
          {/* Recent Reviews */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-orange-600" />
                Đánh giá mới
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardStats.recentReviews.slice(0, 3).map(review => (
                  <div
                    key={review.id}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <MessageSquare className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-gray-900">
                          {review.user?.name ?? "Người dùng ẩn danh"}
                        </p>
                        <div className="flex">{renderStars(review.rating)}</div>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {review.product?.name ?? "Sản phẩm đã bị xóa"}
                      </p>
                      {review.comment && (
                        <p className="text-xs text-gray-500 truncate">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {dashboardStats.recentReviews.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <MessageSquare className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Chưa có đánh giá nào</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                Cảnh báo tồn kho
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {dashboardStats.lowStockProducts.slice(0, 3).map(product => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.image || `${BASE_URL}placeholder.jpg`}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">Còn lại: {product.quantity}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                      Sắp hết
                    </span>
                  </div>
                ))}
                {dashboardStats.lowStockProducts.length === 0 && (
                  <div className="text-center py-4 text-green-600">
                    <CheckCircle className="h-6 w-6 mx-auto mb-2" />
                    <p className="text-sm">Tất cả sản phẩm đều đủ hàng</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => {
    if (isLoadingReports) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu báo cáo...</p>
          </div>
        </div>
      );
    }

    // Chart configurations
    const revenueChartData = {
      labels: reportStats.monthlyRevenue.map(item => item.month),
      datasets: [
        {
          label: 'Doanh thu (VND)',
          data: reportStats.monthlyRevenue.map(item => item.revenue),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };

    const revenueChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Biểu đồ doanh thu theo tháng',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value: number | string) {
              return new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                maximumSignificantDigits: 3,
              }).format(Number(value));
            },
          },
        },
      },
    };

    const orderStatusData = {
      labels: Object.keys(reportStats.orderStatusDistribution).map(status => getStatusLabel(status)),
      datasets: [
        {
          data: Object.values(reportStats.orderStatusDistribution),
          backgroundColor: [
            '#3B82F6', // blue
            '#10B981', // green
            '#8B5CF6', // purple
            '#F59E0B', // yellow
            '#EF4444', // red
            '#6B7280', // gray
          ],
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };

    const orderStatusOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom' as const,
        },
        title: {
          display: true,
          text: 'Phân bố trạng thái đơn hàng',
        },
      },
    };

    const customerGrowthData = {
      labels: reportStats.customerGrowth.map(item => item.month),
      datasets: [
        {
          label: 'Khách hàng mới',
          data: reportStats.customerGrowth.map(item => item.newCustomers),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1,
        },
      ],
    };

    const customerGrowthOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Tăng trưởng khách hàng theo tháng',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    };

    return (
      <div className="space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Tỷ lệ tăng trưởng doanh thu</p>
                <p className="text-3xl font-bold mt-2">
                  {reportStats.revenueGrowthRate > 0 ? '+' : ''}
                  {reportStats.revenueGrowthRate.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                {reportStats.revenueGrowthRate >= 0 ?
                  <TrendingUp className="h-8 w-8" /> :
                  <TrendingDown className="h-8 w-8" />
                }
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Giá trị đơn hàng TB</p>
                <p className="text-3xl font-bold mt-2">
                  {formatCurrency(reportStats.averageOrderValue)}
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <DollarSign className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Tỷ lệ chuyển đổi</p>
                <p className="text-3xl font-bold mt-2">{reportStats.conversionRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <Activity className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Khách hàng quay lại</p>
                <p className="text-3xl font-bold mt-2">{reportStats.returningCustomers}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <Users className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <LineChart className="h-5 w-5 mr-2 text-blue-600" />
                Doanh thu theo tháng (API)
              </h3>
            </div>
            <div className="h-80">
              {reportStats.monthlyRevenue.length > 0 ? (
                <Line data={revenueChartData} options={revenueChartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>Không có dữ liệu doanh thu</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-purple-600" />
                Trạng thái đơn hàng
              </h3>
            </div>
            <div className="h-80">
              {Object.keys(reportStats.orderStatusDistribution).length > 0 ? (
                <Doughnut data={orderStatusData} options={orderStatusOptions} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <PieChart className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>Không có dữ liệu đơn hàng</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Growth */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart className="h-5 w-5 mr-2 text-green-600" />
                Tăng trưởng khách hàng (API)
              </h3>
            </div>
            <div className="h-80">
              {reportStats.customerGrowth.length > 0 ? (
                <Bar data={customerGrowthData} options={customerGrowthOptions} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <BarChart className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>Không có dữ liệu khách hàng</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="h-5 w-5 mr-2 text-orange-600" />
                Sản phẩm bán chạy (API)
              </h3>
            </div>
            <div className="space-y-4">
              {reportStats.bestSellingProducts.slice(0, 5).map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 truncate max-w-32">{item.name}</p>
                      <p className="text-sm text-gray-600">{formatCurrency(item.price)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">Đã bán: {item.totalSold}</p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(item.totalSold * item.price)}
                    </p>
                  </div>
                </div>
              ))}
              {reportStats.bestSellingProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Chưa có dữ liệu bán hàng</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-indigo-600" />
                Khách hàng VIP (API)
              </h3>
            </div>
            <div className="space-y-4">
              {reportStats.topCustomers.slice(0, 5).map((customer, index) => (
                <div key={customer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-600">{customer.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{formatCurrency(customer.totalSpent)}</p>
                    <p className="text-sm text-gray-500">{customer.totalOrders} đơn hàng</p>
                  </div>
                </div>
              ))}
              {reportStats.topCustomers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Chưa có dữ liệu khách hàng</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                Thống kê tổng quan
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {orders.filter(o => o.status === 'delivered').length}
                  </div>
                  <div className="text-sm text-gray-600">Đơn hàng hoàn thành</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {((orders.filter(o => o.status === 'delivered').length / (orders.length || 1)) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Tỷ lệ hoàn thành</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {reviews.length}
                  </div>
                  <div className="text-sm text-gray-600">Tổng đánh giá</div>
                </div>

                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">
                    {dashboardStats.averageRating.toFixed(1)}/5
                  </div>
                  <div className="text-sm text-gray-600">Đánh giá TB</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPlaceholderContent = (title: string, description: string) => (
    <div className="bg-white rounded-xl shadow-sm border p-8">
      <div className="text-center">
        <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Settings className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg border-r transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h2 className="text-xl font-bold text-gray-900">Admin VinFast</h2>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id as TabId)}
                    className={`${activeTab === item.id
                      ? 'bg-blue-50 text-blue-600 border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 border border-transparent relative`}
                  >
                    <Icon
                      className={`${sidebarOpen ? 'mr-3' : 'mx-auto'
                        } h-5 w-5 flex-shrink-0`}
                    />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.count !== undefined && item.count > 0 && (
                          <span className={`text-xs px-2 py-1 rounded-full ${item.id === 'chat' && item.count > 0
                            ? 'bg-red-100 text-red-600 animate-pulse'
                            : 'bg-gray-100 text-gray-600'
                            }`}>
                            {item.count}
                          </span>
                        )}
                      </>
                    )}
                    {!sidebarOpen && item.count !== undefined && item.count > 0 && item.id === 'chat' && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                        {item.count}
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 shadow-lg">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      {menuItems.find(item => item.id === activeTab)?.label || 'Tổng quan'}
                    </h1>

                    {activeTab === 'dashboard' && (
                      <div className="mt-2 flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <p className="text-blue-100 font-medium">
                            Chào Admin: <span className="text-white font-semibold">{adminEmail}</span>
                          </p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'users' && (
                      <p className="mt-2 text-blue-100 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        Quản lý thông tin người dùng
                      </p>
                    )}
                    {activeTab === 'products' && (
                      <p className="mt-2 text-blue-100 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Quản lý sản phẩm và kho hàng
                      </p>
                    )}
                    {activeTab === 'category' && (
                      <p className="mt-2 text-blue-100 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Quản lý danh mục sản phẩm
                      </p>
                    )}
                    {activeTab === 'vouchers' && (
                      <p className="mt-2 text-blue-100 flex items-center">
                        <Tag className="w-4 h-4 mr-2" />
                        Quản lý voucher và mã giảm giá
                      </p>
                    )}
                    {activeTab === 'reviews' && (
                      <p className="mt-2 text-blue-100 flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Quản lý đánh giá và phản hồi của khách hàng
                      </p>
                    )}
                    {activeTab === 'orders' && (
                      <p className="mt-2 text-blue-100 flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Quản lý đơn hàng và theo dõi trạng thái
                      </p>
                    )}

                    {activeTab === 'reports' && (
                      <p className="mt-2 text-blue-100 flex items-center">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Báo cáo và phân tích dữ liệu kinh doanh từ API
                      </p>
                    )}
                    {!['dashboard', 'users', 'products', 'category', 'vouchers', 'reviews', 'orders', 'chat', 'reports'].includes(activeTab) && (
                      <p className="mt-2 text-blue-100 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14v7h9v-4l6 3v-7l-6 3z" />
                        </svg>
                        Tính năng đang phát triển
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 text-blue-100">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">{new Date().toLocaleDateString('vi-VN')}</span>
                </div>

                <button
                  onClick={handleLogoutx}
                  className="group relative px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-medium rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/30 hover:border-white/50 hover:shadow-lg hover:shadow-white/10"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Đăng xuất</span>
                  </div>
                  <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-6">
          {/* Dashboard */}
          {activeTab === 'dashboard' && renderDashboard()}


          {/* Reports */}
          {activeTab === 'reports' && renderReports()}

          {/* Management Tables */}
          {(activeTab === 'users' || activeTab === 'products' || activeTab === 'category' || activeTab === 'vouchers' || activeTab === 'reviews' || activeTab === 'orders') && (
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6">
                {/* Controls */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder={`Tìm kiếm ${activeTab === 'users' ? 'người dùng' :
                          activeTab === 'products' ? 'sản phẩm' :
                            activeTab === 'category' ? 'danh mục' :
                              activeTab === 'vouchers' ? 'voucher' :
                                activeTab === 'reviews' ? 'đánh giá' : 'đơn hàng'
                          }...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 w-full sm:w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    {/* Order Filters */}
                    {activeTab === 'orders' && (
                      <>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="all">Tất cả trạng thái</option>
                          <option value="pending">Chờ xác nhận</option>
                          <option value="confirmed">Đã xác nhận</option>
                          <option value="processing">Đang xử lý</option>
                          <option value="shipping">Đang giao hàng</option>
                          <option value="delivered">Đã giao hàng</option>
                          <option value="cancelled">Đã hủy</option>
                        </select>

                        <select
                          value={paymentFilter}
                          onChange={(e) => setPaymentFilter(e.target.value)}
                          className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="all">Tất cả thanh toán</option>
                          <option value="unpaid">Chưa thanh toán</option>
                          <option value="paid">Đã thanh toán</option>
                          <option value="failed">Thanh toán thất bại</option>
                        </select>
                      </>
                    )}
                  </div>

                  {!['orders', 'reviews'].includes(activeTab) && (
                    <button
                      onClick={handleAddNew}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center shadow-sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm {
                        activeTab === 'users' ? 'Người Dùng' :
                          activeTab === 'products' ? 'Sản Phẩm' :
                            activeTab === 'category' ? 'Danh Mục' :
                              'Voucher'
                      }
                    </button>
                  )}
                </div>

                {/* Users Table */}
                {activeTab === 'users' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thông Tin Cá Nhân</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Liên Hệ</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mật Khẩu</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Điều Khoản</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày Thêm</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành Động</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">ID: {user.id}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{user.email}</div>
                              <div className="text-sm text-gray-500">{user.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-sm text-gray-900 mr-2">
                                  {showPasswords[user.id] ? user.password : '••••••••'}
                                </span>
                                <button
                                  onClick={() => togglePasswordVisibility(user.id)}
                                  className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  {showPasswords[user.id] ?
                                    <EyeOff className="h-4 w-4" /> :
                                    <Eye className="h-4 w-4" />
                                  }
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.agreedToTerms
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {user.agreedToTerms ? 'Đã đồng ý' : 'Chưa đồng ý'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(user.createdAt as string)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => handleEdit(user)}
                                  className="text-blue-600 hover:text-blue-900 transition-colors p-1 hover:bg-blue-50 rounded"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-600 hover:text-red-900 transition-colors p-1 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {filteredUsers.length === 0 && (
                      <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Không có người dùng</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchTerm ? 'Không tìm thấy người dùng phù hợp' : 'Bắt đầu bằng cách thêm người dùng mới'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Categories Table */}
                {activeTab === 'category' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên Danh Mục</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mô Tả</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hình Ảnh</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày Tạo</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành Động</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCategories.map(category => (
                          <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.description || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <img
                                src={category.image ? category.image : `${BASE_URL}`}
                                alt={category.name}
                                className="h-16 w-24 object-cover rounded-lg shadow-sm"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(category.createdAt as string)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {category.isActive ? 'Hoạt động' : 'Không hoạt động'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-3 items-center">
                                <button
                                  onClick={() => handleEdit(category)}
                                  className="text-blue-600 hover:text-blue-900 transition-colors p-1 hover:bg-blue-50 rounded"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(category.id)}
                                  className="text-red-600 hover:text-red-900 transition-colors p-1 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => toggleCategoryStatus(category.id)}
                                  className={`p-2 rounded transition ${!category.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
                                    }`}
                                  aria-label={!category.isActive ? 'Chuyển sang không hoạt động' : 'Chuyển sang hoạt động'}
                                  title={!category.isActive ? 'Chuyển sang không hoạt động' : 'Chuyển sang hoạt động'}
                                >
                                  {!category.isActive ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {filteredCategories.length === 0 && (
                      <div className="text-center py-12">
                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Không có danh mục</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchTerm ? 'Không tìm thấy danh mục phù hợp' : 'Bắt đầu bằng cách thêm danh mục mới'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Vouchers Table */}
                {activeTab === 'vouchers' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã Voucher</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Loại & Giá Trị</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thời Gian</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Điều Kiện</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sử Dụng</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành Động</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredVouchers.map((voucher) => (
                          <tr key={voucher.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <img
                                    src={voucher.image}
                                    alt="Voucher"
                                    className="w-20 h-20 object-cover rounded"
                                  />
                                </div>

                                <div className="ml-4">

                                  <div className="text-sm font-bold text-gray-900 bg-purple-100 px-2 py-1 rounded">
                                    {voucher.code}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {voucher.description || 'Không có mô tả'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${voucher.discountType === 'percent' ? 'bg-blue-100 text-blue-800' :
                                  voucher.discountType === 'fixed' ? 'bg-green-100 text-green-800' :
                                    'bg-orange-100 text-orange-800'
                                  }`}>
                                  {voucher.discountType === 'percent' ? 'Phần trăm' :
                                    voucher.discountType === 'fixed' ? 'Cố định' : 'Freeship'}
                                </span>
                                <div className="text-sm font-medium text-gray-900 mt-1">
                                  {voucher.discountType === 'percent'
                                    ? `${voucher.discountValue}%`
                                    : voucher.discountType === 'fixed'
                                      ? formatCurrency(voucher.discountValue || 0)
                                      : 'Miễn phí ship'
                                  }
                                </div>
                                {voucher.maxDiscount && voucher.maxDiscount > 0 && (
                                  <div className="text-xs text-gray-500">
                                    Tối đa: {formatCurrency(voucher.maxDiscount)}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="text-green-600 font-medium">
                                {formatDateTime(voucher.startDate)}
                              </div>
                              <div className="text-red-600">
                                {formatDateTime(voucher.endDate)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {voucher.minOrderValue && voucher.minOrderValue > 0 ? (
                                <div>Tối thiểu: {formatCurrency(voucher.minOrderValue)}</div>
                              ) : (
                                <div className="text-gray-400">Không có</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="text-gray-900 font-medium">
                                {voucher.usedCount}/{voucher.usageLimit || '∞'}
                              </div>
                              {voucher.usageLimit && (
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{
                                      width: `${Math.min((voucher.usedCount / voucher.usageLimit) * 100, 100)}%`
                                    }}
                                  ></div>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${voucher.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {voucher.isActive ? 'Hoạt động' : 'Không hoạt động'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-3 items-center">
                                <button
                                  onClick={() => handleEdit(voucher)}
                                  className="text-blue-600 hover:text-blue-900 transition-colors p-1 hover:bg-blue-50 rounded"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteVoucher(voucher.id)}
                                  className="text-red-600 hover:text-red-900 transition-colors p-1 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => toggleVoucherStatus(voucher.id)}
                                  className={`p-2 rounded transition ${voucher.isActive ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'
                                    }`}
                                  aria-label={voucher.isActive ? 'Chuyển sang không hoạt động' : 'Chuyển sang hoạt động'}
                                  title={voucher.isActive ? 'Chuyển sang không hoạt động' : 'Chuyển sang hoạt động'}
                                >
                                  {voucher.isActive ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {filteredVouchers.length === 0 && (
                      <div className="text-center py-12">
                        <Tag className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Không có voucher</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchTerm ? 'Không tìm thấy voucher phù hợp' : 'Bắt đầu bằng cách thêm voucher mới'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews Table */}
                {activeTab === 'reviews' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Đánh Giá</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Khách Hàng</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sản Phẩm</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Đánh Giá</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nội Dung</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hình Ảnh</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày Tạo</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành Động</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredReviews.length > 0 ? filteredReviews.map((review) => (
                          <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="p-3 bg-orange-100 rounded-lg mr-4">
                                  <MessageSquare className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-gray-900">#{review.id}</div>
                                  <div className="text-xs text-gray-500">Review ID</div>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{review.user.name}</div>
                                <div className="text-sm text-gray-500">{review.user.email}</div>
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex items-center space-x-2 max-w-xs">
                                  {review.product?.image ? (
                                    <img
                                      src={review.product.image}
                                      alt={review.product.name}
                                      className="w-10 h-10 object-cover rounded-lg shadow-sm"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                      <span className="text-xs text-gray-400">No Img</span>
                                    </div>
                                  )}

                                  <span className="text-sm font-medium text-gray-900 truncate">
                                    {review.product?.name || "Sản phẩm đã bị xóa"}
                                  </span>
                                </div>

                              </div>
                            </td>


                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <div className="flex">
                                  {renderStars(review.rating)}
                                </div>
                                <span className="text-sm font-semibold text-gray-900">
                                  {review.rating}/5
                                </span>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="max-w-xs">
                                {review.comment ? (
                                  <p className="text-sm text-gray-700 line-clamp-3">
                                    {review.comment}
                                  </p>
                                ) : (
                                  <span className="text-sm text-gray-400 italic">
                                    Không có bình luận
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              {review.images && review.images.length > 0 ? (
                                <div className="flex gap-2">
                                  {review.images.map((img, index) => (
                                    <img
                                      key={img.id || index}
                                      src={img.url}
                                      alt={`Review image ${index + 1}`}
                                      className="w-16 h-16 object-cover rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                      onClick={() => window.open(img.url, "_blank")}
                                    />
                                  ))}
                                </div>
                              ) : (
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <span className="text-xs text-gray-400">Không có</span>
                                </div>
                              )}
                            </td>


                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                {formatDateTime(review.createdAt)}
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => handleDeleteReview(review.id)}
                                className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-all duration-200"
                                title="Xóa đánh giá"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={8}>
                              <div className="text-center py-12">
                                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Không có đánh giá</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                  {searchTerm ? 'Không tìm thấy đánh giá phù hợp' : 'Chưa có đánh giá nào trong hệ thống'}
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Orders Table */}
                {activeTab === 'orders' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Đơn Hàng</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Khách Hàng</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sản Phẩm</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng Tiền</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thanh Toán</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày Đặt</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành Động</th>
                        </tr>
                      </thead>

                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                            {/* Đơn Hàng */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                                  <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-gray-900">#{order.id}</div>
                                  <div className="text-xs text-gray-500">{order.items?.length || 0} sản phẩm</div>
                                </div>
                              </div>
                            </td>

                            {/* Khách Hàng */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{order.user?.name || '-'}</div>
                                <div className="text-sm text-gray-500 flex items-center">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {order.user?.email || '-'}
                                </div>
                                {order.user?.phone && (
                                  <div className="text-xs text-gray-500 flex items-center mt-1">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {order.user.phone}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Sản Phẩm */}
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                {order.items?.slice(0, 2).map((item, index) => {
                                  const product = item.product;
                                  if (!product) return null;

                                  return (
                                    <div key={index} className="flex items-center text-sm">
                                      <img
                                        src={product.image || `${BASE_URL}placeholder.jpg`}
                                        alt={product.name || 'Sản phẩm'}
                                        className="w-8 h-8 object-cover rounded mr-2"
                                      />
                                      <span className="truncate max-w-32">{product.name}</span>
                                      <span className="ml-2 text-gray-500">x{item.quantity}</span>
                                    </div>
                                  );
                                })}
                                {order.items && order.items.length > 2 && (
                                  <div className="text-xs text-gray-500">+{order.items.length - 2} sản phẩm khác</div>
                                )}
                              </div>
                            </td>

                            {/* Tổng Tiền */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-lg font-bold text-gray-900">{formatCurrency(order.totalAmount)}</div>
                                {order.voucher && (
                                  <div className="text-xs text-green-600 flex items-center">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {order.voucher.code}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Thanh Toán */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="space-y-2">
                                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(order.paymentStatus)}`}>
                                  {getStatusIcon(order.paymentStatus)}
                                  <span className="ml-1">{getStatusLabel(order.paymentStatus)}</span>
                                </span>
                                <div className="text-xs text-gray-500 flex items-center">
                                  <CreditCard className="h-3 w-3 mr-1" />
                                  {order.paymentMethod || '-'}
                                </div>
                              </div>
                            </td>

                            {/* Trạng Thái */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                <span className="ml-2">{getStatusLabel(order.status)}</span>
                              </span>
                            </td>

                            {/* Ngày Đặt */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                {formatDateTime(order.createdAt)}
                              </div>
                            </td>

                            {/* Hành Động */}
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex justify-center space-x-2">
                                <button
                                  onClick={() => handleViewOrder(order)}
                                  className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 transition-all duration-200"
                                  title="Xem chi tiết"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleEdit(order)}
                                  className="text-green-600 hover:text-green-900 p-2 rounded-full hover:bg-green-50 transition-all duration-200"
                                  title="Cập nhật trạng thái"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-all duration-200"
                                  title="Xóa đơn hàng"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={8}>
                              <div className="text-center py-12">
                                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Không có đơn hàng</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                  {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'
                                    ? 'Không tìm thấy đơn hàng phù hợp với bộ lọc'
                                    : 'Chưa có đơn hàng nào trong hệ thống'}
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Products Table */}
                {activeTab === 'products' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sản Phẩm</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thông Số Kỹ Thuật</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Giá & Khuyến Mãi</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bảo Hành & Km</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Số Lượng</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày Thêm</th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành Động</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.map(product => (
                          <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap flex items-center">
                              <img
                                src={product.image ? product.image : `${BASE_URL}`}
                                alt={product.name}
                                className="h-16 w-24 object-cover rounded-lg shadow-sm mr-4"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">Năm: {product.year}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div>Nhiên Liệu: {product.fuelType}</div>
                              <div>Công Suất: {product.power}</div>
                              <div>Ghế ngồi: {product.seats}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="font-medium text-gray-900">{formatCurrency(product.price)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div>Bảo hành {product.warranty} năm</div>
                              <div className="text-green-600 font-semibold">Đã chạy {product.km} km</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full mr-2 ${product.quantity > 10 ? 'bg-green-500' :
                                  product.quantity > 5 ? 'bg-yellow-500' :
                                    product.quantity > 0 ? 'bg-orange-500' : 'bg-red-500'
                                  }`}></div>
                                <span className={`font-semibold ${product.quantity > 10 ? 'text-green-600' :
                                  product.quantity > 5 ? 'text-yellow-600' :
                                    product.quantity > 0 ? 'text-orange-600' : 'text-red-600'
                                  }`}>
                                  {product.quantity} sản phẩm
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {product.quantity > 10 ? 'Còn nhiều' :
                                  product.quantity > 5 ? 'Còn khá' :
                                    product.quantity > 0 ? 'Còn ít' : 'Hết hàng'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(product.createdAt as string)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                              <span className={`inline-flex px-2 py-1 rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {product.isActive ? 'Hoạt động' : 'Không hoạt động'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex justify-center space-x-3">
                                <button
                                  onClick={() => handleEdit(product)}
                                  className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transition"
                                  aria-label="Sửa sản phẩm"
                                >
                                  <Edit className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition"
                                  aria-label="Xóa sản phẩm"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => toggleProductStatus(product.id)}
                                  className={`p-2 rounded transition ${product.isActive ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'
                                    }`}
                                  aria-label={product.isActive ? 'Chuyển sang không hoạt động' : 'Chuyển sang hoạt động'}
                                  title={product.isActive ? 'Chuyển sang không hoạt động' : 'Chuyển sang hoạt động'}
                                >
                                  {product.isActive ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {filteredProducts.length === 0 && (
                      <div className="text-center py-12">
                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Không có sản phẩm</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchTerm ? 'Không tìm thấy sản phẩm phù hợp' : 'Bắt đầu bằng cách thêm sản phẩm mới'}
                        </p>
                      </div>
                    )}

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                      >
                        Prev
                      </button>

                      <span>
                        Page {page} / {totalPages}
                      </span>

                      <button
                        onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={page === totalPages}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
          )}
         

          {/* Other Pages */}
          {activeTab === 'settings' && renderPlaceholderContent('Cài đặt hệ thống', 'Tính năng cài đặt hệ thống đang được phát triển')}
          {activeTab === 'security' && renderPlaceholderContent('Bảo mật', 'Tính năng quản lý bảo mật đang được phát triển')}
          {activeTab === 'notifications' && renderPlaceholderContent('Thông báo', 'Tính năng quản lý thông báo đang được phát triển')}
          {activeTab === 'help' && renderPlaceholderContent('Trợ giúp', 'Tài liệu hướng dẫn sử dụng hệ thống')}
        </div>
        
      </div>
      

      {/* Chat Widget for Demo */}

      {/* Popups */}
      <PopupAddCategory
        isOpen={isCategoryPopupOpen}
        onClose={() => {
          setIsCategoryPopupOpen(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onCategoryAdded={handleCategoryAdded}
        onCategoryUpdated={handleCategoryUpdated}
      />

      <PopupAddVoucher
        isOpen={isVoucherPopupOpen}
        onClose={() => {
          setIsVoucherPopupOpen(false);
          setEditingVoucher(null);
        }}
        voucher={editingVoucher}
        onVoucherAdded={handleVoucherAdded}
        onVoucherUpdated={handleVoucherUpdated}
      />

      <PopupAddUser
        isOpen={isUserAddPopupOpen}
        onClose={() => {
          setIsUserAddPopupOpen(false);
        }}
        onUserAdded={handleUserAdded}
      />

      <PopupEditUser
        isOpen={isUserPopupOpen}
        onClose={() => {
          setIsUserPopupOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onUserUpdated={handleUserUpdated}
      />

      <PopupOrderDetail
        isOpen={isOrderPopupOpen}
        onClose={() => {
          setIsOrderPopupOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onOrderUpdated={handleOrderUpdated}
      />
       <AdminChatWidget />
    </div>
    
  );
};

export default Admin;