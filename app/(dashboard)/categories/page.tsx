'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import HeroBanner from '@/components/ui/HeroBanner';
import type { ComponentType } from 'react';
import { Lock, Pencil, Trash2 } from 'lucide-react';
import {
  Plus,
  Loader2,
  Tag,
  X,
  AlertTriangle,
  Upload,
  Check,
  Smile,
  ImageIcon,
  Utensils,
  ShoppingBag,
  Zap,
  Home,
  Car,
  Pill,
  GraduationCap,
  Briefcase,
  Gift,
  Plane,
  Heart,
  Baby,
  Dumbbell,
  Film,
  Wifi,
  ShoppingBasket,
  CreditCard,
  Shirt,
  Bus,
  Coins,
} from 'lucide-react';

// Import Dynamic EmojiPicker để tránh lỗi SSR trong Next.js
const EmojiPicker = dynamic(() => import('emoji-picker-react'), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-full items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
    </div>
  ),
});

interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string;
  imageUrl?: string;
  familyId?: string | null;
  createdAt: string;
}

// Danh sách Lucide Icons chọn lọc cho tài chính gia đình
export const LUCIDE_ICONS = [
  { name: 'Utensils', Icon: Utensils, label: 'Ăn uống' },
  { name: 'ShoppingBag', Icon: ShoppingBag, label: 'Mua sắm' },
  { name: 'ShoppingBasket', Icon: ShoppingBasket, label: 'Siêu thị' },
  { name: 'Zap', Icon: Zap, label: 'Điện nước' },
  { name: 'Home', Icon: Home, label: 'Nhà cửa' },
  { name: 'Car', Icon: Car, label: 'Xe hơi' },
  { name: 'Bus', Icon: Bus, label: 'Xe buýt' },
  { name: 'Pill', Icon: Pill, label: 'Thuốc / Y tế' },
  { name: 'GraduationCap', Icon: GraduationCap, label: 'Học tập' },
  { name: 'Briefcase', Icon: Briefcase, label: 'Công việc' },
  { name: 'Gift', Icon: Gift, label: 'Quà tặng' },
  { name: 'Plane', Icon: Plane, label: 'Du lịch' },
  { name: 'Heart', Icon: Heart, label: 'Sức khỏe' },
  { name: 'Baby', Icon: Baby, label: 'Mẹ & bé' },
  { name: 'Shirt', Icon: Shirt, label: 'Quần áo' },
  { name: 'CreditCard', Icon: CreditCard, label: 'Thẻ / Nợ' },
  { name: 'Coins', Icon: Coins, label: 'Thu nhập' },
  { name: 'Dumbbell', Icon: Dumbbell, label: 'Thể thao' },
  { name: 'Film', Icon: Film, label: 'Giải trí' },
  { name: 'Wifi', Icon: Wifi, label: 'Internet' },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL');

  // State Modal Thêm / Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    icon: '',
    imageUrl: '',
  });

  // State Icon / Emoji Sub-Modal Picker
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTab, setPickerTab] = useState<'ICON' | 'EMOJI'>('ICON');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // State Modal Xóa
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    categoryId: string;
    categoryName: string;
  }>({
    isOpen: false,
    categoryId: '',
    categoryName: '',
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Lấy danh sách danh mục (Backend tự lấy familyId từ JWT Token)
  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Lỗi lấy danh sách danh mục:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Upload tệp ảnh trực tiếp
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const bodyFormData = new FormData();
    bodyFormData.append('file', file);

    setUploadingImage(true);
    try {
      const res = await api.post('/upload/image', bodyFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({ ...prev, imageUrl: res.data.url }));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Tải ảnh lên thất bại');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', type: 'EXPENSE', icon: '', imageUrl: '' });
    setShowPicker(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      type: cat.type,
      icon: cat.icon || '',
      imageUrl: cat.imageUrl || '',
    });
    setShowPicker(false);
    setIsModalOpen(true);
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên danh mục');
      return;
    }

    setSubmitLoading(true);

    const payload = {
      name: formData.name.trim(),
      type: formData.type,
      icon: formData.icon?.trim() || undefined,
      imageUrl: formData.imageUrl?.trim() || undefined,
    };

    try {
      if (editingCategory) {
        await api.patch(`/categories/${editingCategory.id}`, payload);
      } else {
        await api.post('/categories', payload);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteModal.categoryId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/categories/${deleteModal.categoryId}`);
      setDeleteModal({ isOpen: false, categoryId: '', categoryName: '' });
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể xóa danh mục này');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredCategories = categories.filter((cat) => {
    if (filterType === 'ALL') return true;
    return cat.type === filterType;
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 pb-16 select-none">
      {/* 1. HERO BANNER CHUẨN ĐỒNG BỘ */}
      <HeroBanner
        badgeText="✨ Phân loại thu chi"
        greeting="Quản lý danh mục"
        title="Danh mục tài chính"
        emoji="🏷️"
        description="Quản lý & phân loại khoản thu nhập, chi tiêu cho gia đình 💜"
        bannerDay="/images/banner_category.png"
        bannerNight="/images/banner_category_night.png"
        actionSlot={
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 hover:opacity-95 text-white px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-extrabold shadow-lg shadow-purple-500/25 transition-all active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Thêm danh mục</span>
          </button>
        }
      />

      {/* 2. BỘ LỌC TABS */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 w-fit border border-slate-200/60 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setFilterType('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterType === 'ALL'
              ? 'bg-white text-purple-600 shadow-sm dark:bg-slate-900 dark:text-purple-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Tất cả ({categories.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('EXPENSE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterType === 'EXPENSE'
              ? 'bg-white text-rose-600 shadow-sm dark:bg-slate-900 dark:text-rose-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Khoản chi ({categories.filter((c) => c.type === 'EXPENSE').length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('INCOME')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterType === 'INCOME'
              ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Thu nhập ({categories.filter((c) => c.type === 'INCOME').length})
        </button>
      </div>

      {/* 3. GRID DANH SÁCH CATEGORY */}
      {filteredCategories.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-slate-50/50 dark:bg-slate-900/50">
          <Tag className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Chưa có danh mục nào
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Bấm nút &quot;Thêm danh mục&quot; ở trên để tạo danh mục đầu tiên
          </p>
        </div>
      ) : (
        // pt-3: chừa chỗ cho chip sửa/xóa vắt trên viền thẻ ở hàng đầu
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 pt-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredCategories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              icons={LUCIDE_ICONS}
              onEdit={() => handleOpenEditModal(cat)}
              onDelete={() =>
                setDeleteModal({
                  isOpen: true,
                  categoryId: cat.id,
                  categoryName: cat.name,
                })
              }
            />
          ))}
        </div>
      )}

      {/* 4. MODAL THÊM / SỬA CATEGORY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-5">
              {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
            </h3>

            <form onSubmit={handleSubmitCategory} className="space-y-4">
              {/* Tên danh mục */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Tên danh mục <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Ăn uống, Tiền điện, Lương..."
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white dark:focus:border-purple-500"
                />
              </div>

              {/* Loại danh mục */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Loại danh mục
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
                    className={`py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                      formData.type === 'EXPENSE'
                        ? 'border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400'
                        : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400'
                    }`}
                  >
                    {formData.type === 'EXPENSE' && <Check className="w-4 h-4" />}
                    <span>Khoản chi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'INCOME' })}
                    className={`py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                      formData.type === 'INCOME'
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400'
                    }`}
                  >
                    {formData.type === 'INCOME' && <Check className="w-4 h-4" />}
                    <span>Thu nhập</span>
                  </button>
                </div>
              </div>

              {/* KHỐI BIỂU TƯỢNG ICON / EMOJI PICKER */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Biểu tượng Icon / Emoji
                </label>

                {/* Nút Trigger */}
                <button
                  type="button"
                  onClick={() => setShowPicker(true)}
                  className="w-full flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-7 w-7 place-items-center rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold text-base">
                      {formData.icon ? (
                        LUCIDE_ICONS.some((i) => i.name === formData.icon) ? (
                          (() => {
                            const Item = LUCIDE_ICONS.find(
                              (i) => i.name === formData.icon,
                            )?.Icon;
                            return Item ? (
                              <Item className="h-4 w-4" />
                            ) : (
                              <Smile className="h-4 w-4" />
                            );
                          })()
                        ) : (
                          <span>{formData.icon}</span>
                        )
                      ) : (
                        <Smile className="h-4 w-4" />
                      )}
                    </div>

                    <span className="text-slate-700 dark:text-slate-300 font-bold">
                      {formData.icon
                        ? `Đã chọn: ${formData.icon}`
                        : 'Bấm để chọn Icon hoặc Emoji'}
                    </span>
                  </div>

                  <Smile className="h-4 w-4 text-slate-400" />
                </button>

                {/* SUB-MODAL PICKER RIÊNG BIỆT (CHÍNH GIỮA MÀN HÌNH z-[60]) */}
                {showPicker && (
                  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
                    <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl relative flex flex-col max-h-[85vh]">
                      {/* Header Switch Tabs */}
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3 shrink-0">
                        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setPickerTab('ICON')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                              pickerTab === 'ICON'
                                ? 'bg-white text-purple-600 shadow-xs dark:bg-slate-900 dark:text-purple-400'
                                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                            }`}
                          >
                            Lucide Icons
                          </button>
                          <button
                            type="button"
                            onClick={() => setPickerTab('EMOJI')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                              pickerTab === 'EMOJI'
                                ? 'bg-white text-purple-600 shadow-xs dark:bg-slate-900 dark:text-purple-400'
                                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                            }`}
                          >
                            Emoji Bàn phím
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowPicker(false)}
                          className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* TAB 1: LUCIDE ICONS GRID */}
                      {pickerTab === 'ICON' && (
                        <div className="grid grid-cols-4 gap-2.5 overflow-y-auto p-1 max-h-[320px]">
                          {LUCIDE_ICONS.map(({ name, Icon, label }) => {
                            const selected = formData.icon === name;
                            return (
                              <button
                                key={name}
                                type="button"
                                title={label}
                                onClick={() => {
                                  setFormData({ ...formData, icon: name });
                                  setShowPicker(false);
                                }}
                                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl transition-all border ${
                                  selected
                                    ? 'border-purple-500 bg-purple-50 text-purple-600 dark:border-purple-500/50 dark:bg-purple-500/20 dark:text-purple-300'
                                    : 'border-slate-100 dark:border-slate-800 hover:bg-slate-100 text-slate-600 dark:hover:bg-slate-800 dark:text-slate-300'
                                }`}
                              >
                                <Icon className="h-5 w-5 mb-1" />
                                <span className="text-[10px] font-semibold truncate w-full text-center opacity-80">
                                  {label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* TAB 2: EMOJI BÀN PHÍM VỪA VẶN TRONG SUB-MODAL */}
                      {pickerTab === 'EMOJI' && (
                        <div className="w-full flex justify-center overflow-hidden rounded-2xl">
                          <EmojiPicker
                            width="100%"
                            height={300}
                            searchPlaceHolder="Tìm emoji..."
                            previewConfig={{ showPreview: false }}
                            onEmojiClick={(emojiData) => {
                              setFormData({ ...formData, icon: emojiData.emoji });
                              setShowPicker(false);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Upload tệp Ảnh hoặc dán URL */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Ảnh đại diện
                </label>
                <div className="flex items-center gap-2.5">
                  <label className="flex items-center justify-center gap-1.5 cursor-pointer rounded-2xl border border-dashed border-purple-300 bg-purple-50/50 hover:bg-purple-100/50 px-3.5 py-3 text-xs font-bold text-purple-600 transition-all dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300 shrink-0">
                    {uploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <span>{uploadingImage ? 'Đang tải...' : 'Upload ảnh'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>

                  <input
                    type="url"
                    placeholder="Hoặc dán link ảnh..."
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white dark:focus:border-purple-500"
                  />

                  {formData.imageUrl ? (
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                      <Image
                        src={formData.imageUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-11 w-11 shrink-0 grid place-items-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-bold text-xs transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || uploadingImage}
                  className="w-1/2 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {submitLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>{editingCategory ? 'Cập nhật' : 'Tạo mới'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL POPUP XÁC NHẬN XÓA */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl relative">
            <button
              type="button"
              onClick={() =>
                setDeleteModal({ isOpen: false, categoryId: '', categoryName: '' })
              }
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 mb-4 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2 mb-6">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Xóa danh mục này?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Bạn có chắc chắn muốn xóa danh mục{' '}
                <span className="font-bold text-slate-900 dark:text-white">
                  &quot;{deleteModal.categoryName}&quot;
                </span>
                ? Các giao dịch liên quan có thể bị ảnh hưởng.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() =>
                  setDeleteModal({ isOpen: false, categoryId: '', categoryName: '' })
                }
                className="w-1/2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteCategory}
                className="w-1/2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <span>Xóa ngay</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type IconEntry = { name: string; Icon: ComponentType<{ className?: string }> };

export interface CategoryItem {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string;
  imageUrl?: string;
  familyId?: string | null;
}

interface Props {
  category: CategoryItem;
  icons: IconEntry[]; // truyền LUCIDE_ICONS vào
  onEdit: () => void;
  onDelete: () => void;
}

function CategoryCard({ category: cat, icons, onEdit, onDelete }: Props) {
  const isSystem = !cat.familyId;
  const isExpense = cat.type === 'EXPENSE';

  const Lucide = icons.find((i) => i.name === cat.icon)?.Icon;
  // icon là tên chữ (vd "Coins") nhưng không khớp → hiện chữ cái đầu; là emoji → hiện emoji
  const iconIsWord = !cat.icon || /^[A-Za-z]+$/.test(cat.icon);

  return (
    <div className="group relative flex items-center gap-3.5 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-300/70 hover:shadow-lg hover:shadow-purple-500/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-purple-500/40">
      {/* Icon tile: màu theo thu / chi */}
      <div
        className={`relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br text-white shadow-md ${
          isExpense
            ? 'from-rose-400 to-pink-500 shadow-rose-500/25'
            : 'from-emerald-400 to-teal-500 shadow-emerald-500/25'
        }`}
      >
        {cat.imageUrl ? (
          <Image src={cat.imageUrl} alt={cat.name} fill sizes="56px" className="object-cover" />
        ) : Lucide ? (
          <Lucide className="h-7 w-7" />
        ) : iconIsWord ? (
          <span className="text-xl font-black">{cat.name.charAt(0).toUpperCase()}</span>
        ) : (
          <span className="text-2xl">{cat.icon}</span>
        )}
      </div>

      {/* Nội dung: luôn chiếm trọn chỗ, không bị nút thao tác chen vào */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white" title={cat.name}>
          {cat.name}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
              isExpense
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
            }`}
          >
            <i className="h-1.5 w-1.5 rounded-full bg-current" />
            {isExpense ? 'Khoản chi' : 'Thu nhập'}
          </span>

          {isSystem && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <Lock className="h-2.5 w-2.5" />
              Mặc định
            </span>
          )}
        </div>
      </div>

      {/* Nút thao tác: absolute, nằm đè lên viền trên → không ảnh hưởng layout.
          Desktop: hiện khi hover/focus. Thiết bị cảm ứng (không hover): luôn hiện. */}
      {!isSystem && (
        <div className="absolute -top-3 right-3 flex items-center gap-0.5 rounded-xl border border-slate-200 bg-white p-0.5 opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100 dark:border-slate-700 dark:bg-slate-800">
          <button
            type="button"
            onClick={onEdit}
            title="Chỉnh sửa"
            aria-label="Chỉnh sửa"
            className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-500/10 dark:hover:text-purple-400"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="Xóa"
            aria-label="Xóa"
            className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
