'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import api from '@/lib/api';
import HeroBanner from '@/components/ui/HeroBanner';
import type { ComponentType } from 'react';
import { Lock, Pencil, Trash2, Plus, Loader2, Tag, X, AlertTriangle } from 'lucide-react';

// Nhúng Component Form mới tách
import CategoryFormModal, { Category, LUCIDE_ICONS } from '@/components/categories/CategoryFormModal';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL');

  // Form Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Delete Modal
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

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setIsFormModalOpen(true);
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

      {/* COMPONENT FORM DANH MỤC */}
      <CategoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        category={editingCategory}
        onSuccess={(newCategory) => {
          // Khi Form trả về category mới, ta có thể tự gọi lại fetchCategories để update lại list
          fetchCategories();
        }}
      />

      {/* MODAL POPUP XÁC NHẬN XÓA */}
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
  icons: IconEntry[];
  onEdit: () => void;
  onDelete: () => void;
}

function CategoryCard({ category: cat, icons, onEdit, onDelete }: Props) {
  const isSystem = !cat.familyId;
  const isExpense = cat.type === 'EXPENSE';

  const Lucide = icons.find((i) => i.name === cat.icon)?.Icon;
  const iconIsWord = !cat.icon || /^[A-Za-z]+$/.test(cat.icon);

  return (
    <div className="group relative flex items-center gap-3.5 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-300/70 hover:shadow-lg hover:shadow-purple-500/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-purple-500/40">
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
