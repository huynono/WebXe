import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Save, Car, Upload, X, Plus, Trash2, Package, Settings, Camera, Shield } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface Specification {
  key: string;
  value: string;
}

interface Feature {
  name: string;
}

interface Safety {
  name: string;
}
interface ColorItem {
  name: string;
  hex: string;
  gradient: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ProductFormData {
  name: string;
  year: number;
  discount: number;
  slug: string;
  image: File | null;
  description: string;
  isActive: boolean;
  categoryId: number | null;
  price: number;
  warranty: string;
  fuelType: string;
  power: string;
  seats: number;
  contactInfo: string;
  km: string;
  quantity: string;
  images: File[];
  specifications: Specification[];
  features: Feature[];
  safeties: Safety[];
  colors: ColorItem[];
}

interface Product {
  id: number;
  name: string;
  year: number;
  discount: number;
  slug: string;
  imageUrl?: string;       // ảnh chính cũ (url)
  description: string;
  isActive: boolean;
  categoryId: number;
  price: number;
  warranty: string;
  fuelType: string;
  power: string;
  seats: number;
  contactInfo: string;
  km: string;
  quantity: string;
  imagesUrls?: string[];   // ảnh phụ cũ (url)
  specifications: Specification[];
  features: Feature[];
  safeties: Safety[];
  colors: ColorItem[];
}

export default function EditProduct() {
  const { id } = useParams(); // lấy id từ URL
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy product truyền từ trang danh sách qua navigate state
  const product: Product | undefined = location.state?.product;

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('http://localhost:3000/api/category/allCategory');
        if (!res.ok) throw new Error('Lỗi khi lấy category');
        const data = await res.json();
        setCategories(Array.isArray(data.categories) ? data.categories : []);
      } catch (error) {
        console.error('Lỗi lấy category:', error);
        setCategories([]);
      }
    }
    fetchCategories();
  }, []);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    year: new Date().getFullYear(),
    discount: 0,
    slug: '',
    image: null,
    description: '',
    isActive: true,
    categoryId: null,
    price: 0,
    warranty: '',
    fuelType: '',
    power: '',
    seats: 5,
    contactInfo: '',
    km: '',
    quantity: '',
    images: [],
    specifications: [],
    features: [],
    safeties: [],
    colors: [],
  });

  // Ảnh hiện tại (url) cho preview ảnh chính và ảnh phụ
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Khi có product từ state thì cập nhật formData và ảnh preview
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        year: product.year || new Date().getFullYear(),
        discount: product.discount || 0,
        slug: product.slug || '',
        image: null, // Ảnh mới upload, giữ null ban đầu
        description: product.description || '',
        isActive: product.isActive ?? true,
        categoryId: product.categoryId || null,
        price: product.price || 0,
        warranty: product.warranty || '',
        fuelType: product.fuelType || '',
        power: product.power || '',
        seats: product.seats || 5,
        contactInfo: product.contactInfo || '',
        km: product.km || '',
        quantity: product.quantity || '',
        images: [], // Ảnh mới upload
        specifications: product.specifications || [],
        features: product.features || [],
        safeties: product.safeties || [],
        colors: product.colors || [],
      });

      if (product.imageUrl) {
        setImagePreview(product.imageUrl);
      } else {
        setImagePreview(null);
      }

      if (product.imagesUrls && product.imagesUrls.length > 0) {
        setImagePreviews(product.imagesUrls);
      } else {
        setImagePreviews([]);
      }
    }
  }, [product]);

  // Auto-generate slug từ tên
  useEffect(() => {
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name]);

  const handleInputChange = <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Xử lý chọn ảnh chính mới
  const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Kiểm tra kích thước file (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('❌ File ảnh quá lớn! Vui lòng chọn file nhỏ hơn 10MB.');
        return;
      }

      // Kiểm tra định dạng file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('❌ Định dạng file không được hỗ trợ! Vui lòng chọn file JPG, PNG, GIF hoặc WebP.');
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setImagePreview(ev.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Xử lý chọn ảnh phụ mới
  const handleImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];

    // Kiểm tra từng file
    const validFiles = files.filter(file => {
      // Kiểm tra kích thước file (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`❌ File "${file.name}" quá lớn! Vui lòng chọn file nhỏ hơn 10MB.`);
        return false;
      }

      // Kiểm tra định dạng file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert(`❌ File "${file.name}" có định dạng không được hỗ trợ! Vui lòng chọn file JPG, PNG, GIF hoặc WebP.`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    setFormData(prev => ({ ...prev, images: [...prev.images, ...validFiles] }));

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const target = ev.target as FileReader;
        if (target.result) {
          setImagePreviews(prev => [...prev, target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Xóa ảnh phụ
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Các hàm add/update/remove cho specifications, features, safeties (giữ nguyên như bạn đã có)

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }],
    }));
  };

  const updateSpecification = (index: number, field: keyof Specification, value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeSpecification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, { name: '' }],
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((item, i) =>
        i === index ? { name: value } : item
      ),
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const addSafety = () => {
    setFormData(prev => ({
      ...prev,
      safeties: [...prev.safeties, { name: '' }],
    }));
  };

  const updateSafety = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      safeties: prev.safeties.map((item, i) =>
        i === index ? { name: value } : item
      ),
    }));
  };

  const removeSafety = (index: number) => {
    setFormData(prev => ({
      ...prev,
      safeties: prev.safeties.filter((_, i) => i !== index),
    }));
  };

  // Color helpers
  const addColor = () => {
    setFormData(prev => ({
      ...prev,
      colors: [
        ...prev.colors,
        { name: '', hex: '', gradient: '' } // ✅ thêm đủ field rỗng
      ]
    }));
  };

  const updateColor = (index: number, field: keyof ColorItem, value: string) => {
    setFormData((prev) => {
      const newColors = prev.colors.map((c, i) => {
        if (i === index) {
          const updated: ColorItem = { ...c, [field]: value };

          // Nếu thay đổi hex thì cập nhật luôn gradient

          if (field === "hex") {
            updated.gradient = `linear-gradient(to right, ${value}, ${value})`;
          }

          return updated;
        }
        return c;
      });

      return { ...prev, colors: newColors };
    });
  };

  const removeColor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  // Trạng thái gửi form
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Xử lý submit update sản phẩm
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!formData.categoryId || formData.categoryId === 0) {
      setError('Vui lòng chọn danh mục sản phẩm hợp lệ.');
      setLoading(false);
      return;
    }

    if (!product) {
      setError('Không tìm thấy sản phẩm để cập nhật.');
      setLoading(false);
      return;
    }

    const data = new FormData();

    // Dữ liệu text chuyển sang JSON hoặc string
    const textData = {
      id: product.id, // nhớ gửi id để server biết chỉnh sửa cái nào
      name: formData.name,
      year: formData.year,
      discount: formData.discount,
      slug: formData.slug,
      description: formData.description,
      isActive: formData.isActive,
      categoryId: formData.categoryId,
      price: formData.price,
      warranty: formData.warranty,
      fuelType: formData.fuelType,
      power: formData.power,
      seats: formData.seats,
      contactInfo: formData.contactInfo,
      km: formData.km,
      quantity: formData.quantity,
      specifications: JSON.stringify(formData.specifications),
      features: JSON.stringify(formData.features),
      safeties: JSON.stringify(formData.safeties),
      colors: JSON.stringify(formData.colors),
    };

    for (const key in textData) {
      if (Object.prototype.hasOwnProperty.call(textData, key)) {
        const value = textData[key as keyof typeof textData];
        // Nếu là mảng object (colors, features, specifications, safeties)
        if (Array.isArray(value)) {
          data.append(key, JSON.stringify(value)); // stringify để gửi lên backend
        } else {
          data.append(key, String(value));
        }
      }
    }

    // Ảnh chính mới upload
    if (formData.image) {
      data.append('image', formData.image);
    }

    // Ảnh phụ mới upload
    formData.images.forEach(file => {
      data.append('images', file);
    });

    try {
      const response = await fetch(`http://localhost:3000/api/product/updateProduct/${id}`, {
        method: 'PUT', // hoặc PATCH, tùy backend bạn
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(result.message || 'Cập nhật sản phẩm thành công!');
        // Có thể navigate hoặc reset form tùy ý
        // navigate('/admin/products'); // ví dụ chuyển về danh sách sản phẩm
      } else {
        setError(result.message || 'Có lỗi xảy ra khi cập nhật sản phẩm.');
      }
    } catch (err) {
      console.error('Lỗi khi gửi form:', err);
      setError('Không thể kết nối đến server. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header với gradient đẹp */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Car className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Chỉnh sửa sản phẩm</h1>
                <p className="text-blue-100 text-lg">Cập nhật thông tin chi tiết cho sản phẩm</p>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="text-right">
                <div className="text-blue-100 text-sm">Tổng quan</div>
                <div className="text-2xl font-bold">Quản lý sản phẩm</div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Thông báo trạng thái với animation */}
          {loading && (
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 border-0 text-white px-6 py-4 rounded-2xl relative shadow-lg animate-pulse" role="alert">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="font-semibold">Đang gửi dữ liệu...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-gradient-to-r from-red-500 to-pink-600 border-0 text-white px-6 py-4 rounded-2xl relative shadow-lg animate-bounce" role="alert">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-red-100 font-bold">!</span>
                </div>
                <span className="font-semibold">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 border-0 text-white px-6 py-4 rounded-2xl relative shadow-lg animate-bounce" role="alert">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-green-100 font-bold">✓</span>
                </div>
                <span className="font-semibold">{success}</span>
              </div>
            </div>
          )}

          {/* Phần form bạn có thể dùng lại code nhập liệu từ formData như bạn đã gửi (bao gồm các input, textarea, select) */}
          {/* Mình chỉ gửi ví dụ phần đầu */}
          {/* Thông tin cơ bản */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl">
                <Package className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Thông tin cơ bản</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={e => handleInputChange('slug', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Năm sản xuất <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>


              {/* category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.categoryId ?? ''}
                  onChange={e => handleInputChange('categoryId', Number(e.target.value))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">Danh mục sản phẩm</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>


              {/* category */}


              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Giá (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="1500000000"
                  min="0"
                  step="1000000"
                  required
                />
              </div>



              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số lượng <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  min="1"
                  max="999"
                  required
                  placeholder="Nhập số lượng sản phẩm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số ghế
                </label>
                <input
                  type="number"
                  value={formData.seats}
                  onChange={(e) => handleInputChange('seats', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 transition-all"
                  min="1"
                  max="50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={String(formData.isActive)}
                  onChange={(e) => handleInputChange('isActive', e.target.value === 'true')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="true">Hiện</option>
                  <option value="false">Ẩn</option>
                </select>
              </div>
            </div>




            <div className="mt-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Mô tả chi tiết
              </label>

              <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200 overflow-auto resize-y min-h-[150px] max-h-[500px]">
                <ReactQuill
                  theme="snow"
                  value={formData.description}
                  onChange={(value) => handleInputChange('description', value)}
                  className="h-full min-h-[150px] max-h-[500px] rounded-2xl"
                  placeholder="Mô tả chi tiết về sản phẩm, tính năng nổi bật, và thông tin quan trọng..."
                />
              </div>
            </div>










          </div>

          {/* Thông tin kỹ thuật */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Thông tin kỹ thuật</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">


              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Loại nhiên liệu
                </label>
                <select
                  value={formData.fuelType}
                  onChange={(e) => handleInputChange('fuelType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">Chọn loại nhiên liệu</option>
                  <option value="Xăng">Xăng</option>
                  <option value="Dầu">Dầu</option>
                  <option value="Điện">Điện</option>
                  <option value="Khác....">Khác....</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Công suất
                </label>
                <input
                  type="text"
                  value={formData.power}
                  onChange={(e) => handleInputChange('power', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bảo hành
                </label>
                <input
                  type="text"
                  value={formData.warranty}
                  onChange={(e) => handleInputChange('warranty', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Thông tin liên hệ
                </label>
                <input
                  type="text"
                  value={formData.contactInfo}
                  onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Số điện thoại hoặc email"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Km
                </label>
                <input
                  type="text"
                  value={formData.km}
                  onChange={(e) => handleInputChange('km', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Số km đã chạy"
                />
              </div>


            </div>
          </div>

          {/* Hình ảnh sản phẩm */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Hình ảnh sản phẩm</h2>
            </div>

            {/* Ảnh chính */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Ảnh chính
              </label>
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="text-sm text-gray-500">Chọn ảnh chính</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleMainImageChange}
                    />
                  </label>
                </div>
                {imagePreview && (
                  <div className="w-32 h-32 relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, image: null }));
                      }}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Ảnh phụ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Ảnh phụ
              </label>
              <div className="mb-4">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="text-sm text-gray-500">Chọn nhiều ảnh</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImagesChange}
                  />
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Thông số kỹ thuật */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-2 h-8 bg-orange-600 rounded-full"></div>
                Thông số kỹ thuật
              </h2>
              <button
                type="button"
                onClick={addSpecification}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Thêm thông số
              </button>
            </div>

            <div className="space-y-4">
              {formData.specifications.map((spec, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={spec.key}
                      onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Tên thông số (VD: Động cơ)"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Giá trị (VD: V8 4.0L)"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {formData.specifications.length === 0 && (
                <p className="text-gray-500 text-center py-8 italic">
                  Chưa có thông số kỹ thuật nào. Nhấn "Thêm thông số" để bắt đầu.
                </p>
              )}
            </div>
          </div>

          {/* Tính năng */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-2 h-8 bg-yellow-600 rounded-full"></div>
                Tính năng nổi bật
              </h2>
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Thêm tính năng
              </button>
            </div>

            <div className="space-y-4">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={feature.name}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="VD: Điều hòa tự động"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {formData.features.length === 0 && (
                <p className="text-gray-500 text-center py-8 italic">
                  Chưa có tính năng nào. Nhấn "Thêm tính năng" để bắt đầu.
                </p>
              )}
            </div>
          </div>

          {/* Tính năng an toàn */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-2 h-8 bg-red-600 rounded-full"></div>
                Tính năng an toàn
              </h2>
              <button
                type="button"
                onClick={addSafety}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Thêm tính năng an toàn
              </button>
            </div>

            <div className="space-y-4">
              {formData.safeties.map((safety, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={safety.name}
                      onChange={(e) => updateSafety(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="VD: Phanh ABS"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSafety(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {formData.safeties.length === 0 && (
                <p className="text-gray-500 text-center py-8 italic">
                  Chưa có tính năng an toàn nào. Nhấn "Thêm tính năng an toàn" để bắt đầu.
                </p>
              )}
            </div>
          </div>








          {/* Màu sắc */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Màu sắc</h2>
              </div>
              <button
                type="button"
                onClick={addColor}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Plus className="h-5 w-5" />
                Thêm màu sắc
              </button>
            </div>

            <div className="space-y-4">
              {formData.colors.map((color, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-100"
                >
                  {/* Tên màu */}
                  <input
                    type="text"
                    value={color.name}
                    onChange={(e) => updateColor(index, "name", e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-red-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 bg-white/70"
                    placeholder="VD: Đỏ Ruby"
                  />

                  {/* Mã hex */}
                  <input
                    type="color"
                    value={color.hex}
                    onChange={(e) => updateColor(index, "hex", e.target.value)}
                    className="w-16 h-12 border-2 border-red-200 rounded-xl cursor-pointer"
                  />

                  {/* Gradient */}
                  <input
                    type="text"
                    value={color.gradient}
                    onChange={(e) => updateColor(index, "gradient", e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-red-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 bg-white/70"
                    placeholder="VD: linear-gradient(to right, #ff0000, #0000ff)"
                  />

                  {/* Xoá */}
                  <button
                    type="button"
                    onClick={() => removeColor(index)}
                    className="p-3 text-red-600 hover:bg-red-100 rounded-full transition-all duration-300 hover:shadow-lg"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}









              {formData.colors.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-10 w-10 text-red-500" />
                  </div>
                  <p className="text-gray-500 text-lg italic">
                    Chưa có màu sắc nào. Nhấn "Thêm màu sắc" để bắt đầu.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <button
                type="button"
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-semibold hover:shadow-lg transform hover:-translate-y-1"
                onClick={() => {
                  // Reset form nếu muốn hoặc navigate về trang danh sách
                  navigate('/admin/products');
                }}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-6 w-6" />
                    <span>Lưu thay đổi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
