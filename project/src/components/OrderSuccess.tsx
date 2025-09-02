import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "./types/socket"; // 1 instance socket duy nhất
import {
  ArrowLeft,
  CheckCircle2,
  Package,
  Truck,
  Clock,
  MapPin,
  CreditCard,
  Copy,
  Phone,
  Mail,
  Calendar,
  Hash,
  ShoppingBag,
  Home,
  Star,
  MessageCircle,
  Download,
  RefreshCw,
  X,
  Camera,
  Send,
  Shield,
  // Gift,
  // Zap,
  Award,
  Users,
  Heart,
} from "lucide-react";
import type { ExtendedOrder, ExtendedOrderItem } from "../components/types/order";
import { useParams } from "react-router-dom";

type OrderStatus = "pending" | "confirmed" | "processing" | "shipping" | "delivered" | "cancelled";
type PaymentStatus = "unpaid" | "paid" | "refunded";

interface OrderStatusStep {
  status: OrderStatus;
  title: string;
  description: string;
  icon: React.ComponentType;
  completed: boolean;
  current: boolean;
  estimatedDate?: string;
}

interface ReviewData {
  rating: number;
  comment: string;
  images: File[];
}

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = (location.state as { orderData?: ExtendedOrder })?.orderData;

  const [order, setOrder] = useState<ExtendedOrder | null>(orderData || null);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Review modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewData>({
    rating: 0,
    comment: "",
    images: []
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // ----------------- Helpers -----------------
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusSteps = (currentStatus: OrderStatus, paymentStatus: PaymentStatus): OrderStatusStep[] => {
    const allSteps: OrderStatusStep[] = [
      {
        status: "pending",
        title: "Đơn hàng được tạo",
        description: "Đơn hàng đã được tiếp nhận",
        icon: Clock,
        completed: true,
        current: false,
      },
      {
        status: "confirmed",
        title: "Xác nhận đơn hàng",
        description: paymentStatus === "paid" ? "Đã thanh toán & xác nhận" : "Chờ thanh toán",
        icon: CheckCircle2,
        completed: currentStatus !== "pending",
        current: currentStatus === "confirmed",
      },
      {
        status: "processing",
        title: "Đang chuẩn bị hàng",
        description: "Nhân viên đang đóng gói sản phẩm",
        icon: Package,
        completed: ["processing", "shipping", "delivered"].includes(currentStatus),
        current: currentStatus === "processing",
      },
      {
        status: "shipping",
        title: "Đang giao hàng",
        description: "Đơn hàng đang trên đường đến bạn",
        icon: Truck,
        completed: ["shipping", "delivered"].includes(currentStatus),
        current: currentStatus === "shipping",
      },
      {
        status: "delivered",
        title: "Đã giao hàng",
        description: "Đơn hàng đã được giao thành công",
        icon: CheckCircle2,
        completed: currentStatus === "delivered",
        current: currentStatus === "delivered",
      },
    ];
    return allSteps.filter((step) => step.status !== "cancelled");
  };

  const refreshOrderStatus = async () => {
    if (!order) return;
    setIsRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (error) {
      console.error("Error refreshing order status:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case "BANK":
        return "Chuyển khoản ngân hàng";
      case "MOMO":
        return "Ví MoMo";
      case "COD":
        return "Thanh toán khi nhận hàng";
      default:
        return method;
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "unpaid":
        return "text-amber-700 bg-amber-50 border-amber-200";
      case "refunded":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-slate-700 bg-slate-50 border-slate-200";
    }
  };

  const getPaymentStatusText = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return "Đã thanh toán";
      case "unpaid":
        return "Chưa thanh toán";
      case "refunded":
        return "Đã hoàn tiền";
      default:
        return status;
    }
  };

  const handleStarClick = (rating: number) => {
    setReviewData(prev => ({ ...prev, rating }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isValidSize = file.size <= 5 * 1024 * 1024; // tối đa 5MB
      return isImage && isValidSize;
    });

    setReviewData((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles].slice(0, 5), // tối đa 5 ảnh
    }));
  };

  const removeImage = (index: number) => {
    setReviewData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const submitReview = async () => {
    if (reviewData.rating === 0) {
      alert("Vui lòng chọn số sao đánh giá!");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const formData = new FormData();
      formData.append("orderId", order?.id.toString() || "");
      formData.append("productId", order?.items?.[0]?.productId?.toString() || "");
      formData.append("rating", reviewData.rating.toString());
      formData.append("comment", reviewData.comment);

      reviewData.images.forEach((file) => {
        formData.append("images", file);
      });

      const res = await fetch("http://localhost:3000/api/review/add", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Lỗi khi gửi review");
      }

      console.log("✅ Review submitted:", data);

      setReviewData({ rating: 0, comment: "", images: [] });
      setShowReviewModal(false);

      alert("Cảm ơn bạn đã đánh giá! Đánh giá của bạn sẽ giúp ích cho các khách hàng khác.");
    } catch (error) {
      console.error("❌ Error submitting review:", error);
      alert("Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại!");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const { id } = useParams();
  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem("token");

    fetch(`http://localhost:3000/api/payment/get/orders/${id}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then(async res => {
        const text = await res.text();
        console.log("👉 Raw response:", text);
        try {
          const data = JSON.parse(text);
          setOrder(data.order);
        } catch (e) {
          console.error("❌ JSON parse error:", e);
        }
      })
      .catch(err => console.error("Lỗi fetch order:", err));
  }, [id]);

  // Socket connection effects
  useEffect(() => {
    const handleConnect = () => console.log("✅ Socket connected:", socket.id);
    const handleError = (err: Error) => console.error("🔥 Socket error:", err.message);

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleError);

    if (!socket.connected) socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleError);
    };
  }, []);

  useEffect(() => {
    if (!order?.id) return;

    console.log("🚀 Joining room for orderId:", order.id);
    socket.emit("joinOrderRoom", { orderId: order.id });

    const handleOrderUpdated = (updatedOrder: ExtendedOrder) => {
      console.log("🔄 Received orderUpdated:", updatedOrder);
      setOrder(updatedOrder);
    };

    socket.on("updateOrder", handleOrderUpdated);

    return () => {
      console.log("🧹 Leaving room for order", order.id);
      socket.emit("leaveOrderRoom", { orderId: order.id });
      socket.off("orderUpdated", handleOrderUpdated);
    };
  }, [order?.id]);

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Đang tải thông tin đơn hàng</h3>
          <p className="text-slate-600">Vui lòng chờ trong giây lát...</p>
        </div>
      </div>
    );
  }

  const statusSteps = getStatusSteps(order.status, order.paymentStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Premium Header */}
      <div className="bg-white shadow-xl border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="group p-3 hover:bg-slate-100 rounded-2xl transition-all duration-200"
              >
                <ArrowLeft className="w-6 h-6 text-slate-700 group-hover:text-slate-900 transition-colors" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Chi tiết đơn hàng</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 bg-slate-50 px-4 py-2 rounded-xl">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-slate-700">Bảo hành chính hãng</span>
              </div>
              
              <button
                onClick={refreshOrderStatus}
                disabled={isRefreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-all duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="font-medium">Cập nhật</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Success Section */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mb-8 shadow-2xl">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {order.paymentStatus === "paid" ? "🎉 Đặt hàng thành công!" : "✨ Đơn hàng đã được tạo!"}
            </h2>
            
            <p className="text-xl text-emerald-50 mb-8 max-w-2xl mx-auto leading-relaxed">
              {order.paymentStatus === "paid"
                ? "Cảm ơn bạn đã tin tưởng và mua sắm tại cửa hàng. Đơn hàng sẽ được xử lý và giao đến bạn sớm nhất."
                : "Đơn hàng đã được tạo thành công. Vui lòng hoàn tất thanh toán để chúng tôi xử lý đơn hàng."}
            </p>

            {/* Premium Order Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <Hash className="w-8 h-8 text-white/80 mb-3" />
                <p className="text-emerald-100 text-sm mb-2">Mã đơn hàng</p>
                <div className="flex items-center justify-center space-x-2">
                  <p className="font-bold text-xl">#{order.id}</p>
                  <button
                    onClick={() => copyToClipboard(order.id.toString())}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    ) : (
                      <Copy className="w-4 h-4 text-white/80" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <Calendar className="w-8 h-8 text-white/80 mb-3" />
                <p className="text-emerald-100 text-sm mb-2">Ngày đặt hàng</p>
                <p className="font-bold text-xl">
                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <CreditCard className="w-8 h-8 text-white/80 mb-3" />
                <p className="text-emerald-100 text-sm mb-2">Tổng thanh toán</p>
                <p className="font-bold text-2xl">{formatPrice(order.totalAmount)}</p>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 mt-12 text-emerald-100">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm">Thanh toán bảo mật</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5" />
                <span className="text-sm">Giao hàng nhanh chóng</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span className="text-sm">Cam kết chất lượng</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="xl:col-span-2 space-y-8">
            {/* Enhanced Order Timeline */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-indigo-50 p-8 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                      <Truck className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">Trạng thái đơn hàng</h3>
                      <p className="text-slate-600">Cập nhật theo thời gian thực</p>
                    </div>
                  </div>
                  {order.trackingNumber && (
                    <div className="text-right bg-white px-4 py-3 rounded-xl shadow-sm border">
                      <p className="text-sm text-slate-600 mb-1">Mã vận đơn</p>
                      <p className="font-bold text-slate-900 text-lg">{order.trackingNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8">
                <div className="space-y-8">
                  {statusSteps.map((step, index) => {
                    // const StepIcon = step.icon;
                    return (
                      <div key={step.status} className="relative flex items-center group">
                        {/* Enhanced Timeline line */}
                        {index < statusSteps.length - 1 && (
                          <div className={`absolute left-8 top-16 w-1 h-12 rounded-full transition-all duration-500 ${
                            step.completed 
                              ? 'bg-gradient-to-b from-emerald-400 to-emerald-500' 
                              : 'bg-slate-200'
                          }`} />
                        )}

                        {/* Enhanced Step icon */}
                        <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-2xl border-4 transition-all duration-300 ${
                          step.completed
                            ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-200'
                            : step.current
                              ? 'bg-gradient-to-br from-blue-400 to-indigo-500 border-blue-400 text-white animate-pulse shadow-lg shadow-blue-200'
                              : 'bg-white border-slate-300 text-slate-400 group-hover:border-slate-400'
                        }`}>
                          {/* <StepIcon className="w-7 h-7" /> */}
                        </div>

                        {/* Enhanced Step content */}
                        <div className="ml-6 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className={`text-xl font-bold transition-colors ${
                                step.completed || step.current ? 'text-slate-900' : 'text-slate-500'
                              }`}>
                                {step.title}
                              </h4>
                              <p className={`text-sm mt-1 ${
                                step.completed || step.current ? 'text-slate-600' : 'text-slate-400'
                              }`}>
                                {step.description}
                              </p>
                              {step.current && (
                                <div className="flex items-center space-x-2 mt-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                  <span className="text-blue-600 text-sm font-medium">Đang xử lý</span>
                                </div>
                              )}
                            </div>
                            {step.estimatedDate && (
                              <div className="text-right bg-slate-50 px-4 py-2 rounded-xl">
                                <p className="text-xs text-slate-500 uppercase tracking-wide">Dự kiến</p>
                                <p className="font-semibold text-slate-700 text-sm">
                                  {formatDate(step.estimatedDate)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {order.estimatedDelivery && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                        <Clock className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-blue-900 text-lg">Dự kiến giao hàng</p>
                        <p className="text-blue-700 text-lg">{formatDate(order.estimatedDelivery)}</p>
                        <p className="text-blue-600 text-sm mt-1">Chúng tôi sẽ giao hàng đúng hẹn</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Delivery Address */}
            {order.address && (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-orange-50 p-8 border-b border-slate-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">Địa chỉ giao hàng</h3>
                      <p className="text-slate-600">Thông tin người nhận</p>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-slate-500 uppercase tracking-wide mb-2">Người nhận</p>
                        <p className="font-bold text-slate-900 text-xl">{order.address.fullName}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Số điện thoại</p>
                          <p className="font-semibold text-slate-900">{order.address.phone}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-slate-500 uppercase tracking-wide mb-2">Địa chỉ</p>
                        <p className="text-slate-700 leading-relaxed">{order.address.address}</p>
                        <p className="text-slate-600 mt-2">
                          {order.address.ward}, {order.address.district}, {order.address.city}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Order Items */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-purple-50 p-8 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">Sản phẩm đã đặt</h3>
                      <p className="text-slate-600">{order.items.length} sản phẩm</p>
                    </div>
                  </div>
                  <div className="bg-purple-100 px-4 py-2 rounded-xl">
                    <span className="text-purple-700 font-semibold">{order.items.length} items</span>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="space-y-6">
                  {(order.items as ExtendedOrderItem[]).map((item, index) => {
                    const imageSrc = item.image ?? item.product?.image ?? null;
                    const colorName = item.colorName ?? item.color?.name ?? null;

                    return (
                      <div key={index} className="group p-6 bg-gradient-to-r from-slate-50 to-slate-50/50 rounded-3xl border border-slate-200 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center space-x-6">
                          <div className="relative">
                            <div className="w-24 h-24 bg-slate-200 rounded-2xl overflow-hidden shadow-md">
                              {imageSrc ? (
                                <img
                                  src={imageSrc}
                                  alt={item.product?.name ?? "Sản phẩm"}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white">
                                  <Package className="w-8 h-8" />
                                </div>
                              )}
                            </div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {item.quantity}
                            </div>
                          </div>

                          <div className="flex-1">
                            <h4 className="font-bold text-slate-900 text-xl leading-tight mb-2">
                              {item.product?.name}
                            </h4>
                            {colorName && (
                              <div className="flex items-center space-x-2 mb-3">
                                <span className="text-slate-600">Màu sắc:</span>
                                <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm font-medium">
                                  {colorName}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <span className="text-slate-600">Số lượng:</span>
                                  <span className="font-semibold text-slate-900">{item.quantity}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-slate-600">Đơn giá:</span>
                                  <span className="font-semibold text-slate-900">{formatPrice(item.price)}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-slate-500 mb-1">Thành tiền</p>
                                <p className="font-bold text-slate-900 text-2xl">
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Enhanced Sidebar */}
          <div className="xl:col-span-1">
            <div className="sticky top-32 space-y-6">
              {/* Enhanced Payment Info */}
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-green-50 p-6 border-b border-slate-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Thanh toán</h3>
                      <p className="text-slate-600 text-sm">Thông tin giao dịch</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Phương thức</span>
                    <span className="font-bold text-slate-900">
                      {getPaymentMethodName(order.paymentMethod)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <span className="text-slate-600 font-medium">Trạng thái</span>
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {getPaymentStatusText(order.paymentStatus)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Enhanced Order Summary */}
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b border-slate-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                      <Hash className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Tóm tắt đơn hàng</h3>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between py-2">
                      <span className="text-slate-600">Tạm tính</span>
                      <span className="font-semibold text-slate-900">{formatPrice(order.totalAmount ?? order.total ?? 0)}</span>
                    </div>

                    {order.vatAmount && order.vatAmount > 0 && (
                      <div className="flex justify-between py-2">
                        <span className="text-slate-600">VAT (10%)</span>
                        <span className="font-semibold text-slate-900">{formatPrice(order.vatAmount)}</span>
                      </div>
                    )}

                    {order.shippingFee && order.shippingFee > 0 && (
                      <div className="flex justify-between py-2">
                        <span className="text-slate-600">Phí vận chuyển</span>
                        <span className="font-semibold text-slate-900">{formatPrice(order.shippingFee)}</span>
                      </div>
                    )}

                    {order.voucherDiscount && order.voucherDiscount > 0 && (
                      <div className="flex justify-between py-2 text-emerald-600">
                        <span>Giảm giá {order.voucherName ? `(${order.voucherName})` : ""}</span>
                        <span className="font-semibold">-{formatPrice(order.voucherDiscount)}</span>
                      </div>
                    )}

                    <div className="border-t-2 border-slate-200 pt-4 mt-6">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-slate-900">Tổng thanh toán</span>
                        <span className="text-2xl font-bold text-indigo-600">
                          {formatPrice(order.totalAmount ?? order.total ?? 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
                >
                  <Home className="w-5 h-5" />
                  <span>Tiếp tục mua sắm</span>
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 border border-blue-200 hover:border-blue-300">
                    <Download className="w-4 h-4" />
                    <span>Hóa đơn</span>
                  </button>

                  <button className="bg-amber-50 hover:bg-amber-100 text-amber-700 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 border border-amber-200 hover:border-amber-300">
                    <MessageCircle className="w-4 h-4" />
                    <span>Hỗ trợ</span>
                  </button>
                </div>

                {order.status === 'delivered' && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
                  >
                    <Star className="w-5 h-5" />
                    <span>Đánh giá sản phẩm</span>
                  </button>
                )}
              </div>

              {/* Enhanced Help Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-blue-900 text-lg">Cần hỗ trợ?</h4>
                </div>
                
                <div className="space-y-3 text-blue-800">
                  <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-semibold">Hotline 24/7</p>
                      <p className="text-sm">0365515124</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-semibold">Email hỗ trợ</p>
                      <p className="text-sm">huy126347@gmail.com</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust & Security Badges */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-4 text-center">Cam kết của chúng tôi</h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Shield className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Bảo mật</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Award className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Chất lượng</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Hỗ trợ</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <Heart className="w-5 h-5 text-red-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Tận tâm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Premium Modal Header */}
            <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 p-8 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900">Đánh giá sản phẩm</h3>
                    <p className="text-slate-600 mt-1">Chia sẻ trải nghiệm để giúp đỡ người khác</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="p-3 hover:bg-white/80 rounded-2xl transition-colors"
                >
                  <X className="w-6 h-6 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Enhanced Modal Content */}
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              <div className="space-y-8">
                {/* Premium Star Rating */}
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-6">Đánh giá tổng thể</h4>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleStarClick(star)}
                          className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 transform ${
                            star <= reviewData.rating
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white scale-110 shadow-lg'
                              : 'bg-slate-100 text-slate-400 hover:bg-yellow-50 hover:text-yellow-400 hover:scale-105'
                          }`}
                        >
                          <Star className={`w-10 h-10 ${star <= reviewData.rating ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900">
                        {reviewData.rating === 0 && "Chọn số sao đánh giá"}
                        {reviewData.rating === 1 && "😞 Rất không hài lòng"}
                        {reviewData.rating === 2 && "😐 Không hài lòng"}
                        {reviewData.rating === 3 && "😊 Bình thường"}
                        {reviewData.rating === 4 && "😀 Hài lòng"}
                        {reviewData.rating === 5 && "🤩 Rất hài lòng"}
                      </p>
                      {reviewData.rating > 0 && (
                        <p className="text-slate-600 mt-2">
                          {reviewData.rating}/5 sao
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Enhanced Comment Section */}
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-4">Nhận xét chi tiết</h4>
                  <div className="relative">
                    <textarea
                      value={reviewData.comment}
                      onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Hãy chia sẻ trải nghiệm thật của bạn về sản phẩm này. Đánh giá của bạn sẽ giúp ích rất nhiều cho những khách hàng khác..."
                      className="w-full h-36 p-6 border border-slate-300 rounded-2xl resize-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 text-lg leading-relaxed"
                      maxLength={500}
                    />
                    <div className="absolute bottom-3 right-6 text-sm text-slate-500">
                      {reviewData.comment.length}/500
                    </div>
                  </div>
                </div>

                {/* Enhanced Image Upload */}
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-4">
                    Hình ảnh thực tế
                    <span className="text-base font-normal text-slate-500 ml-3">Tối đa 5 ảnh (5MB/ảnh)</span>
                  </h4>
                  
                  {/* Premium Upload Area */}
                  <div className="mb-6">
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-yellow-500 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-300 group">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-slate-100 group-hover:bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                          <Camera className="w-8 h-8 text-slate-400 group-hover:text-yellow-600" />
                        </div>
                        <p className="text-lg font-semibold text-slate-700 group-hover:text-slate-900">
                          Chọn ảnh để tải lên
                        </p>
                        <p className="text-slate-500 mt-1">PNG, JPG, JPEG - Tối đa 5MB mỗi ảnh</p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={reviewData.images.length >= 5}
                      />
                    </label>
                  </div>

                  {/* Enhanced Image Previews */}
                  {reviewData.images.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-600 mb-4">
                        Đã chọn {reviewData.images.length}/5 ảnh
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {reviewData.images.map((file, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Modal Footer */}
            <div className="p-8 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-slate-50">
              <div className="flex items-center justify-between">
                <p className="text-slate-600">
                  Đánh giá của bạn sẽ được hiển thị công khai
                </p>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="px-8 py-3 text-slate-600 hover:bg-slate-200 rounded-2xl font-bold transition-all duration-300"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={submitReview}
                    disabled={reviewData.rating === 0 || isSubmittingReview}
                    className="px-10 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-2xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 shadow-lg disabled:shadow-none"
                  >
                    {isSubmittingReview ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Đang gửi đánh giá...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Gửi đánh giá</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSuccess;