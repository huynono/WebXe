import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Smartphone,
  Tag,
  Check,
  AlertCircle,
  Shield,
  Truck,
  Gift,
  Percent,
  Copy,
  CheckCircle2
} from 'lucide-react';

type CartItem = {
  cartItemId: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  color?: string;
  category?: string;
};

type Address = {
  fullName: string;
  phone: string;
  address: string;
  city: string;     // lưu tên tỉnh
  district: string; // lưu tên quận
  ward: string;     // lưu tên phường
  cityCode: string;     // lưu code tỉnh để fetch quận
  districtCode: string; // lưu code quận để fetch phường
  wardCode: string;     // lưu code phường
};

type PaymentMethod = {
  id: string;
  name: string;
  icon: React.ComponentType;
  description: string;
  backendValue: string; // Thêm mapping cho backend
};

type Voucher = {
  id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  minOrderValue: number;
  description: string;
};

type AppliedVoucher = {
  id: string;
  code: string;
  discountAmount: number;
  discountType: 'PERCENT' | 'FIXED';
  finalShipping: number;
  finalTotal: number;
  description?: string;
  discount?: number;
  discountValue?: number;
};

type City = {
  code: number;
  name: string;
};

type District = {
  code: number;
  name: string;
};

type Ward = {
  code: number;
  name: string;
};

type CartItemType = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  colorId?: number;
  image?: string;
  color?: string;
  productId: number;   // 👈 thêm field này
};

type OrderItem = {
  productId: number;
  quantity: number;
  price: number;
  colorId?: number | null;
};

type Order = {
  id: number;
  userId: string;
  totalAmount: number;
  paymentMethod: 'BANK' | 'COD';
  voucherId?: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid';
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

type PaymentResponse = {
  order: Order;
  qrCodeUrl?: string;
  payUrl?: string;
  voucherDiscount?: number; // 👈 thêm dòng này
  bankInfo?: {
    bankName: string;
    accountNo: string;
    accountName: string;
  };
};

type ExtendedOrderItem = OrderItem & {
  image?: string | null;
  color?: string | null;
};

type ExtendedOrder = Order & {
  voucherDiscount?: number;
  subtotal?: number;
  vatAmount?: number;
  voucherName?: string;
  shippingFee?: number;
  items: ExtendedOrderItem[];
};

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedCartItems } = location.state || { selectedCartItems: [] };

  const items: CartItem[] = selectedCartItems;

  const [address, setAddress] = useState<Address>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    cityCode: '',
    districtCode: '',
    wardCode: ''
  });

  // ===== Dữ liệu hành chính VN =====
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // Fetch tỉnh/thành
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=1")
      .then(res => res.json())
      .then(data => setCities(data))
      .catch(err => console.error("Lỗi fetch cities:", err));
  }, []);

  // Khi chọn tỉnh -> fetch quận/huyện
  useEffect(() => {
    if (address.cityCode) {
      fetch(`https://provinces.open-api.vn/api/p/${address.cityCode}?depth=2`)
        .then(res => res.json())
        .then(data => setDistricts(data.districts))
        .catch(err => console.error("Lỗi fetch districts:", err));
      setAddress(prev => ({ ...prev, district: "", ward: "", districtCode: "", wardCode: "" }));
      setWards([]);
    }
  }, [address.cityCode]);

  // Khi chọn quận -> fetch phường/xã
  useEffect(() => {
    if (address.districtCode) {
      fetch(`https://provinces.open-api.vn/api/d/${address.districtCode}?depth=2`)
        .then(res => res.json())
        .then(data => setWards(data.wards))
        .catch(err => console.error("Lỗi fetch wards:", err));
      setAddress(prev => ({ ...prev, ward: "", wardCode: "" }));
    }
  }, [address.districtCode]);

  const [selectedPayment, setSelectedPayment] = useState<string>('banking');
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | null>(null);
  const [voucherError, setVoucherError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);

  const [cartItems] = useState<CartItemType[]>(selectedCartItems || []);

  // State cho payment
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [showPaymentQR, setShowPaymentQR] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/voucher/getvoucher");
        if (!response.ok) throw new Error("Failed to fetch vouchers");
        const data = await response.json();
        const vouchersArray = Array.isArray(data) ? data : data.vouchers || [];
        setAvailableVouchers(vouchersArray);
      } catch (error) {
        console.error("Error fetching vouchers:", error);
        setAvailableVouchers([]);
      }
    };
    fetchVouchers();
  }, []);

  // Cập nhật payment methods - chỉ giữ lại banking và COD
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'banking',
      name: 'Chuyển khoản ngân hàng',
      icon: Smartphone,
      description: 'Quét mã QR hoặc chuyển khoản thủ công',
      backendValue: 'BANK'
    },
    {
      id: 'cod',
      name: 'Thanh toán khi nhận hàng',
      icon: CreditCard,
      description: 'Thanh toán bằng tiền mặt khi nhận hàng',
      backendValue: 'COD'
    }
  ];

  // ======= Calculations =======
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const vatAmount = subtotal * 0.1;
  const finalShipping = appliedVoucher?.finalShipping ?? 500000;
  const discount = appliedVoucher?.discountAmount ?? 0;
  const total = appliedVoucher?.finalTotal ?? (subtotal + vatAmount + finalShipping - discount);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const applyVoucher = async (code: string) => {
    if (!code || subtotal <= 0) {
      setVoucherError('❌ Thiếu mã voucher hoặc tổng đơn hàng');
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/api/voucher/applyvoucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, orderTotal: subtotal }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Lỗi khi áp voucher');
      const voucherFromApi: AppliedVoucher = {
        id: data.voucher.id,
        code: data.voucher.code,
        discountAmount: data.voucher.discountAmount,
        discountType: data.voucher.discountType === 'PERCENT' ? 'PERCENT' : 'FIXED',
        discountValue: data.voucher.discountValue,
        finalShipping: data.voucher.finalShipping,
        finalTotal: data.voucher.finalTotal,
        description: data.voucher.description || '',
      };
      setAppliedVoucher(voucherFromApi);
      setVoucherCode('');
      setVoucherError('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setVoucherError(err.message || 'Không áp dụng được voucher');
      } else {
        setVoucherError('Không áp dụng được voucher');
      }
    }
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherError('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitOrder = async () => {
    if (!address.fullName || !address.phone || !address.address || !address.cityCode || !address.districtCode || !address.wardCode) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }
    // ===== LOG DỮ LIỆU DEBUG =====
    console.log("📝 Địa chỉ giao hàng:", address);
    console.log("🛒 Cart Items:", cartItems);
    console.log("💳 Phương thức thanh toán:", selectedPayment);
    console.log("🏷️ Voucher áp dụng:", appliedVoucher);
    console.log("💰 Tổng thanh toán dự kiến:", total);

    setIsProcessing(true);

    try {
      const token = localStorage.getItem("token");
      const userName = localStorage.getItem("userName");
      const email = localStorage.getItem("email");

      if (!token || !userName || !email) {
        alert("Thông tin người dùng không hợp lệ. Vui lòng đăng nhập lại");
        setIsProcessing(false);
        return;
      }

      const selectedMethod = paymentMethods.find(method => method.id === selectedPayment);

      // Fix colorId mapping - đảm bảo colorId được truyền đúng định dạng
      const requestBody = {
        paymentMethod: selectedMethod?.backendValue || 'COD',
        voucherId: appliedVoucher ? appliedVoucher.id : null,
        totalAmount: total,

        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          // Fix: đảm bảo colorId là number hoặc null, không phải undefined
          colorId: item.colorId !== undefined && item.colorId !== null ? Number(item.colorId) : null
        })),
        address: address
      };

      console.log("🚀 Request body gửi lên server:", JSON.stringify(requestBody, null, 2));

      const res = await fetch("http://localhost:3000/api/payment/createorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Không thể tạo đơn hàng");
      }

      setPaymentData(data);

      // Nếu là COD thì hoàn tất luôn
      if (selectedPayment === 'cod') {
        // COD: hoàn tất ngay
        setPaymentSuccess(true);
        alert("✅ Đơn hàng đã được tạo thành công!");
        setTimeout(() => {
          navigate("/ordersuccess", {
            state: {
              orderData: {
                ...data.order,
                // voucherDiscount như hiện tại
                voucherDiscount: data.voucherDiscount ?? appliedVoucher?.discountAmount ?? 0,
                voucherName: appliedVoucher?.code ?? "",  // 👈 Thêm dòng này

                // enrich items
                items: data.order.items.map((item: OrderItem) => {
                  const productInCart = cartItems.find(
                    (ci) => ci.productId === item.productId
                  );
                  return {
                    ...item,
                    image: productInCart?.image || null,
                    color: productInCart?.color || null,
                  };
                }),

                // các giá trị đã tính ở Checkout
                subtotal: subtotal,
                vatAmount: vatAmount,
                shippingFee: finalShipping,
              },
            },
          });

        }, 1500);
      } else {
        // Banking: hiển thị QR, chưa thanh toán
        console.log("💳 Banking payment data received:", data);
        setPaymentData(data);
        setShowPaymentQR(true);
      }
    } catch (err) {
      console.error("❌ Lỗi khi tạo đơn hàng:", err);
      alert("Không thể tạo đơn hàng: " + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    setShowPaymentQR(false);
    alert("✅ Thanh toán thành công! Đơn hàng đã được xác nhận.");

    setTimeout(() => {
      if (!paymentData) return;

      const orderData: ExtendedOrder = {
        ...paymentData.order,

        // thêm các field bổ sung
        voucherDiscount:
          paymentData.voucherDiscount ?? appliedVoucher?.discountAmount ?? 0,
        voucherName: appliedVoucher?.code ?? "", // 👈 Thêm dòng này
        subtotal: subtotal,           // 👈 lấy từ logic đã tính trong Checkout
        vatAmount: vatAmount,         // 👈 thêm VAT
        shippingFee: finalShipping,   // 👈 thêm phí ship

        // enrich items
        items: paymentData.order.items.map((item) => {
          const productInCart = cartItems.find(
            (ci) => ci.productId === item.productId
          );
          return {
            ...item,
            image: productInCart?.image || null,
            color: productInCart?.color || null,
          };
        }),
      };

      navigate("/ordersuccess", { state: { orderData } });
    }, 1500);
  };

  const handleCancelPayment = () => {
    setShowPaymentQR(false);
    setPaymentData(null);
    // Có thể gọi API hủy đơn hàng nếu cần
  };

  if (items.length === 0) {
    return <div>Không có sản phẩm nào được chọn</div>;
  }

  // Hiển thị QR thanh toán - chỉ cho banking
  if (showPaymentQR && paymentData) {
    console.log("💳 QR URL hiển thị:", paymentData.qrCodeUrl);
    console.log("State showPaymentQR:", showPaymentQR);
    console.log("State paymentData:", paymentData);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Chuyển khoản ngân hàng
            </h2>
            <p className="text-slate-600">
              Quét mã QR để thanh toán {formatPrice(total)}
            </p>
          </div>

          {/* QR Code - Fix hiển thị QR */}
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 mb-6">
            {paymentData.qrCodeUrl ? (
              <div className="flex flex-col items-center">
                <img
                  src={
                    paymentData.qrCodeUrl.startsWith("data:image")
                      ? paymentData.qrCodeUrl
                      : paymentData.qrCodeUrl
                  }
                  alt="QR Code thanh toán"
                  className="w-64 h-64 mx-auto"
                  onLoad={() => console.log("✅ QR Code loaded successfully:", paymentData.qrCodeUrl)}
                  onError={(e) => {
                    console.error("❌ Lỗi load QR Code:", paymentData.qrCodeUrl);
                    const img = e.target as HTMLImageElement;
                    img.style.display = "none"; // Ẩn ảnh bị lỗi

                    // Hiện fallback text
                    const fallback = document.getElementById("qr-fallback");
                    if (fallback) fallback.classList.remove("hidden");
                  }}
                />

                {/* Fallback nếu ảnh không load được */}
                <div id="qr-fallback" className="hidden text-center mt-4">
                  <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                  <p className="text-red-600">Không thể tải QR Code</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Vui lòng dùng thông tin chuyển khoản thủ công
                  </p>
                </div>

                <p className="text-xs text-slate-500 mt-2 text-center">
                  Quét mã QR bằng app ngân hàng
                </p>
              </div>
            ) : (
              <div className="text-center p-8">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">Không thể tạo mã QR</p>
                <p className="text-sm text-slate-500 mt-2">
                  Vui lòng chuyển khoản thủ công theo thông tin bên dưới
                </p>
              </div>
            )}
          </div>

          {/* Thông tin chuyển khoản */}
          {paymentData.bankInfo && (
            <div className="bg-slate-50 rounded-2xl p-6 mb-6 space-y-4">
              <h3 className="font-bold text-slate-800 text-center">Thông tin chuyển khoản</h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Ngân hàng:</span>
                  <span className="font-semibold">{paymentData.bankInfo.bankName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Số tài khoản:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold">{paymentData.bankInfo.accountNo}</span>
                    <button
                      onClick={() => copyToClipboard(paymentData.bankInfo!.accountNo)}
                      className="p-1 hover:bg-slate-200 rounded"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Chủ tài khoản:</span>
                  <span className="font-semibold">{paymentData.bankInfo.accountName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Số tiền:</span>
                  <span className="font-bold text-lg text-red-600">{formatPrice(total)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Nội dung:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm">Thanh toan don hang {paymentData.order.id}</span>
                    <button
                      onClick={() => copyToClipboard(`Thanh toan don hang ${paymentData.order.id}`)}
                      className="p-1 hover:bg-slate-200 rounded"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handlePaymentSuccess}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold transition-colors flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Đã thanh toán xong</span>
            </button>

            <button
              onClick={handleCancelPayment}
              className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 py-3 rounded-2xl font-medium transition-colors"
            >
              Hủy thanh toán
            </button>
          </div>

          <p className="text-xs text-slate-500 text-center mt-4">
            Vui lòng chỉ nhấn "Đã thanh toán xong" sau khi chuyển khoản thành công
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl border-b sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6 flex items-center space-x-6">
          <button onClick={() => navigate(-1)} className="p-3 hover:bg-slate-100 rounded-xl">
            <ArrowLeft className="w-6 h-6 text-slate-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Thanh toán</h1>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          {/* Left */}
          <div className="xl:col-span-2 space-y-8">
            {/* Address */}
            <div className="bg-white rounded-3xl shadow-lg border">
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold flex items-center">
                  <MapPin className="w-6 h-6 mr-3" />
                  Thông tin giao hàng
                </h3>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label>Họ và tên *</label>
                  <input type="text" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} className="w-full px-4 py-3 border rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label>Số điện thoại *</label>
                  <input type="tel" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} className="w-full px-4 py-3 border rounded-xl" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label>Địa chỉ cụ thể *</label>
                  <textarea value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })} className="w-full px-4 py-3 border rounded-xl h-24" />
                </div>

                {/* Tỉnh/Thành phố */}
                <div className="space-y-2">
                  <label>Tỉnh/Thành phố *</label>
                  <select
                    value={address.cityCode}
                    onChange={(e) => {
                      const selectedCity = cities.find(city => city.code.toString() === e.target.value);
                      setAddress({
                        ...address,
                        cityCode: e.target.value,
                        city: selectedCity ? selectedCity.name : ''
                      });
                    }}
                    className="w-full px-4 py-3 border rounded-xl"
                  >
                    <option value="">Chọn Tỉnh/Thành phố</option>
                    {cities.map((city) => (
                      <option key={city.code} value={city.code}>{city.name}</option>
                    ))}
                  </select>
                </div>

                {/* Quận/Huyện */}
                <div className="space-y-2">
                  <label>Quận/Huyện *</label>
                  <select
                    value={address.districtCode}
                    onChange={(e) => {
                      const selectedDistrict = districts.find(district => district.code.toString() === e.target.value);
                      setAddress({
                        ...address,
                        districtCode: e.target.value,
                        district: selectedDistrict ? selectedDistrict.name : ''
                      });
                    }}
                    disabled={!districts.length}
                    className="w-full px-4 py-3 border rounded-xl disabled:bg-slate-100"
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {districts.map((d) => (
                      <option key={d.code} value={d.code}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* Phường/Xã */}
                <div className="space-y-2">
                  <label>Phường/Xã *</label>
                  <select
                    value={address.wardCode}
                    onChange={(e) => {
                      const selectedWard = wards.find(ward => ward.code.toString() === e.target.value);
                      setAddress({
                        ...address,
                        wardCode: e.target.value,
                        ward: selectedWard ? selectedWard.name : ''
                      });
                    }}
                    disabled={!wards.length}
                    className="w-full px-4 py-3 border rounded-xl disabled:bg-slate-100"
                  >
                    <option value="">Chọn Phường/Xã</option>
                    {wards.map((w) => (
                      <option key={w.code} value={w.code}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-200/60 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-white p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 flex items-center">
                  <CreditCard className="w-6 h-6 mr-3 text-slate-600" />
                  Phương thức thanh toán
                </h3>
              </div>

              <div className="p-8">
                <div className="space-y-4">
                  {paymentMethods.map((method) => {
                    const isSelected = selectedPayment === method.id;
                    return (
                      <label
                        key={method.id}
                        className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${isSelected
                          ? 'border-slate-400 bg-slate-50 shadow-lg'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={isSelected}
                          onChange={(e) => setSelectedPayment(e.target.value)}
                          className="w-5 h-5 text-slate-600"
                        />
                        <div className="ml-4 flex-1">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-xl ${isSelected ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{method.name}</p>
                              <p className="text-sm text-slate-600">{method.description}</p>
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="p-1 bg-slate-800 rounded-full">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Voucher Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-200/60 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-white p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 flex items-center">
                  <Tag className="w-6 h-6 mr-3 text-slate-600" />
                  Mã giảm giá
                </h3>
              </div>

              <div className="p-8">
                {!appliedVoucher ? (
                  <div className="space-y-4">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all"
                        placeholder="Nhập mã giảm giá"
                      />
                      <button
                        onClick={() => applyVoucher(voucherCode.trim())}
                        disabled={!voucherCode.trim()}
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed"
                      >
                        Áp dụng
                      </button>
                    </div>

                    {voucherError && (
                      <p className="text-red-500 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {voucherError}
                      </p>
                    )}

                    {/* Available vouchers */}
                    <div className="space-y-3 pt-4">
                      <h4 className="text-sm font-semibold text-slate-700 flex items-center">
                        <Gift className="w-4 h-4 mr-2" />
                        Mã giảm giá có sẵn
                      </h4>
                      {Array.isArray(availableVouchers) && availableVouchers.map((voucher) => (
                        <div
                          key={voucher.id}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl"
                        >
                          <div>
                            <p className="font-bold text-amber-800">{voucher.code}</p>
                            <p className="text-sm text-amber-700">{voucher.description}</p>
                            <p className="text-xs text-amber-600">
                              Áp dụng cho đơn hàng từ {formatPrice(voucher.minOrderValue)}
                            </p>
                          </div>
                          <button
                            onClick={() => applyVoucher(voucher.code)}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors"
                          >
                            Sử dụng
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-5 bg-green-50 border border-green-200 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-600 rounded-full">
                        <Percent className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-green-800">{appliedVoucher.code}</p>
                        <p className="text-sm text-green-700">{appliedVoucher.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={removeVoucher}
                      className="text-green-600 hover:text-green-800 font-semibold"
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="xl:col-span-1">
            <div className="sticky top-32 space-y-8">
              {/* Order Items */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-200/60 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-white p-6 border-b border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900">Đơn hàng của bạn</h3>
                  <p className="text-slate-600 mt-1">{items.length} sản phẩm</p>
                </div>

                <div className="p-6">
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.cartItemId} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl">
                        <div className="w-16 h-16 bg-slate-200 rounded-xl overflow-hidden">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{item.name}</p>
                          <p className="text-sm text-slate-600">
                            {item.color && `Màu: ${item.color} • `}
                            Số lượng: {item.quantity}
                          </p>
                          <p className="font-bold text-slate-800">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {paymentSuccess && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                  <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
                    <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold">Thanh toán thành công!</h2>
                    <p className="mt-2">Đơn hàng của bạn đã được xác nhận.</p>
                  </div>
                </div>
              )}

              {/* Price Summary */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-200/60 overflow-hidden">
                <div className="p-8 space-y-6">
                  {/* Tạm tính */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-700 font-medium">Tạm tính</span>
                    <span className="font-bold text-slate-800">{formatPrice(subtotal)}</span>
                  </div>

                  {/* Phí vận chuyển */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-700 font-medium flex items-center">
                      <Truck className="w-4 h-4 mr-2" /> Phí vận chuyển
                    </span>
                    <span className={`font-bold ${finalShipping === 0 ? 'text-green-600' : 'text-slate-800'}`}>
                      {finalShipping === 0 ? 'Miễn phí' : formatPrice(finalShipping)}
                    </span>
                  </div>

                  {/* Nếu freeship, hiển thị dòng trừ phí */}
                  {finalShipping === 0 && (
                    <div className="flex justify-between items-center py-2 text-green-600 font-medium">
                      <span>Giảm phí vận chuyển</span>
                      <span>-{formatPrice(500000)}</span>
                    </div>
                  )}

                  {/* VAT */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-700 font-medium">VAT (10%)</span>
                    <span className="font-bold text-slate-800">{formatPrice(vatAmount)}</span>
                  </div>

                  {/* Giảm giá voucher */}
                  {appliedVoucher && appliedVoucher.discountAmount > 0 && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-green-600 font-medium">
                        Giảm giá {appliedVoucher.discountType === 'PERCENT' ? `(${appliedVoucher.discountValue}%)` : ''}
                      </span>
                      <span className="font-bold text-green-600">
                        -{formatPrice(appliedVoucher.discountAmount)}
                      </span>
                    </div>
                  )}

                  {/* Tổng cộng */}
                  <div className="border-t border-slate-200 pt-6 flex justify-between items-center">
                    <span className="text-xl font-bold text-slate-900">Tổng cộng</span>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-slate-800">
                        {formatPrice(appliedVoucher?.finalTotal ?? (subtotal + vatAmount + finalShipping))}
                      </span>
                      <p className="text-sm text-slate-500 mt-1">Đã bao gồm VAT</p>
                    </div>
                  </div>

                  {/* Nút đặt hàng */}
                  <button
                    onClick={handleSubmitOrder}
                    disabled={isProcessing}
                    className="w-full mt-8 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black 
        disabled:from-slate-400 disabled:to-slate-500 text-white py-5 rounded-2xl font-bold text-lg 
        transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 
        disabled:cursor-not-allowed disabled:transform-none group"
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang xử lý...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center space-x-3">
                        <Shield className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <span>Đặt hàng ngay</span>
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;