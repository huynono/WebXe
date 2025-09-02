// order.ts

// Status đơn hàng
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

// Item trong đơn hàng
export type OrderItem = {
  id: number;          // ID trong DB
  productId: number;
  quantity: number;
  price: number;
  colorId?: number | null;
  product: {
    id: number;
    name: string;
    image: string;
  };
  color?: {
    id: number;
    name: string;
  } | null;
};

// Đơn hàng
export type Order = {
  id: number;
  userId: string;
  totalAmount: number;
  paymentMethod: 'BANK' | 'MOMO' | 'COD';
  voucherId?: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  address?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    ward: string;
  };
  estimatedDelivery?: string;
  trackingNumber?: string;
  voucherDiscount?: number;
  shippingFee?: number;
};

// Mở rộng OrderItem để dùng trong OrderSuccess
export type ExtendedOrderItem = OrderItem & {
  image?: string | null;
  colorName?: string | null;
};

// Mở rộng Order để hiển thị thông tin tóm tắt
// Mở rộng Order để hiển thị thông tin tóm tắt
export type ExtendedOrder = Order & {
  subtotal?: number;
  vatAmount?: number;
  shippingFee?: number;
  voucherDiscount?: number;
  voucherName?: string; // thêm tên voucher
  total?: number;
  items: ExtendedOrderItem[];
};
