'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import api from '@/lib/api';
import HeroBanner from '@/components/ui/HeroBanner';
import TransactionDetailModal from '@/components/transactions/TransactionDetailModal';
import CameraCaptureModal from '@/components/ui/Cameracapturemodal';
import { LUCIDE_ICONS } from '../categories/page';

// Date Picker Library & Locales
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';

import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  AlertTriangle,
  Upload,
  Wallet,
  Calendar as CalendarIcon,
  Filter,
  ImageIcon,
  TrendingUp,
  TrendingDown,
  Camera,
  CalendarDays,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string;
  imageUrl?: string;
}

interface User {
  id: string;
  fullName: string;
  avatar?: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  note?: string;
  date: string;
  imageUrl?: string;
  category: Category;
  user: User;
}

interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    categoryId: '',
    note: '',
    date: new Date(),
    imageUrl: '',
  });

  // Xem chi tiết & Phóng to ảnh
  const [viewingTx, setViewingTx] = useState<Transaction | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Date Picker Overlay State
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Camera
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const cameraFallbackRef = useRef<HTMLInputElement>(null);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Delete Modal
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string }>({
    isOpen: false,
    id: '',
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedMonth) params.append('month', selectedMonth.toString());
      if (selectedYear) params.append('year', selectedYear.toString());
      if (selectedCategoryId) params.append('categoryId', selectedCategoryId);

      const res = await api.get(`/transactions?${params.toString()}`);

      // Ép amount về number (API có thể trả chuỗi dạng "15000000" → toLocaleString không có tác dụng)
      setTransactions(
        res.data.data.map((t: Transaction) => ({ ...t, amount: Number(t.amount) })),
      );
      setSummary({
        totalIncome: Number(res.data.summary.totalIncome),
        totalExpense: Number(res.data.summary.totalExpense),
        balance: Number(res.data.summary.balance),
      });
    } catch (err) {
      console.error('Lỗi lấy danh sách giao dịch:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Lỗi lấy danh mục:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [selectedMonth, selectedYear, selectedCategoryId]);

  // Upload 1 file ảnh (dùng chung cho chọn file & chụp từ camera)
  const uploadFile = async (file: File) => {
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);

    setUploadingImage(true);
    try {
      const res = await api.post('/upload/image', bodyFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({ ...prev, imageUrl: res.data.url }));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Tải ảnh thất bại');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = ''; // cho phép chọn lại cùng 1 file
  };

  const handleOpenCreateModal = () => {
    setEditingTx(null);
    setFormData({
      amount: '',
      type: 'EXPENSE',
      categoryId: categories.find((c) => c.type === 'EXPENSE')?.id || '',
      note: '',
      date: new Date(),
      imageUrl: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setFormData({
      amount: tx.amount.toString(),
      type: tx.type,
      categoryId: tx.category.id,
      note: tx.note || '',
      date: tx.date ? new Date(tx.date) : new Date(),
      imageUrl: tx.imageUrl || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    if (!formData.categoryId) {
      alert('Vui lòng chọn danh mục');
      return;
    }

    setSubmitLoading(true);

    const payload = {
      amount: parseFloat(formData.amount),
      type: formData.type,
      categoryId: formData.categoryId,
      note: formData.note.trim() || undefined,
      date: formData.date ? formData.date.toISOString() : undefined,
      imageUrl: formData.imageUrl.trim() || undefined,
    };

    try {
      if (editingTx) {
        await api.patch(`/transactions/${editingTx.id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      setIsModalOpen(false);
      fetchTransactions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/transactions/${deleteModal.id}`);
      setDeleteModal({ isOpen: false, id: '' });
      fetchTransactions();
      if (viewingTx?.id === deleteModal.id) setViewingTx(null); // Đóng modal chi tiết nếu đang mở giao dịch vừa xóa
    } catch (err: any) {
      alert(err.response?.data?.message || 'Xóa giao dịch thất bại');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredCategoriesForForm = categories.filter((c) => c.type === formData.type);

  return (
    <div className="w-full space-y-5 pb-16 select-none">
      {/* 1. HERO BANNER */}
      <HeroBanner
        badgeText="✨ Sổ thu chi gia đình"
        greeting="Quản lý giao dịch"
        title="Nhật ký thu chi"
        emoji="💰"
        description="Theo dõi & ghi chép khoản thu nhập, chi tiêu minh bạch hàng ngày 💖"
        bannerDay="/images/banner_transaction.png"
        bannerNight="/images/banner_transaction_night.png"
        actionSlot={
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 hover:opacity-95 text-white px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-extrabold shadow-lg shadow-purple-500/25 transition-all active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Tạo giao dịch</span>
          </button>
        }
      />

      {/* 2. 4 THẺ STAT CARDS */}
      <div className="-mt-10 sm:-mt-14 relative z-20 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Tổng Thu Nhập */}
        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-100 dark:border-slate-800 shadow-md shadow-slate-200/40 dark:shadow-none">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 p-1.5 border border-emerald-100 dark:border-emerald-800/40 grid place-items-center">
              <Image
                src="/images/icon_wallet_3d.png"
                alt="Thu nhập"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight truncate">
                  Tổng thu nhập
                </span>
                <TrendingUp className="h-3 w-3 text-emerald-500 shrink-0" />
              </div>
              <p className="text-xs sm:text-base font-black text-emerald-600 dark:text-emerald-400 truncate mt-0.5">
                {summary.totalIncome.toLocaleString('vi-VN')} đ
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Tổng Chi Tiêu */}
        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-100 dark:border-slate-800 shadow-md shadow-slate-200/40 dark:shadow-none">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-xl sm:rounded-2xl bg-rose-50 dark:bg-rose-950/40 p-1.5 border border-rose-100 dark:border-rose-800/40 grid place-items-center">
              <Image
                src="/images/icon_bag_3d.png"
                alt="Chi tiêu"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight truncate">
                  Tổng chi tiêu
                </span>
                <TrendingDown className="h-3 w-3 text-rose-500 shrink-0" />
              </div>
              <p className="text-xs sm:text-base font-black text-rose-600 dark:text-rose-400 truncate mt-0.5">
                {summary.totalExpense.toLocaleString('vi-VN')} đ
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Số Dư Tích Lũy */}
        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-100 dark:border-slate-800 shadow-md shadow-slate-200/40 dark:shadow-none">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-xl sm:rounded-2xl bg-purple-50 dark:bg-purple-950/40 p-1.5 border border-purple-100 dark:border-purple-800/40 grid place-items-center">
              <Image
                src="/images/icon_piggy_3d.png"
                alt="Số dư"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight truncate block">
                Số dư tích lũy
              </span>
              <p
                className={`text-xs sm:text-base font-black truncate mt-0.5 ${
                  summary.balance >= 0
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {summary.balance.toLocaleString('vi-VN')} đ
              </p>
            </div>
          </div>
        </div>

        {/* Card 4: Giao Dịch Đã Phát Sinh */}
        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-100 dark:border-slate-800 shadow-md shadow-slate-200/40 dark:shadow-none">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-xl sm:rounded-2xl bg-amber-50 dark:bg-amber-950/40 p-1.5 border border-amber-100 dark:border-amber-800/40 grid place-items-center">
              <Image
                src="/images/icon_target_3d.png"
                alt="Giao dịch"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight truncate block">
                Đã phát sinh
              </span>
              <p className="text-xs sm:text-base font-black text-slate-900 dark:text-white truncate mt-0.5">
                {transactions.length} khoản
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BỘ LỌC TẬP TRUNG */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-3">
          {/* Lọc Tháng */}
          <div className="flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <CalendarIcon className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  T{m}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc Năm */}
          <div className="flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {[2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc Danh mục */}
          <div className="flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <Filter className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none max-w-[90px] sm:max-w-[150px] truncate cursor-pointer"
            >
              <option value="">Tất cả</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 text-center sm:text-right">
          Thống kê Tháng {selectedMonth}/{selectedYear}
        </span>
      </div>

      {/* 4. DANH SÁCH GIAO DỊCH */}
      {loading ? (
        <div className="flex h-64 w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-10 text-center bg-slate-50/50 dark:bg-slate-900/50">
          <Wallet className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Chưa có giao dịch nào trong tháng {selectedMonth}/{selectedYear}
          </p>
        </div>
      ) : (
        <>
          {/* 4.1 VIEW DESKTOP (TABLE) */}
          <div className="hidden md:block rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ngày</th>
                    <th className="p-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Danh mục</th>
                    <th className="p-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ghi chú</th>
                    <th className="p-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Số tiền</th>
                    <th className="p-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Người tạo</th>
                    <th className="p-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {transactions.map((tx) => {
                    const LucideItem = LUCIDE_ICONS.find((i) => i.name === tx.category.icon)?.Icon;

                    return (
                      <tr
                        key={tx.id}
                        onClick={() => setViewingTx(tx)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                      >
                        <td className="p-4 py-3 text-[13px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {format(new Date(tx.date), 'dd/MM/yyyy')}
                        </td>
                        <td className="p-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-gradient-to-tr from-purple-100 to-pink-100 dark:from-purple-950 dark:to-slate-800 text-purple-600 dark:text-purple-300 grid place-items-center font-bold">
                              {tx.category.imageUrl ? (
                                <Image src={tx.category.imageUrl} alt={tx.category.name} fill className="object-cover" />
                              ) : LucideItem ? (
                                <LucideItem className="h-4 w-4" />
                              ) : (
                                <span className="text-xs">{tx.category.icon || tx.category.name.charAt(0)}</span>
                              )}
                            </div>
                            <span className="text-[13px] font-extrabold text-slate-900 dark:text-white">
                              {tx.category.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 py-3 text-[13px] text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
                          {tx.note || '-'}
                        </td>
                        <td className="p-4 py-3 text-right whitespace-nowrap">
                          <span className={`text-[14px] font-black ${
                            tx.type === 'EXPENSE' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {tx.amount.toLocaleString('vi-VN')} đ
                          </span>
                        </td>
                        <td className="p-4 py-3 text-[13px] font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {tx.user.fullName}
                        </td>
                        <td className="p-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleOpenEditModal(tx); }}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-purple-600 dark:hover:bg-slate-700 dark:hover:text-purple-400 transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setDeleteModal({ isOpen: true, id: tx.id }); }}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-500/20 dark:hover:text-rose-400 transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4.2 VIEW MOBILE (CARDS) */}
          <div className="md:hidden space-y-2.5">
            {transactions.map((tx) => {
              const LucideItem = LUCIDE_ICONS.find((i) => i.name === tx.category.icon)?.Icon;

              return (
                <div
                  key={tx.id}
                  onClick={() => setViewingTx(tx)}
                  className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-gradient-to-tr from-purple-100 to-pink-100 dark:from-purple-950 dark:to-slate-800 text-purple-600 dark:text-purple-300 grid place-items-center font-bold shadow-2xs">
                      {tx.category.imageUrl ? (
                        <Image
                          src={tx.category.imageUrl}
                          alt={tx.category.name}
                          fill
                          className="object-cover"
                        />
                      ) : LucideItem ? (
                        <LucideItem className="h-5 w-5" />
                      ) : (
                        <span className="text-base">{tx.category.icon || tx.category.name.charAt(0)}</span>
                      )}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                          {tx.category.name}
                        </h4>
                        {tx.note && (
                          <span className="text-[11px] text-slate-400 font-normal truncate max-w-[120px] sm:max-w-[240px]">
                            • {tx.note}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">
                        {format(new Date(tx.date), 'dd/MM/yyyy')} • {tx.user.fullName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
                    <span
                      className={`text-xs sm:text-base font-black ${
                        tx.type === 'EXPENSE'
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {tx.amount.toLocaleString('vi-VN')} đ
                    </span>

                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleOpenEditModal(tx); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-purple-600 dark:hover:bg-slate-800 dark:hover:text-purple-400 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* MODAL 5: XEM CHI TIẾT GIAO DỊCH */}
      {viewingTx && (
        <TransactionDetailModal
          tx={viewingTx}
          icons={LUCIDE_ICONS}
          onClose={() => setViewingTx(null)}
          onZoomImage={setZoomedImage}
          onEdit={() => {
            const t = viewingTx;
            setViewingTx(null);
            handleOpenEditModal(t);
          }}
          onDelete={() => {
            const id = viewingTx.id;
            setViewingTx(null);
            setDeleteModal({ isOpen: true, id });
          }}
        />
      )}

      {/* MODAL 6: PHÓNG TO ẢNH (LIGHTBOX) */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 cursor-zoom-out animate-fadeIn"
          onClick={() => setZoomedImage(null)}
        >
          <button
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
            onClick={(e) => { e.stopPropagation(); setZoomedImage(null); }}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={zoomedImage}
            alt="Zoomed"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200"
          />
        </div>
      )}

      {/* MODAL 7: THÊM / SỬA GIAO DỊCH */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-5">
              {editingTx ? 'Chỉnh sửa giao dịch' : 'Tạo giao dịch mới'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 relative">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const defaultCat = categories.find((c) => c.type === 'EXPENSE')?.id || '';
                    setFormData({ ...formData, type: 'EXPENSE', categoryId: defaultCat });
                  }}
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
                  onClick={() => {
                    const defaultCat = categories.find((c) => c.type === 'INCOME')?.id || '';
                    setFormData({ ...formData, type: 'INCOME', categoryId: defaultCat });
                  }}
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

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  Danh mục <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {filteredCategoriesForForm.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* DATE PICKER */}
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
                      {uploadingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      <span>Tải ảnh từ máy</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>

                    {/* Chụp ảnh mới: mở camera trực tiếp (getUserMedia) */}
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => setIsCameraOpen(true)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-pink-300 bg-pink-50/50 hover:bg-pink-100/50 px-3 py-2.5 text-xs font-bold text-pink-600 transition-all dark:border-pink-500/30 dark:bg-pink-500/10 dark:text-pink-300 disabled:opacity-60"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Chụp ảnh mới</span>
                    </button>

                    {/* Dự phòng: mở app máy ảnh của thiết bị khi trình duyệt không cho dùng camera */}
                    <input
                      ref={cameraFallbackRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="Hoặc dán link ảnh..."
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
                    />

                    {formData.imageUrl ? (
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer" onClick={() => setZoomedImage(formData.imageUrl!)}>
                        <Image
                          src={formData.imageUrl}
                          alt="Preview"
                          fill
                          className="object-cover"
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
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-bold text-xs transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || uploadingImage}
                  className="w-1/2 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  {submitLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{editingTx ? 'Cập nhật' : 'Tạo mới'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPOVER DATE PICKER (FIXED) - Nổi phía trên Modal Form */}
      {isDatePickerOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsDatePickerOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl scale-100 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <DayPicker
              mode="single"
              selected={formData.date}
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  setFormData({ ...formData, date: selectedDate });
                  setIsDatePickerOpen(false);
                }
              }}
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

      {/* 8. MODAL XÁC NHẬN XÓA */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-100 dark:bg-rose-500/10 text-rose-600 grid place-items-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Xóa giao dịch này?
            </h3>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, id: '' })}
                className="w-1/2 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDelete}
                className="w-1/2 py-3 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center justify-center transition-all active:scale-95"
              >
                {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xóa ngay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. CAMERA CHỤP ẢNH CHỨNG TỪ (nổi trên mọi modal) */}
      {isCameraOpen && (
        <CameraCaptureModal
          onClose={() => setIsCameraOpen(false)}
          onCapture={uploadFile}
          onFallback={() => cameraFallbackRef.current?.click()}
        />
      )}
    </div>
  );
}