import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft, Search, Filter, Calendar, Package, Truck, CheckCircle2,
    Clock, X, Eye, Hash, MapPin, ChevronDown, RefreshCw, ShoppingBag,
    Star, Shield, Award, Users, Heart, CreditCard, Phone
} from "lucide-react";
import socket from "./types/socket";

type OrderStatus = "pending" | "confirmed" | "processing" | "shipping" | "delivered" | "cancelled";
type PaymentStatus = "unpaid" | "paid" | "refunded";

interface OrderSummary {
    id: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: string;
    totalAmount: number;
    createdAt: string;
    trackingNumber?: string;
    itemCount: number;
    firstItemImage?: string;
    firstItemName?: string;
    address?: {
        fullName: string;
        phone: string;
        address: string;
        ward: string;
        district: string;
        city: string;
    };
}

interface APIOrder {
    id: number;
    userId: number;
    totalAmount: number;
    paymentMethod: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    createdAt: string;
    estimatedDelivery?: string;
    trackingNumber?: string;
    items?: {
        product: {
            id: number;
            name: string;
            image: string;
        };
        color?: {
            id: number;
            name: string;
        };
        quantity?: number;
        price?: number;
    }[];
    address?: {
        fullName: string;
        phone: string;
        address: string;
        ward: string;
        district: string;
        city: string;
    };
}

const MyOrders = () => {
    const navigate = useNavigate();

    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<OrderSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");
    const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
    const [showFilters, setShowFilters] = useState(false);

    // Fetch orders
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Chưa có token");

            const res = await fetch("http://localhost:3000/api/payment/getuserorder", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            const data: { orders?: APIOrder[] } = await res.json();
            const ordersArray: APIOrder[] = Array.isArray(data.orders) ? data.orders : [];

            const mappedOrders: OrderSummary[] = ordersArray.map(order => {
                const itemCount = order.items?.reduce(
                    (sum, item) => sum + (item.quantity ?? 0),
                    0
                ) ?? 0;

                return {
                    ...order,
                    firstItemName: order.items?.[0]?.product?.name || '',
                    firstItemImage: order.items?.[0]?.product?.image || '',
                    itemCount,
                    address: order.address
                        ? {
                            fullName: order.address.fullName,
                            phone: order.address.phone,
                            address: order.address.address,
                            ward: order.address.ward,
                            district: order.address.district,
                            city: order.address.city
                        }
                        : undefined
                };
            });

            setOrders(mappedOrders);
            setFilteredOrders(mappedOrders);

        } catch (err) {
            console.error("Fetch orders error:", err);
            setOrders([]);
            setFilteredOrders([]);
        } finally {
            setLoading(false);
        }
    };

    // Status filter config
    const statusFilters: { value: OrderStatus | "all"; label: string; count: number; color: string }[] = [
        { value: "all", label: "Tất cả", count: orders.length, color: "bg-slate-100 text-slate-700 hover:bg-slate-200" },
        { value: "pending", label: "Chờ xử lý", count: orders.filter(o => o.status === "pending").length, color: "bg-amber-100 text-amber-700 hover:bg-amber-200" },
        { value: "confirmed", label: "Đã xác nhận", count: orders.filter(o => o.status === "confirmed").length, color: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
        { value: "processing", label: "Đang chuẩn bị", count: orders.filter(o => o.status === "processing").length, color: "bg-purple-100 text-purple-700 hover:bg-purple-200" },
        { value: "shipping", label: "Đang giao", count: orders.filter(o => o.status === "shipping").length, color: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" },
        { value: "delivered", label: "Đã giao", count: orders.filter(o => o.status === "delivered").length, color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" },
        { value: "cancelled", label: "Đã hủy", count: orders.filter(o => o.status === "cancelled").length, color: "bg-red-100 text-red-700 hover:bg-red-200" },
    ];

    useEffect(() => {
        fetchOrders();
    }, []);

    // Socket realtime
    useEffect(() => {
        socket.connect();
        socket.on("updateOrder", (updatedOrder: OrderSummary) => {
            setOrders(prev =>
                Array.isArray(prev)
                    ? prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o))
                    : []
            );
        });
        return () => {
            socket.off("updateOrder");
            socket.disconnect();
        };
    }, []);

    // Filter + search + sort
    useEffect(() => {
        let filtered: OrderSummary[] = Array.isArray(orders) ? [...orders] : [];

        if (selectedStatus !== "all") {
            filtered = filtered.filter(order => order.status === selectedStatus);
        }

        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.id.toString().includes(searchTerm) ||
                order.firstItemName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortBy === "newest" ? dateB - dateA : dateA - dateB;
        });

        setFilteredOrders(filtered);
    }, [orders, selectedStatus, searchTerm, sortBy]);

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

    const getStatusConfig = (status: OrderStatus) => ({
        pending: {
            color: "text-amber-700 bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200",
            icon: Clock,
            text: "Chờ xử lý",
            bgColor: "bg-amber-50"
        },
        confirmed: {
            color: "text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200",
            icon: CheckCircle2,
            text: "Đã xác nhận",
            bgColor: "bg-blue-50"
        },
        processing: {
            color: "text-purple-700 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200",
            icon: Package,
            text: "Đang chuẩn bị",
            bgColor: "bg-purple-50"
        },
        shipping: {
            color: "text-indigo-700 bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200",
            icon: Truck,
            text: "Đang giao",
            bgColor: "bg-indigo-50"
        },
        delivered: {
            color: "text-emerald-700 bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200",
            icon: CheckCircle2,
            text: "Đã giao",
            bgColor: "bg-emerald-50"
        },
        cancelled: {
            color: "text-red-700 bg-gradient-to-r from-red-50 to-red-100 border-red-200",
            icon: X,
            text: "Đã hủy",
            bgColor: "bg-red-50"
        }
    })[status];

    const getPaymentStatusConfig = (status: PaymentStatus) => ({
        paid: {
            color: "text-emerald-700 bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200",
            text: "Đã thanh toán",
            icon: CheckCircle2
        },
        unpaid: {
            color: "text-amber-700 bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200",
            text: "Chưa thanh toán",
            icon: Clock
        },
        refunded: {
            color: "text-red-700 bg-gradient-to-r from-red-50 to-red-100 border-red-200",
            text: "Đã hoàn tiền",
            icon: X
        }
    })[status];

    const getPaymentMethodName = (method: string) => {
        switch (method) {
            case "BANK":
                return "Chuyển khoản";
            case "MOMO":
                return "Ví MoMo";
            case "COD":
                return "Thanh toán khi nhận";
            default:
                return method;
        }
    };

    const handleViewOrder = (order: OrderSummary) => {
        navigate(`/ordersuccess/${order.id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
                <div className="text-center p-8">
                    <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">Đang tải danh sách đơn hàng</h3>
                    <p className="text-slate-600">Vui lòng chờ trong giây lát...</p>
                </div>
            </div>
        );
    }

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
                                <h1 className="text-2xl font-bold text-slate-900">Đơn hàng của tôi</h1>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="hidden sm:flex items-center space-x-2 bg-slate-50 px-4 py-2 rounded-xl">
                                <Shield className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-slate-700">Mua sắm an toàn</span>
                            </div>

                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-all duration-200"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span className="font-medium">Làm mới</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                                <ShoppingBag className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{orders.length}</p>
                                <p className="text-slate-600 text-sm">Tổng đơn hàng</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">
                                    {orders.filter(o => o.status === "delivered").length}
                                </p>
                                <p className="text-slate-600 text-sm">Đã giao</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                                <Truck className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">
                                    {orders.filter(o => o.status === "shipping").length}
                                </p>
                                <p className="text-slate-600 text-sm">Đang giao</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">
                                    {orders.filter(o => ["pending", "confirmed", "processing"].includes(o.status)).length}
                                </p>
                                <p className="text-slate-600 text-sm">Đang xử lý</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Search + Filter */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-slate-50 to-indigo-50 p-8 border-b border-slate-200">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="relative flex-1 max-w-2xl">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo mã đơn hàng, tên sản phẩm..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-lg shadow-sm"
                                />
                            </div>

                            <div className="flex items-center space-x-4">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
                                    className="px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-medium shadow-sm"
                                >
                                    <option value="newest">🕒 Mới nhất</option>
                                    <option value="oldest">📅 Cũ nhất</option>
                                </select>

                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center space-x-3 px-6 py-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl transition-all duration-200 font-medium shadow-sm"
                                >
                                    <Filter className="w-5 h-5" />
                                    <span>Bộ lọc</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Status Filters */}
                    {showFilters && (
                        <div className="p-8 bg-gradient-to-r from-slate-50/50 to-white">
                            <h4 className="text-lg font-bold text-slate-900 mb-6">Lọc theo trạng thái đơn hàng</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                {statusFilters.map((filter) => (
                                    <button
                                        key={filter.value}
                                        onClick={() => setSelectedStatus(filter.value)}
                                        className={`p-4 rounded-2xl font-semibold transition-all duration-200 border-2 text-center ${selectedStatus === filter.value
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105'
                                                : `${filter.color} border-transparent hover:scale-105 hover:shadow-md`
                                            }`}
                                    >
                                        <div className="text-lg font-bold">{filter.count}</div>
                                        <div className="text-sm">{filter.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Enhanced Orders List */}
                {Array.isArray(filteredOrders) && filteredOrders.length > 0 ? (
                    <div className="space-y-6">
                        {filteredOrders.map((order) => {
                            const statusConfig = getStatusConfig(order.status);
                            const paymentConfig = getPaymentStatusConfig(order.paymentStatus);
                            const StatusIcon = statusConfig.icon;
                            const PaymentIcon = paymentConfig.icon;

                            return (
                                <div key={order.id} className="group bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                                    {/* Premium Order Header */}
                                    <div className={`p-8 border-b border-slate-200 bg-gradient-to-r ${statusConfig.bgColor} to-white`}>
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                            <div className="flex items-center space-x-6">
                                                <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-sm">
                                                    <Hash className="w-5 h-5 text-slate-600" />
                                                    <span className="font-bold text-slate-900 text-lg">#{order.id}</span>
                                                </div>
                                                <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-sm">
                                                    <Calendar className="w-4 h-4 text-slate-500" />
                                                    <span className="text-slate-700 font-medium">{formatDate(order.createdAt)}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-4">
                                                <div className={`px-4 py-3 rounded-2xl text-sm font-bold border-2 flex items-center space-x-2 ${paymentConfig.color} shadow-sm`}>
                                                    <PaymentIcon className="w-4 h-4" />
                                                    <span>{paymentConfig.text}</span>
                                                </div>
                                                <div className={`px-4 py-3 rounded-2xl text-sm font-bold border-2 flex items-center space-x-2 ${statusConfig.color} shadow-sm`}>
                                                    <StatusIcon className="w-4 h-4" />
                                                    <span>{statusConfig.text}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Enhanced Order Content */}
                                    <div className="p-8">
                                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                            {/* Product Section */}
                                            <div className="xl:col-span-2">
                                                <div className="flex items-start space-x-6">
                                                    {order.firstItemImage && (
                                                        <div className="relative">
                                                            <div className="w-24 h-24 bg-slate-200 rounded-2xl overflow-hidden shadow-lg">
                                                                <img
                                                                    src={order.firstItemImage}
                                                                    alt={order.firstItemName}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                                />
                                                            </div>
                                                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                                                                {order.itemCount}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-slate-900 text-xl leading-tight mb-3">
                                                            {order.firstItemName}
                                                        </h3>

                                                        <div className="flex flex-wrap items-center gap-4 mb-4">
                                                            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl">
                                                                <Package className="w-4 h-4 text-slate-600" />
                                                                <span className="text-slate-700 font-medium">
                                                                    {order.itemCount} sản phẩm
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl">
                                                                <CreditCard className="w-4 h-4 text-slate-600" />
                                                                <span className="text-slate-700 font-medium">
                                                                    {getPaymentMethodName(order.paymentMethod)}
                                                                </span>
                                                            </div>

                                                            {order.trackingNumber && (
                                                                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-xl border border-blue-200">
                                                                    <Truck className="w-4 h-4 text-blue-600" />
                                                                    <span className="text-blue-700 font-medium text-sm">
                                                                        {order.trackingNumber}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {order.itemCount > 1 && (
                                                            <p className="text-slate-600 bg-slate-50 px-4 py-2 rounded-xl inline-block">
                                                                và {order.itemCount - 1} sản phẩm khác
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Enhanced Address Section */}
                                                {order.address && (
                                                    <div className="mt-8 p-6 bg-gradient-to-r from-slate-50 to-slate-50/50 rounded-2xl border border-slate-200">
                                                        <div className="flex items-start space-x-4">
                                                            <div className="w-10 h-10 bg-slate-200 rounded-2xl flex items-center justify-center">
                                                                <MapPin className="w-5 h-5 text-slate-600" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-slate-900 mb-2">Địa chỉ giao hàng</h4>
                                                                <div className="space-y-1">
                                                                    <p className="font-semibold text-slate-800">{order.address.fullName}</p>
                                                                    <div className="flex items-center space-x-2">
                                                                        <Phone className="w-4 h-4 text-slate-500" />
                                                                        <p className="text-slate-600">{order.address.phone}</p>
                                                                    </div>
                                                                    <p className="text-slate-600 leading-relaxed">
                                                                        {order.address.address}, {order.address.ward}, {order.address.district}, {order.address.city}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Enhanced Order Summary */}
                                            <div className="xl:col-span-1">
                                                <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl p-6 border border-slate-200">
                                                    <div className="text-center mb-6">
                                                        <p className="text-slate-600 text-sm mb-2">Tổng thanh toán</p>
                                                        <p className="text-3xl font-bold text-slate-900 mb-4">
                                                            {formatPrice(order.totalAmount)}
                                                        </p>

                                                        <button
                                                            onClick={() => handleViewOrder(order)}
                                                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                            <span>Xem chi tiết</span>
                                                        </button>
                                                    </div>

                                                    {/* Quick Actions */}
                                                    <div className="space-y-3">
                                                        {order.status === "delivered" && (
                                                            <button className="w-full bg-yellow-50 hover:bg-yellow-100 text-yellow-700 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 border border-yellow-200">
                                                                <Star className="w-4 h-4" />
                                                                <span>Đánh giá</span>
                                                            </button>
                                                        )}

                                                        {order.status === "shipping" && (
                                                            <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 border border-blue-200">
                                                                <Truck className="w-4 h-4" />
                                                                <span>Theo dõi</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 p-16 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-8">
                                <ShoppingBag className="w-12 h-12 text-slate-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-4">
                                {searchTerm || selectedStatus !== "all" ? "Không tìm thấy đơn hàng" : "Chưa có đơn hàng nào"}
                            </h3>
                            <p className="text-slate-600 mb-8 leading-relaxed">
                                {searchTerm || selectedStatus !== "all"
                                    ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem kết quả khác"
                                    : "Hãy bắt đầu khám phá và mua sắm những sản phẩm yêu thích của bạn"}
                            </p>
                            <button
                                onClick={() => navigate("/")}
                                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                Khám phá sản phẩm
                            </button>
                        </div>
                    </div>
                )}

                {/* Trust Indicators */}
                <div className="mt-12 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-2xl p-8 border border-slate-200">
                    <h4 className="text-xl font-bold text-slate-900 mb-6 text-center">Cam kết của chúng tôi</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h5 className="font-bold text-slate-900 mb-2">Bảo mật tuyệt đối</h5>
                            <p className="text-slate-600 text-sm">Thông tin được mã hóa an toàn</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Award className="w-8 h-8 text-blue-600" />
                            </div>
                            <h5 className="font-bold text-slate-900 mb-2">Chất lượng đảm bảo</h5>
                            <p className="text-slate-600 text-sm">Sản phẩm chính hãng 100%</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-purple-600" />
                            </div>
                            <h5 className="font-bold text-slate-900 mb-2">Hỗ trợ 24/7</h5>
                            <p className="text-slate-600 text-sm">Luôn sẵn sàng hỗ trợ bạn</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-8 h-8 text-red-600" />
                            </div>
                            <h5 className="font-bold text-slate-900 mb-2">Dịch vụ tận tâm</h5>
                            <p className="text-slate-600 text-sm">Đặt khách hàng lên hàng đầu</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyOrders;