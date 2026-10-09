'use client';

import { useState, useEffect, ComponentType } from 'react';
import Image from 'next/image';
import api from '@/lib/api';
import HeroBanner from '@/components/ui/HeroBanner';
import Dropdown, { DropdownOption } from '@/components/ui/Dropdown';

import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  AlertTriangle,
  Calendar as CalendarIcon,
  PiggyBank,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  PieChart,
  TriangleAlert,
} from 'lucide-react';
import { formatMoney } from '@/lib/format';
import { LUCIDE_ICONS } from '@/components/categories/CategoryFormModal';

interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string;
  imageUrl?: string;
}

interface Budget {
  id: string;
  amount: number;
  spent?: number; // Số tiền đã chi thực tế trong tháng
  month: number;
  year: number;
  category: Category;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    categoryId: '',
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  // Delete Modal
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
    categoryName: string;
  }>({
    isOpen: false,
    id: '',
    categoryName: '',
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Options cho Dropdown Tháng & Năm
  const monthOptions: DropdownOption[] = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Tháng ${i + 1}`,
    shortLabel: `T${i + 1}`,
  }));

  const yearOptions: DropdownOption[] = [2025, 2026, 2027].map((y) => ({
    value: y.toString(),
    label: `Năm ${y}`,
    shortLabel: `${y}`,
  }));

  // Options cho Dropdown Danh mục
  const categoryOptions: DropdownOption[] = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.filter((c: Category) => c.type === 'EXPENSE'));
    } catch (err) {
      console.error('Lỗi lấy danh mục:', err);
    }
  };

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('month', selectedMonth.toString());
      params.append('year', selectedYear.toString());

      const res = await api.get(`/budgets?${params.toString()}`);
      setBudgets(res.data);
    } catch (err) {
      console.error('Lỗi lấy danh sách ngân sách:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, selectedYear]);

  const handleOpenCreateModal = () => {
    setEditingBudget(null);
    setFormData({
      amount: '',
      categoryId: categories[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      amount: budget.amount.toString(),
      categoryId: budget.category.id,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Vui lòng nhập hạn mức ngân sách hợp lệ');
      return;
    }
    if (!formData.categoryId) {
      alert('Vui lòng chọn danh mục');
      return;
    }

    setSubmitLoading(true);

    const payload = {
      amount: parseFloat(formData.amount),
      categoryId: formData.categoryId,
      month: selectedMonth,
      year: selectedYear,
    };

    try {
      if (editingBudget) {
        await api.patch(`/budgets/${editingBudget.id}`, payload);
      } else {
        await api.post('/budgets', payload);
      }
      setIsModalOpen(false);
      fetchBudgets();
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
      await api.delete(`/budgets/${deleteModal.id}`);
      setDeleteModal({ isOpen: false, id: '', categoryName: '' });
      fetchBudgets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Xóa ngân sách thất bại');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Tính toán thống kê tổng quan
  const totalBudget = budgets.reduce((acc, b) => acc + Number(b.amount), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + Number(b.spent || 0), 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;

  return (
    <div className="w-full space-y-5 pb-16 select-none">
      {/* 1. HERO BANNER */}
      <HeroBanner
        badgeText="✨ Quản lý chi tiêu thông minh"
        greeting="Kế hoạch tài chính"
        title="Ngân sách hàng tháng"
        emoji="🎯"
        description="Thiết lập & kiểm soát hạn mức chi tiêu cho từng danh mục gia đình 💖"
        bannerDay="/images/banner_budget.png"
        bannerNight="/images/banner_budget_night.png"
        actionSlot={
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 hover:opacity-95 text-white px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-extrabold shadow-lg shadow-purple-500/25 transition-all active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Thiết lập ngân sách</span>
          </button>
        }
      />

      {/* 2. STAT CARDS THỐNG KÊ NGÂN SÁCH */}
      <div className="-mt-10 sm:-mt-14 relative z-20 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Tổng Ngân Sách */}
        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-100 dark:border-slate-800 shadow-md shadow-slate-200/40 dark:shadow-none">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-xl sm:rounded-2xl bg-purple-50 dark:bg-purple-950/40 p-1.5 border border-purple-100 dark:border-purple-800/40 grid place-items-center">
              <PiggyBank className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight truncate block">
                Tổng ngân sách
              </span>
              <p className="text-xs sm:text-base font-black text-purple-600 dark:text-purple-400 truncate mt-0.5">
                {totalBudget.toLocaleString('vi-VN')} đ
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Đã Chi Tiêu */}
        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-100 dark:border-slate-800 shadow-md shadow-slate-200/40 dark:shadow-none">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-xl sm:rounded-2xl bg-rose-50 dark:bg-rose-950/40 p-1.5 border border-rose-100 dark:border-rose-800/40 grid place-items-center">
              <TrendingUp className="h-6 w-6 text-rose-500" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight truncate block">
                Đã chi tiêu
              </span>
              <p className="text-xs sm:text-base font-black text-rose-600 dark:text-rose-400 truncate mt-0.5">
                {totalSpent.toLocaleString('vi-VN')} đ
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Còn Lại */}
        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-100 dark:border-slate-800 shadow-md shadow-slate-200/40 dark:shadow-none">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 p-1.5 border border-emerald-100 dark:border-emerald-800/40 grid place-items-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight truncate block">
                Còn lại
              </span>
              <p className={`text-xs sm:text-base font-black truncate mt-0.5 ${
                totalRemaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {totalRemaining.toLocaleString('vi-VN')} đ
              </p>
            </div>
          </div>
        </div>

        {/* Card 4: Tiến Độ Chi */}
        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-100 dark:border-slate-800 shadow-md shadow-slate-200/40 dark:shadow-none">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-xl sm:rounded-2xl bg-amber-50 dark:bg-amber-950/40 p-1.5 border border-amber-100 dark:border-amber-800/40 grid place-items-center">
              <PieChart className="h-6 w-6 text-amber-500" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight truncate block">
                Tiến độ chi
              </span>
              <p className="text-xs sm:text-base font-black text-slate-900 dark:text-white truncate mt-0.5">
                {overallPercentage}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BỘ LỌC THÁNG / NĂM VỚI COMPONENT DROPDOWN */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2.5">
          {/* Lọc Tháng */}
          <div className="w-32 sm:w-36">
            <Dropdown
              value={selectedMonth.toString()}
              onChange={(val) => setSelectedMonth(Number(val))}
              options={monthOptions}
              leftIcon={<CalendarIcon className="h-3.5 w-3.5" />}
              variant="filter"
              title="Chọn tháng"
            />
          </div>

          {/* Lọc Năm */}
          <div className="w-28 sm:w-32">
            <Dropdown
              value={selectedYear.toString()}
              onChange={(val) => setSelectedYear(Number(val))}
              options={yearOptions}
              variant="filter"
              title="Chọn năm"
            />
          </div>
        </div>

        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 text-center sm:text-right">
          Kế hoạch Tháng {selectedMonth}/{selectedYear}
        </span>
      </div>

      {/* 4. DANH SÁCH NGÂN SÁCH CÁC DANH MỤC */}
      {loading ? (
        <div className="flex h-64 w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-10 text-center bg-slate-50/50 dark:bg-slate-900/50">
          <PiggyBank className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Chưa lập ngân sách cho Tháng {selectedMonth}/{selectedYear}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Bấm nút &quot;Thiết lập ngân sách&quot; ở trên để quản lý chi tiêu tốt hơn
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 pt-3 md:grid-cols-2">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              icons={LUCIDE_ICONS}
              onEdit={() => handleOpenEditModal(budget)}
              onDelete={() =>
                setDeleteModal({ isOpen: true, id: budget.id, categoryName: budget.category.name })
              }
            />
          ))}
        </div>
      )}

      {/* 5. MODAL THÊM / SỬA NGÂN SÁCH DÙNG DROPDOWN VARIANT "FIELD" */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-5">
              {editingBudget ? 'Chỉnh sửa ngân sách' : `Lập ngân sách T${selectedMonth}/${selectedYear}`}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Chọn Danh mục dùng Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Danh mục chi tiêu <span className="text-rose-500">*</span>
                </label>
                <Dropdown
                  value={formData.categoryId}
                  onChange={(val) => setFormData({ ...formData, categoryId: val })}
                  options={categoryOptions}
                  placeholder="-- Chọn danh mục --"
                  variant="field"
                  disabled={!!editingBudget}
                  title="Danh mục chi tiêu"
                />
              </div>

              {/* Nhập Hạn mức ngân sách */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Hạn mức chi tiêu (VNĐ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Ví dụ: 3000000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
                />
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
                  disabled={submitLoading}
                  className="w-1/2 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  {submitLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{editingBudget ? 'Cập nhật' : 'Lưu ngân sách'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL XÁC NHẬN XÓA */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-100 dark:bg-rose-500/10 text-rose-600 grid place-items-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Hủy ngân sách danh mục này?
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Bạn có chắc chắn muốn hủy ngân sách cho danh mục <span className="font-bold text-slate-800 dark:text-slate-200">&quot;{deleteModal.categoryName}&quot;</span> trong tháng này không?
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, id: '', categoryName: '' })}
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
    </div>
  );
}

type IconEntry = { name: string; Icon: ComponentType<{ className?: string }> };

export interface BudgetItem {
  id: string;
  amount: number | string;
  spent?: number | string | null;
  category: { name: string; icon?: string; imageUrl?: string };
}

interface Props {
  budget: BudgetItem;
  icons: IconEntry[]; // truyền LUCIDE_ICONS vào
  onEdit: () => void;
  onDelete: () => void;
}

type Status = 'safe' | 'warn' | 'over';

const THEME: Record<
  Status,
  { tile: string; shadow: string; bar: string; amount: string; pill: string; pillText: string; Icon: ComponentType<{ className?: string }> }
> = {
  safe: {
    tile: 'from-violet-500 to-pink-500',
    shadow: 'shadow-purple-500/25',
    bar: 'from-violet-500 to-pink-500',
    amount: 'text-slate-900 dark:text-white',
    pill: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    pillText: 'Trong hạn mức',
    Icon: CheckCircle2,
  },
  warn: {
    tile: 'from-amber-400 to-orange-500',
    shadow: 'shadow-amber-500/25',
    bar: 'from-amber-400 to-orange-500',
    amount: 'text-amber-600 dark:text-amber-400',
    pill: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    pillText: 'Sắp hết hạn mức',
    Icon: TriangleAlert,
  },
  over: {
    tile: 'from-rose-500 to-pink-500',
    shadow: 'shadow-rose-500/25',
    bar: 'from-rose-500 to-red-500',
    amount: 'text-rose-600 dark:text-rose-400',
    pill: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    pillText: 'Vượt hạn mức',
    Icon: AlertTriangle,
  },
};

function BudgetCard({ budget, icons, onEdit, onDelete }: Props) {
  const spent = Number(budget.spent || 0);
  const amount = Number(budget.amount);

  const rawPercent = amount > 0 ? Math.round((spent / amount) * 100) : 0; // không chặn 100 để thấy mức vượt thật
  const barPercent = Math.min(rawPercent, 100);
  const remaining = amount - spent;

  const status: Status = spent > amount ? 'over' : rawPercent >= 85 ? 'warn' : 'safe';
  const t = THEME[status];

  const cat = budget.category;
  const Lucide = icons.find((i) => i.name === cat.icon)?.Icon;
  const iconIsWord = !cat.icon || /^[A-Za-z]+$/.test(cat.icon);

  return (
    <div className="group relative rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-300/70 hover:shadow-lg hover:shadow-purple-500/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-purple-500/40">
      {/* Nút thao tác: absolute vắt trên viền, không chiếm chỗ trong nội dung */}
      <div className="absolute -top-3 right-3 flex items-center gap-0.5 rounded-xl border border-slate-200 bg-white p-0.5 opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100 dark:border-slate-700 dark:bg-slate-800">
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

      {/* HEADER: icon + tên + hạn mức | trạng thái */}
      <div className="flex items-center gap-3.5">
        <div
          className={`relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br text-white shadow-md ${t.tile} ${t.shadow}`}
        >
          {cat.imageUrl ? (
            <img src={cat.imageUrl} alt={cat.name} className="object-cover" />
          ) : Lucide ? (
            <Lucide className="h-6 w-6" />
          ) : iconIsWord ? (
            <span className="text-lg font-black">{cat.name.charAt(0).toUpperCase()}</span>
          ) : (
            <span className="text-xl">{cat.icon}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-extrabold text-slate-900 dark:text-white" title={cat.name}>
            {cat.name}
          </h4>
          <p className="mt-0.5 truncate text-xs font-medium text-slate-400">
            Hạn mức{' '}
            <span className="font-bold text-purple-600 dark:text-purple-400">{formatMoney(amount)} đ</span>
          </p>
        </div>

        <span
          className={`hidden shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold sm:inline-flex ${t.pill}`}
        >
          <t.Icon className="h-3 w-3" />
          {t.pillText}
        </span>
      </div>

      {/* SỐ LIỆU CHÍNH */}
      <div className="mt-5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Đã dùng</p>
          <p className={`truncate text-2xl font-black tracking-tight ${t.amount}`}>
            {formatMoney(spent)}
            <span className="ml-1 text-base font-extrabold opacity-70">đ</span>
          </p>
        </div>
        <span className={`shrink-0 rounded-xl px-2.5 py-1 text-sm font-black ${t.pill}`}>{rawPercent}%</span>
      </div>

      {/* THANH TIẾN ĐỘ */}
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${t.bar}`}
          style={{ width: `${barPercent}%` }}
        />
      </div>

      {/* CÒN LẠI / VƯỢT */}
      <div className="mt-2.5 flex items-center justify-between text-xs font-semibold">
        <span className="text-slate-400">
          {status === 'over' ? 'Đã vượt' : 'Còn lại'}
        </span>
        <span
          className={`font-extrabold ${
            status === 'over' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'
          }`}
        >
          {status === 'over' ? '+' : ''}
          {formatMoney(Math.abs(remaining))} đ
        </span>
      </div>

      {/* Trạng thái dạng pill cho màn hình nhỏ (trên sm đã hiện ở header) */}
      <span
        className={`mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold sm:hidden ${t.pill}`}
      >
        <t.Icon className="h-3 w-3" />
        {t.pillText}
      </span>
    </div>
  );
}
