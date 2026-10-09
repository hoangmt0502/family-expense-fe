'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import Dropdown from '@/components/ui/Dropdown';
import CameraCaptureModal from '@/components/ui/Cameracapturemodal';
import CategoryFormModal from '@/components/categories/CategoryFormModal';

// Date Picker
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';

import { X, Loader2, Upload, Camera, CalendarDays, ImageIcon, Plus } from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string;
  imageUrl?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  note?: string;
  date: string;
  imageUrl?: string;
  category: Category;
  user: any;
}

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction?: Transaction | null;
}

export default function TransactionFormModal({
  isOpen,
  onClose,
  onSuccess,
  transaction,
}: TransactionFormModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState({
    amount: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    categoryId: '',
    note: '',
    date: new Date(),
    imageUrl: '',
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  // State quản lý Modal tạo nhanh danh mục
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);

  const cameraFallbackRef = useRef<HTMLInputElement>(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Lỗi lấy danh mục:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();

      if (transaction) {
        setFormData({
          amount: transaction.amount.toString(),
          type: transaction.type,
          categoryId: transaction.category?.id || '',
          note: transaction.note || '',
          date: transaction.date ? new Date(transaction.date) : new Date(),
          imageUrl: transaction.imageUrl || '',
        });
      } else {
        setFormData({
          amount: '',
          type: 'EXPENSE',
          categoryId: '',
          note: '',
          date: new Date(),
          imageUrl: '',
        });
      }
      setImageError(false);
    }
  }, [isOpen, transaction]);

  const uploadFile = async (file: File) => {
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);
    setUploadingImage(true);
    try {
      const res = await api.post('/upload/image', bodyFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({ ...prev, imageUrl: res.data.url }));
      setImageError(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Tải ảnh thất bại');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = ''; 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    
    const filteredCats = categories.filter((c) => c.type === formData.type);
    const finalCategoryId = formData.categoryId || filteredCats[0]?.id;
    
    if (!finalCategoryId) {
      alert('Vui lòng chọn hoặc tạo mới danh mục');
      return;
    }

    setSubmitLoading(true);
    const payload = {
      amount: parseFloat(formData.amount),
      type: formData.type,
      categoryId: finalCategoryId,
      note: formData.note.trim() || undefined,
      date: formData.date ? formData.date.toISOString() : undefined,
      imageUrl: formData.imageUrl.trim() || undefined,
    };

    try {
      if (transaction) {
        await api.patch(`/transactions/${transaction.id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      onSuccess();
      onClose(); 
    } catch (err: any) {
      alert(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === formData.type);

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
        <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-5">
            {transaction ? 'Chỉnh sửa giao dịch' : 'Tạo giao dịch mới'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 relative">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'EXPENSE', categoryId: '' })}
                className={`py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                  formData.type === 'EXPENSE'
                    ? 'border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400'
                    : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400'
                }`}
              >
                Khoản chi
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'INCOME', categoryId: '' })}
                className={`py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                  formData.type === 'INCOME'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400'
                }`}
              >
                Thu nhập
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Số tiền (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="Ví dụ: 50000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
              />
            </div>

            {/* Danh mục + Nút Tạo nhanh */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Danh mục <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreateCategoryOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 hover:underline"
                >
                  <Plus className="h-3 w-3 stroke-[3]" />
                  <span>Tạo danh mục mới</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <Dropdown
                    variant="field"
                    title="Chọn danh mục"
                    placeholder="-- Chọn danh mục --"
                    value={formData.categoryId || (filteredCategories[0]?.id ?? '')}
                    onChange={(v) => setFormData({ ...formData, categoryId: v })}
                    options={filteredCategories.map((c) => ({ value: c.id, label: c.name }))}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Ngày giao dịch
              </label>
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(true)}
                className="w-full flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-900 focus:border-purple-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-white transition-all"
              >
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  {format(formData.date, 'EEEE, dd/MM/yyyy', { locale: vi })}
                </span>
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded-lg">
                  Đổi ngày
                </span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Ghi chú
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Cơm trưa, Xăng xe..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Ảnh hóa đơn / Chứng từ
              </label>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-center gap-1.5 cursor-pointer rounded-2xl border border-dashed border-purple-300 bg-purple-50/50 hover:bg-purple-100/50 px-3 py-2.5 text-xs font-bold text-purple-600 transition-all dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300">
                    {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin text-purple-600" /> : <Upload className="h-4 w-4" />}
                    <span>Tải ảnh từ máy</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploadingImage} />
                  </label>
                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => setIsCameraOpen(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-pink-300 bg-pink-50/50 hover:bg-pink-100/50 px-3 py-2.5 text-xs font-bold text-pink-600 transition-all dark:border-pink-500/30 dark:bg-pink-500/10 dark:text-pink-300 disabled:opacity-60"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Chụp ảnh mới</span>
                  </button>
                  <input ref={cameraFallbackRef} type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="Hoặc dán link ảnh..."
                    value={formData.imageUrl}
                    onChange={(e) => {
                      setFormData({ ...formData, imageUrl: e.target.value });
                      setImageError(false);
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
                  />
                  {formData.imageUrl && !imageError ? (
                    <div
                      className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
                      onClick={() => setZoomedImage(formData.imageUrl!)}
                    >
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 shrink-0 grid place-items-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
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
                className="w-1/2 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-600 disabled:active:scale-100 disabled:shadow-none"
              >
                {submitLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{transaction ? 'Đang cập nhật...' : 'Đang tạo...'}</span>
                  </>
                ) : (
                  <span>{transaction ? 'Cập nhật' : 'Tạo mới'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* POPOVER DATE PICKER */}
      {isDatePickerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fadeIn" onClick={() => setIsDatePickerOpen(false)}>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl scale-100 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <DayPicker
              mode="single"
              selected={formData.date}
              onSelect={(selectedDate) => { if (selectedDate) { setFormData({ ...formData, date: selectedDate }); setIsDatePickerOpen(false); } }}
              locale={vi}
              className="p-2"
              classNames={{
                months: 'flex flex-col relative',
                month_caption: 'flex justify-between items-center mb-4 h-8',
                caption_label: 'font-extrabold text-sm text-slate-900 dark:text-white px-2',
                nav: 'flex items-center gap-1 absolute right-0 top-0',
                button_previous: 'h-8 w-8 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors',
                button_next: 'h-8 w-8 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors',
                month_grid: 'w-full border-collapse',
                weekdays: 'flex mb-2',
                weekday: 'w-10 text-slate-400 font-bold text-[11px] uppercase tracking-wider text-center',
                week: 'flex mt-1',
                day: 'h-10 w-10 flex items-center justify-center rounded-xl font-bold text-xs text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all cursor-pointer',
                selected: 'bg-purple-600 !text-white hover:bg-purple-700 shadow-md shadow-purple-500/30',
                today: 'text-purple-600 dark:text-purple-400 font-black border-2 border-purple-200 dark:border-purple-800',
                outside: 'text-slate-300 dark:text-slate-600 opacity-50 cursor-default pointer-events-none hover:bg-transparent',
              }}
            />
          </div>
        </div>
      )}

      {/* CAMERA MODAL */}
      {isCameraOpen && (
        <CameraCaptureModal
          onClose={() => setIsCameraOpen(false)}
          onCapture={uploadFile}
          onFallback={() => cameraFallbackRef.current?.click()}
        />
      )}

      {/* ZOOM ẢNH */}
      {zoomedImage && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 cursor-zoom-out animate-fadeIn" onClick={() => setZoomedImage(null)}>
          <button className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"><X className="w-6 h-6" /></button>
          <img src={zoomedImage} alt="Zoomed" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200" />
        </div>
      )}

      {/* MODAL TẠO NHANH CATEGORY: ĐỒNG BỘ NÂNG LÊN Z-[100] CẢ OVERLAY LẪN PICKER */}
      <CategoryFormModal
        isOpen={isCreateCategoryOpen}
        onClose={() => setIsCreateCategoryOpen(false)}
        className="z-[100]"
        pickerZIndex="z-[110]"
        onSuccess={(newCategory) => {
          fetchCategories();
          setFormData((prev) => ({
            ...prev,
            type: newCategory.type,
            categoryId: newCategory.id,
          }));
        }}
      />
    </>
  );
}
