'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // ✅ Đúng cú pháp
import HeroBanner from '@/components/ui/HeroBanner';
import StatCards from '@/components/dashboard/StatCards';
import IncomeExpenseChart from '@/components/dashboard/IncomeExpenseChart';
import CategoryBudgets from '@/components/dashboard/CategoryBudgets';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import SpendingBreakdown from '@/components/dashboard/SpendingBreakdown';
import Goals from '@/components/dashboard/Goals';

// Import Component Form Giao dịch dùng chung
import TransactionFormModal from '@/components/transactions/TransactionFormModal';
import { Plus, CheckCircle2, ListFilter, PlusCircle } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [familyName, setFamilyName] = useState<string>('Gia đình nhỏ');

  // State quản lý Modal tạo giao dịch
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  
  // State quản lý Popup thành công
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Key dùng để ép các widget con tự fetch lại API khi có giao dịch mới
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem('user_info');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const name = parsed.family?.name || parsed.familyName;
        if (name) setFamilyName(name);
      } catch (e) {
        console.error('Lỗi đọc user_info:', e);
      }
    }
  }, []);

  // Xử lý khi tạo giao dịch thành công
  const handleTransactionSuccess = () => {
    // 1. Cập nhật key để làm mới dữ liệu biểu đồ, thống kê trên Dashboard
    setRefreshKey((prev) => prev + 1);
    
    // 2. Mở Popup hỏi bước tiếp theo
    setIsSuccessModalOpen(true);
  };

  const handleContinueCreating = () => {
    setIsSuccessModalOpen(false);
    setIsTransactionModalOpen(true); // Mở lại form tạo mới
  };

  const handleGoToTransactionsList = () => {
    setIsSuccessModalOpen(false);
    router.push('/transactions'); // Chuyển hướng sang trang danh sách giao dịch
  };

  return (
    <div className="w-full space-y-5 pb-16 select-none">
      <HeroBanner
        title={`${familyName}!`}
        greeting="Xin chào"
        emoji="👋"
        bannerDay="/images/banner_home_day.png"
        bannerNight="/images/banner_home_night.png"
        actionSlot={
          <button
            type="button"
            onClick={() => setIsTransactionModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 hover:opacity-95 text-white px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-extrabold shadow-lg shadow-purple-500/25 transition-all active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Tạo giao dịch</span>
          </button>
        }
      />

      <div className="relative z-10 -mt-16 space-y-5 lg:-mt-10">
        <StatCards key={`stats-${refreshKey}`} />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <IncomeExpenseChart key={`chart-${refreshKey}`} />
          </div>
          <CategoryBudgets key={`budgets-${refreshKey}`} />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <RecentTransactions key={`recent-${refreshKey}`} />
          <SpendingBreakdown key={`breakdown-${refreshKey}`} />
          <Goals key={`goals-${refreshKey}`} />
        </div>
      </div>

      {/* FORM TẠO GIAO DỊCH */}
      <TransactionFormModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSuccess={handleTransactionSuccess}
      />

      {/* POPUP THÔNG BÁO THÀNH CÔNG */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 text-center space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-200">
            {/* Icon tích xanh */}
            <div className="h-14 w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 grid place-items-center mx-auto shadow-md shadow-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Thêm giao dịch thành công!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Giao dịch đã được lưu vào nhật ký thu chi của gia đình.
              </p>
            </div>

            {/* Các nút bấm lựa chọn */}
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleContinueCreating}
                className="w-full py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Tiếp tục thêm thu chi</span>
              </button>

              <button
                type="button"
                onClick={handleGoToTransactionsList}
                className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <ListFilter className="h-4 w-4" />
                <span>Xem danh sách thu chi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
