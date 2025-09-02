import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Heart,
  Share2,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Shield,
  Award,
  FileText,
  Clock,
  Fuel,
  Car,
  CheckCircle,
  Eye,
  MapPin,
  Users,
  Star,
  Camera,
  Loader2,
} from 'lucide-react';
import Header from './Header';
import Services from './Services';
import Footer from './Footer';
import StarRating from './StarRating';
import AppointmentModal, { AppointmentData } from './AppointmentModal';
import AddToCartModal from './AddToCartModal';
import { MoreVertical } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { X } from "lucide-react";

type JwtPayload = {
  id?: number;
  userId?: number;
  email?: string;
  exp?: number;
};

interface Color {
  id: number;
  name: string;
  hex: string;
  gradient: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  year: number;
  km?: string;
  fuelType?: string;
  image?: string;
  images: { url: string }[];
  specifications: { key: string; value: string }[];
  features: { name: string }[];
  safeties: { name: string }[];
  contactInfo?: string;
  warranty?: string;
  seats?: number;
  description?: string;
  rating?: number;
  totalReviews?: number;
  color: Color[];
}

interface Review {
  id: number;
  rating: number;
  comment?: string;
  user: { id: number; name: string };
  images: { url: string }[];
  createdAt: string;
}

const BASE_URL = 'http://localhost:3000';

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'description' | 'specs' | 'features' | 'safety'>('description');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenCart, setIsModalOpenCart] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // Edit Review Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [editImages, setEditImages] = useState<File[]>([]);
  const [editPreviewImages, setEditPreviewImages] = useState<string[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  // lấy userId từ JWT
  const token = localStorage.getItem("token");
  let currentUserId: number | null = null;

  if (token) {
    try {
      const decoded: JwtPayload = jwtDecode(token);
      currentUserId = decoded.userId || decoded.id || null;
    } catch (err) {
      console.error("❌ Token decode lỗi:", err);
    }
  }


  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const productId = product?.id;

  useEffect(() => {
    if (!productId) return;

    async function fetchReviews() {
      try {
        const res = await fetch(`${BASE_URL}/api/review/get/product/${productId}`);
        const data = await res.json();
        if (res.ok) {
          setReviews(data.reviews);
        }
      } catch (err) {
        console.error("❌ Lỗi fetch reviews:", err);
      }
    }

    fetchReviews();
  }, [productId]);

  // Hàm mở modal edit review
  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment || '');
    setEditPreviewImages(review.images.map(img => img.url));
    setEditImages([]);
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  // Hàm đóng modal edit review
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingReview(null);
    setEditRating(5);
    setEditComment('');
    setEditImages([]);
    setEditPreviewImages([]);
    setHoveredStar(0);
  };

  // Hàm xử lý thay đổi hình ảnh trong edit modal
  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = editPreviewImages.length + files.length;

    if (totalImages > 5) {
      alert('Chỉ được tải lên tối đa 5 hình ảnh');
      return;
    }

    setEditImages(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setEditPreviewImages(prev => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Hàm xóa hình ảnh trong edit modal
  const removeEditImage = (index: number) => {
    const oldImagesCount = editingReview?.images.length || 0;

    if (index < oldImagesCount) {
      // Xóa ảnh cũ
      setEditPreviewImages(prev => prev.filter((_, i) => i !== index));
    } else {
      // Xóa ảnh mới
      const newImageIndex = index - oldImagesCount;
      setEditImages(prev => prev.filter((_, i) => i !== newImageIndex));
      setEditPreviewImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Hàm submit update review
  const handleUpdateReview = async () => {
    if (!editingReview || !token) return;

    setEditLoading(true);

    try {
      console.log("🔑 Token gửi lên:", token);
      console.log("👤 Current userId:", currentUserId);
      console.log("📝 Review đang edit:", editingReview);
      // console.log("➡️ review.userId:", editingReview.userId);

      const formData = new FormData();
      formData.append("rating", editRating.toString());
      formData.append("comment", editComment);

      // Thêm ảnh mới
      editImages.forEach((image) => {
        formData.append("images", image);
      });

      // Thêm thông tin ảnh cũ cần giữ lại
      const oldImages = editingReview.images.filter((_, index) =>
        editPreviewImages.includes(editingReview.images[index].url)
      );
      formData.append(
        "keepImages",
        JSON.stringify(oldImages.map((img) => img.url))
      );

      console.log("📦 Data gửi lên:", {
        rating: editRating,
        comment: editComment,
        keepImages: oldImages.map((img) => img.url),
        newImagesCount: editImages.length,
      });

      const res = await fetch(
        `${BASE_URL}/api/review/update/${editingReview.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      console.log("📥 Kết quả API:", res.status, data);

      if (res.ok) {
        alert("✅ Cập nhật review thành công");
        handleCloseEditModal();

        // Fetch lại reviews
        const reviewsRes = await fetch(
          `${BASE_URL}/api/review/get/product/${productId}`
        );
        const reviewsData = await reviewsRes.json();
        if (reviewsRes.ok) {
          setReviews(reviewsData.reviews);
        }
      } else {
        alert("❌ " + (data?.message || "Không thể cập nhật review"));
      }
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật review:", error);
      alert("❌ Lỗi server, không thể cập nhật review");
    } finally {
      setEditLoading(false);
    }
  };



  const handleDeleteReview = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa review này?")) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("❌ Bạn cần đăng nhập để xóa review");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/review/userdelete/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        alert("✅ Đã xóa review");
        setReviews((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert("❌ " + (data?.message || "Không thể xóa review"));
      }
    } catch (error) {
      console.error("❌ Lỗi khi xóa review:", error);
      alert("❌ Lỗi server, không thể xóa review");
    }
  };

  const handleAddToCart = (data: { productId: number; colorId: number | null; quantity: number }) => {
    console.log('Thêm vào giỏ hàng:', data);
  };

  useEffect(() => {
    if (!slug) return;

    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/product/product/${slug}`);
        const data = await res.json();

        if (res.ok) {
          setProduct(data.product);
          setError(null);
          setCurrentImage(0);
        } else {
          setError(data.message || "Lỗi khi lấy sản phẩm");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  const handleAppointmentSubmit = async (data: AppointmentData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 5000);
    console.log('Appointment data:', data);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl shadow-2xl border border-blue-100">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          <p className="text-gray-700 font-medium text-lg">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl shadow-2xl border-l-4 border-red-500">
          <p className="text-red-600 font-semibold text-lg">Lỗi: {error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl shadow-2xl">
          <p className="text-gray-700 font-medium text-lg">Không tìm thấy sản phẩm.</p>
        </div>
      </div>
    );
  }

  const carImages = [
    product.image && product.image.startsWith('http') ? product.image : null,
    ...product.images.map(img => (img.url && img.url.startsWith('http') ? img.url : null)),
  ].filter(Boolean) as string[];

  const features = product.features.map(f => f.name);
  const safetyFeatures = product.safeties.map(s => s.name);

  const nextImage = () => {
    setCurrentImage(prev => (prev + 1) % carImages.length);
  };

  const prevImage = () => {
    setCurrentImage(prev => (prev - 1 + carImages.length) % carImages.length);
  };

  const discountPercentage = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="fixed top-6 right-6 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 animate-slide-in border border-green-400">
            <CheckCircle className="h-6 w-6" />
            <span className="font-medium">Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.</span>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-10">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <span>Trang chủ</span>
            <span>/</span>
            <span>Sản phẩm</span>
            <span>/</span>
            <span className="text-blue-600 font-medium">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
            {/* Left Column - Images */}
            <div className="xl:col-span-3 space-y-8">
              {/* Main Image Gallery */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="relative h-96 md:h-[500px] bg-gradient-to-br from-gray-50 to-gray-100">
                  <img
                    src={carImages[currentImage]}
                    alt={`${product.name} - Hình ${currentImage + 1}`}
                    className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                  />

                  {/* Discount Badge */}
                  {discountPercentage > 0 && (
                    <div className="absolute top-6 left-6 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                      -{discountPercentage}%
                    </div>
                  )}

                  {/* Image Counter */}
                  <div className="absolute top-6 right-6 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {currentImage + 1} / {carImages.length}
                  </div>

                  {carImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 p-3 rounded-full shadow-xl transition-all duration-200 hover:scale-110"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 p-3 rounded-full shadow-xl transition-all duration-200 hover:scale-110"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {carImages.length > 1 && (
                  <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100">
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                      {carImages.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImage(index)}
                          className={`aspect-video rounded-xl overflow-hidden border-3 transition-all duration-200 hover:scale-105 ${index === currentImage
                            ? 'border-blue-500 shadow-lg ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                            }`}
                        >
                          <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Description */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Mô tả chi tiết</h2>
                </div>

                <div className="prose max-w-full text-gray-700 leading-relaxed break-words whitespace-pre-wrap">
                  {product.description ? (
                    <div
                      className="break-words whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  ) : (
                    <div className="space-y-4">
                      <p className="text-lg">Xe {product.name} năm {product.year} với thiết kế hiện đại và tính năng vượt trội.</p>
                      <p>Được trang bị những công nghệ tiên tiến nhất, mang đến trải nghiệm lái xe tuyệt vời và an toàn tối đa cho người sử dụng.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div className="xl:col-span-2 space-y-8">
              {/* Product Title & Rating */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {product.name}
                </h1>

                {/* Enhanced Rating Section */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <StarRating
                      rating={product.rating || 4.6}
                      totalReviews={product.totalReviews || 127}
                      size="md"
                    />
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Eye className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      className={`p-3 rounded-xl transition-all duration-200 hover:scale-105 ${isFavorite
                        ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <button className="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200 hover:scale-105">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Price Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
                  <div className="flex items-baseline space-x-3 mb-2">
                    <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {product.price.toLocaleString('vi-VN')} ₫
                    </div>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="text-xl text-gray-500 line-through">
                        {product.originalPrice.toLocaleString('vi-VN')} ₫
                      </div>
                    )}
                  </div>
                  {discountPercentage > 0 && (
                    <div className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                      Tiết kiệm {((product.originalPrice! - product.price) / 1000000).toFixed(1)} triệu
                    </div>
                  )}
                </div>

                {/* Color Options */}
                {product.color && product.color.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Màu sắc có sẵn</h3>
                    <div className="flex flex-wrap gap-3">
                      {product.color.map((color, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md bg-white"
                        >
                          <div
                            className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                            style={{
                              background: color.gradient || color.hex,
                            }}
                          ></div>
                          <span className="font-medium text-gray-700">{color.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Vehicle Specifications */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg mr-3">
                    <Car className="h-5 w-5 text-white" />
                  </div>
                  Thông tin xe
                </h3>

                <div className="space-y-4">
                  {[
                    { icon: Clock, label: 'Năm sản xuất', value: product.year },
                    { icon: Gauge, label: 'Km đã đi', value: `${product.km ?? 'N/A'} km` },
                    { icon: Fuel, label: 'Nhiên liệu', value: product.fuelType ?? 'N/A' },
                    { icon: Users, label: 'Số ghế', value: `${product.seats ?? 5} ghế` },
                  ].map(({ icon: Icon, label, value }, index) => (
                    <div key={index} className="flex items-center justify-between py-4 px-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                      <div className="flex items-center space-x-3 text-gray-700">
                        <Icon className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">{label}</span>
                      </div>
                      <span className="font-bold text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>

                {product.warranty && (
                  <div className="mt-6 flex items-center space-x-3 text-green-700 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                    <Award className="h-6 w-6" />
                    <span className="font-semibold">Bảo hành {product.warranty} năm</span>
                  </div>
                )}
              </div>

              {/* Contact Buttons */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Liên hệ ngay</h3>
                <div className="space-y-4">
                  <button
                    onClick={() => setIsModalOpenCart(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-3"
                  >
                    <Car className="h-5 w-5" />
                    <span>Thêm vào giỏ hàng</span>
                  </button>

                  <AddToCartModal
                    isOpen={isModalOpenCart}
                    onClose={() => setIsModalOpenCart(false)}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />

                  <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-3">
                    <Phone className="h-5 w-5" />
                    <span>Gọi ngay: {product.contactInfo || '0901 234 567'}</span>
                  </button>

                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-3"
                  >
                    <Calendar className="h-5 w-5" />
                    <span>Đặt lịch xem xe</span>
                  </button>
                </div>

                {/* Location Info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <MapPin className="h-5 w-5" />
                    <span>Showroom: 473/32 Ymon , Thành Phố BMT , ĐăkLăk</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Tabs Section */}
          <div className="mt-16">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex overflow-x-auto">
                  {[
                    { id: 'specs', label: 'Thông số kỹ thuật', icon: Gauge, color: 'blue' },
                    { id: 'features', label: 'Tính năng nổi bật', icon: Award, color: 'green' },
                    { id: 'safety', label: 'An toàn', icon: Shield, color: 'red' },
                  ].map(({ id, label, icon: Icon, color }) => (
                    <button
                      key={id}
                      onClick={() => setSelectedTab(id as 'description' | 'specs' | 'features' | 'safety')}
                      className={`flex items-center space-x-3 py-6 px-8 border-b-3 font-semibold whitespace-nowrap transition-all duration-200 hover:bg-white/50 ${selectedTab === id
                        ? `border-${color}-600 text-${color}-600 bg-white shadow-sm`
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {selectedTab === 'specs' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {product.specifications.length > 0 ? (
                      product.specifications.map((spec, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-4 px-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
                        >
                          <span className="font-semibold text-gray-700">{spec.key}</span>
                          <span className="text-blue-900 font-bold">{spec.value}</span>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-12">
                        <Gauge className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Không có thông số kỹ thuật</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedTab === 'features' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {features.length > 0 ? (
                      features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-4 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-md transition-all duration-200"
                        >
                          <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex-shrink-0"></div>
                          <span className="text-gray-700 font-medium">{feature}</span>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 text-center py-12">
                        <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Không có tính năng nào</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedTab === 'safety' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {safetyFeatures.length > 0 ? (
                      safetyFeatures.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-4 p-5 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100 hover:shadow-md transition-all duration-200"
                        >
                          <Shield className="h-5 w-5 text-red-600 flex-shrink-0" />
                          <span className="text-gray-700 font-medium">{feature}</span>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 text-center py-12">
                        <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Không có thông tin an toàn</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-16">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Đánh giá sản phẩm</h3>

                {reviews.length > 0 ? (
                  <div className="space-y-8">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-6 rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white shadow-sm relative"
                      >
                        {/* User + Rating */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                              {review.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{review.user.name}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            {/* StarRating ở đây */}
                            {review.user.id === currentUserId && (
                              <div className="relative">
                                <button
                                  onClick={() =>
                                    setOpenMenuId(openMenuId === review.id ? null : review.id)
                                  }
                                  className="p-2 rounded-full hover:bg-gray-100"
                                >
                                  <MoreVertical className="w-5 h-5 text-gray-600" />
                                </button>

                                {openMenuId === review.id && (
                                  <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                    <button
                                      onClick={() => handleEditReview(review)}
                                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                                    >
                                      ✏️ Sửa
                                    </button>
                                    <button
                                      onClick={() => {
                                        setOpenMenuId(null);
                                        handleDeleteReview(review.id);
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                      🗑 Xóa
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Comment */}
                        {review.comment && <p className="text-gray-700 mb-4">{review.comment}</p>}

                        {/* Images */}
                        {review.images.length > 0 && (
                          <div className="flex flex-wrap gap-3">
                            {review.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img.url}
                                alt={`Review ${review.id} - ${idx + 1}`}
                                onClick={() => setSelectedImage(img.url)}
                                className="w-24 h-24 object-cover rounded-lg shadow-md border border-gray-200 hover:scale-105 transition-transform cursor-pointer"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</p>
                )}
              </div>

              {/* Modal xem ảnh lớn */}
              {selectedImage && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                  onClick={() => setSelectedImage(null)}
                >
                  <div className="relative max-w-3xl max-h-[90vh]">
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-3 right-3 text-white bg-black bg-opacity-50 p-2 rounded-full"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <img
                      src={selectedImage}
                      alt="Phóng to"
                      className="rounded-lg shadow-lg max-h-[90vh] object-contain"
                    />
                  </div>
                </div>
              )}
            </div>




          </div>
        </div>
      </div>

      {/* Edit Review Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Chỉnh sửa đánh giá</h3>
                <button
                  onClick={handleCloseEditModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Đánh giá của bạn
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setEditRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="p-1 transition-colors"
                    >
                      <Star
                        className={`h-8 w-8 ${star <= (hoveredStar || editRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                          }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nhận xét
                </label>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                />
              </div>

              {/* Images */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Hình ảnh ({editPreviewImages.length}/5)
                </label>

                {/* Preview Images */}
                {editPreviewImages.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    {editPreviewImages.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img}
                          alt={`Preview ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          onClick={() => removeEditImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                {editPreviewImages.length < 5 && (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Nhấn để tải ảnh</span>
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG (MAX. 5 ảnh)</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleEditImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={handleCloseEditModal}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateReview}
                  disabled={editLoading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {editLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Đang cập nhật...</span>
                    </>
                  ) : (
                    <span>Cập nhật</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productName={product.name}
        onSubmit={handleAppointmentSubmit}
      />

      <Services />
      <Footer />
    </>
  );
};

export default ProductDetail;