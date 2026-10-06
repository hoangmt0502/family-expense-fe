import Goals from "@/components/dashboard/Goals";
import HeroBanner from "@/components/dashboard/HeroBanner";
import IncomeExpenseChart from "@/components/dashboard/IncomeExpenseChart";
import MemberBudgets from "@/components/dashboard/MemberBudgets";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import SpendingBreakdown from "@/components/dashboard/SpendingBreakdown";
import StatCards from "@/components/dashboard/StatCards";


export default function DashboardPage() {
  return (
    <div>
      <HeroBanner />
 
      {/* Kéo toàn bộ nội dung lên đè vào đáy banner (phần ảnh đang tan) */}
      <div className="relative z-10 -mt-16 space-y-5 lg:-mt-10">
        <StatCards />
 
        {/* Hàng giữa: biểu đồ (2/3) + ngân sách thành viên (1/3) */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="xl:col-span-2"><IncomeExpenseChart /></div>
          <MemberBudgets />
        </div>
 
        {/* Hàng cuối: giao dịch + cơ cấu + mục tiêu */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <RecentTransactions />
          <SpendingBreakdown />
          <Goals />
        </div>
      </div>
    </div>
  );
}
