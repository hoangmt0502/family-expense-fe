'use client';

import { useEffect, useState } from 'react';
import HeroBanner from '@/components/ui/HeroBanner';
import StatCards from '@/components/dashboard/StatCards';
import IncomeExpenseChart from '@/components/dashboard/IncomeExpenseChart';
import CategoryBudgets from '@/components/dashboard/CategoryBudgets';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import SpendingBreakdown from '@/components/dashboard/SpendingBreakdown';
import Goals from '@/components/dashboard/Goals';

export default function DashboardPage() {
  const [familyName, setFamilyName] = useState<string>('Gia đình nhỏ');

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

  return (
    <div className="w-full space-y-5 pb-16 select-none">
      <HeroBanner
        title={`${familyName}!`}
        greeting="Xin chào"
        emoji="👋"
        bannerDay="/images/banner_home_day.png"
        bannerNight="/images/banner_home_night.png"
      />

      <div className="relative z-10 -mt-16 space-y-5 lg:-mt-10">
        {/* Component tự gọi API /dashboard/stats */}
        <StatCards />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="xl:col-span-2">
            {/* Component tự gọi API /dashboard/chart */}
            <IncomeExpenseChart />
          </div>
          {/* Component tự gọi API /dashboard/category-budgets */}
          <CategoryBudgets />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {/* Từng Component tự gọi API tương ứng */}
          <RecentTransactions />
          <SpendingBreakdown />
          <Goals />
        </div>
      </div>
    </div>
  );
}
