'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import {
  Loader2,
  X,
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

const EmojiPicker = dynamic(() => import('emoji-picker-react'), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-full items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
    </div>
  ),
});

export interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string;
  imageUrl?: string;
  familyId?: string | null;
  createdAt: string;
}

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

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (category: Category) => void;
  category?: Category | null;
  className?: string; // Tùy chỉnh z-index nếu cần
  pickerZIndex?: string; // Tùy chỉnh z-index cho popup Icon/Emoji
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  onSuccess,
  category,
  className = 'z-50',
  pickerZIndex = 'z-[60]',
}: CategoryFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    icon: '',
    imageUrl: '',
  });

  const [mainTab, setMainTab] = useState<'ICON' | 'IMAGE'>('ICON');
  const [imageError, setImageError] = useState(false);

  const [showPicker, setShowPicker] = useState(false);
  const [pickerTab, setPickerTab] = useState<'ICON' | 'EMOJI'>('ICON');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setFormData({
          name: category.name,
          type: category.type,
          icon: category.icon || '',
          imageUrl: category.imageUrl || '',
        });
        setMainTab(category.imageUrl ? 'IMAGE' : 'ICON');
      } else {
        setFormData({ name: '', type: 'EXPENSE', icon: '', imageUrl: '' });
        setMainTab('ICON');
      }
      setImageError(false);
      setShowPicker(false);
    }
  }, [isOpen, category]);

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
      setFormData((prev) => ({ ...prev, imageUrl: res.data.url, icon: '' }));
      setImageError(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Tải ảnh lên thất bại');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên danh mục');
      return;
    }

    setSubmitLoading(true);

    const payload = {
      name: formData.name.trim(),
      type: formData.type,
      icon: mainTab === 'ICON' ? (formData.icon?.trim() || undefined) : '',
      imageUrl: mainTab === 'IMAGE' ? (formData.imageUrl?.trim() || undefined) : '',
    };

    try {
      let res;
      if (category) {
        res = await api.patch(`/categories/${category.id}`, payload);
      } else {
        res = await api.post('/categories', payload);
      }
      
      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 ${className} flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn`}>
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-5">
          {category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Tên danh mục <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Ăn uống, Tiền điện, Lương..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white dark:focus:border-purple-500"
            />
          </div>

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

          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Hình ảnh / Biểu tượng hiển thị
            </label>
            
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl mb-3">
              <button
                type="button"
                onClick={() => setMainTab('ICON')}
                className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-extrabold transition-all ${
                  mainTab === 'ICON'
                    ? 'bg-white text-purple-600 shadow-sm dark:bg-slate-900 dark:text-purple-400'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                Icon / Emoji
              </button>
              <button
                type="button"
                onClick={() => setMainTab('IMAGE')}
                className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-extrabold transition-all ${
                  mainTab === 'IMAGE'
                    ? 'bg-white text-purple-600 shadow-sm dark:bg-slate-900 dark:text-purple-400'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                Tải ảnh lên
              </button>
            </div>

            {mainTab === 'ICON' && (
              <div className="animate-fadeIn">
                <button
                  type="button"
                  onClick={() => setShowPicker(true)}
                  className="w-full flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold text-base">
                      {formData.icon ? (
                        LUCIDE_ICONS.some((i) => i.name === formData.icon) ? (
                          (() => {
                            const Item = LUCIDE_ICONS.find((i) => i.name === formData.icon)?.Icon;
                            return Item ? <Item className="h-4 w-4" /> : <Smile className="h-4 w-4" />;
                          })()
                        ) : (
                          <span>{formData.icon}</span>
                        )
                      ) : (
                        <Smile className="h-4 w-4" />
                      )}
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 font-bold">
                      {formData.icon ? `Đã chọn: ${formData.icon}` : 'Bấm để chọn Icon hoặc Emoji'}
                    </span>
                  </div>
                  <Smile className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            )}

            {mainTab === 'IMAGE' && (
              <div className="flex items-center gap-2.5 animate-fadeIn">
                <label className="flex items-center justify-center gap-1.5 cursor-pointer rounded-2xl border border-dashed border-purple-300 bg-purple-50/50 hover:bg-purple-100/50 px-3.5 py-3 text-xs font-bold text-purple-600 transition-all dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300 shrink-0">
                  {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin text-purple-600" /> : <Upload className="h-4 w-4" />}
                  <span>{uploadingImage ? 'Đang tải...' : 'Upload ảnh'}</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploadingImage} />
                </label>

                <input
                  type="url"
                  placeholder="Hoặc dán link ảnh..."
                  value={formData.imageUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, imageUrl: e.target.value, icon: '' });
                    setImageError(false);
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white dark:focus:border-purple-500"
                />

                {formData.imageUrl && !imageError ? (
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                      onError={() => setImageError(true)} 
                    />
                  </div>
                ) : (
                  <div className="h-11 w-11 shrink-0 grid place-items-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-bold text-xs transition-all"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitLoading || uploadingImage}
              className="w-1/2 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-600 disabled:active:scale-100 disabled:shadow-none"
            >
              {submitLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{category ? 'Đang cập nhật...' : 'Đang tạo...'}</span>
                </>
              ) : (
                <span>{category ? 'Cập nhật' : 'Tạo mới'}</span>
              )}
            </button>
          </div>
        </form>

        {/* POPUP ICON / EMOJI PICKER */}
        {showPicker && (
          <div className={`fixed inset-0 ${pickerZIndex} flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn`}>
            <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl relative flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3 shrink-0">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPickerTab('ICON')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                      pickerTab === 'ICON' ? 'bg-white text-purple-600 shadow-xs dark:bg-slate-900 dark:text-purple-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                    }`}
                  >
                    Lucide Icons
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickerTab('EMOJI')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                      pickerTab === 'EMOJI' ? 'bg-white text-purple-600 shadow-xs dark:bg-slate-900 dark:text-purple-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                    }`}
                  >
                    Emoji Bàn phím
                  </button>
                </div>
                <button type="button" onClick={() => setShowPicker(false)} className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {pickerTab === 'ICON' && (
                <div className="grid grid-cols-4 gap-2.5 overflow-y-auto p-1 custom-scrollbar max-h-[320px]">
                  {LUCIDE_ICONS.map(({ name, Icon, label }) => {
                    const selected = formData.icon === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        title={label}
                        onClick={() => { 
                          setFormData({ ...formData, icon: name, imageUrl: '' }); 
                          setShowPicker(false); 
                        }}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-2xl transition-all border ${
                          selected ? 'border-purple-500 bg-purple-50 text-purple-600 dark:border-purple-500/50 dark:bg-purple-500/20 dark:text-purple-300' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-100 text-slate-600 dark:hover:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <Icon className="h-5 w-5 mb-1" />
                        <span className="text-[10px] font-semibold truncate w-full text-center opacity-80">{label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {pickerTab === 'EMOJI' && (
                <div className="w-full flex justify-center overflow-hidden rounded-2xl">
                  <EmojiPicker
                    width="100%"
                    height={300}
                    searchPlaceHolder="Tìm emoji..."
                    previewConfig={{ showPreview: false }}
                    onEmojiClick={(emojiData) => {
                      setFormData({ ...formData, icon: emojiData.emoji, imageUrl: '' });
                      setShowPicker(false);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
