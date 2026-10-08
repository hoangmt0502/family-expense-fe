'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import api from '@/lib/api';
import { ArrowUp, ArrowDown, PiggyBank, ShoppingBag, Target, Wallet } from 'lucide-react';
import { vnd } from '@/lib/format';

// ... (Giữ nguyên component Spark và Icon3DContainer như cũ)

function Spark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${22 - ((v - min) / (max - min || 1)) * 18}`).join(' ');
  return (
    <svg viewBox="0 0 100 22" className="h-5 w-16 shrink-0 opacity-85" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Icon3DContainer({ src, alt, fallbackIcon: FallbackIcon }: any) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="relative flex h-13 w-13 sm:h-14 sm:w-14 shrink-0 items-center justify-center">
      {!imgError ? (
        <Image src={src} alt={alt} width={56} height={56} className="object-contain drop-shadow-md hover:scale-110 transition-transform duration-200" onError={() => setImgError(true)} />
      ) : (
        <FallbackIcon className="h-7 w-7 text-purple-600 dark:text-purple-400" />
      )}
    </div>
  );
}

export default function StatCards() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const d = new Date();
        const res = await api.get(`/dashboard/stats?month=${d.getMonth() + 1}&year=${d.getFullYear()}`);
        setData(res.data);
      } catch (err) {} finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2 xl:grid-cols-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/70 dark:bg-[#141927]/70 backdrop-blur-md border border-slate-100 dark:border-white/5">
            <div className="h-12 w-12 shrink-0 rounded-2xl bg-slate-200/70 dark:bg-slate-800" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-16 rounded-md bg-slate-200/70 dark:bg-slate-800" />
              <div className="h-5 w-24 rounded-lg bg-slate-200/80 dark:bg-slate-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const income = data?.totalIncome || 0;
  const expense = data?.totalExpense || 0;
  const balance = data?.balance || 0;
  const budget = data?.totalBudget || 1; // Tránh chia 0
  const pct = Math.min(Math.round((expense / budget) * 100), 100);
  const r = 15;
  const c = 2 * Math.PI * r;

  const ITEMS = [
    { label: 'Tổng thu nhập', value: income, delta: 12, up: true, icon: Wallet, image: '/images/icon_wallet_3d.png', color: '#10b981', spark: [3, 5, 4, 7, 6, 9, 8, 12] },
    { label: 'Tổng chi tiêu', value: expense, delta: 8, up: false, icon: ShoppingBag, image: '/images/icon_bag_3d.png', color: '#ec4899', spark: [6, 5, 8, 4, 7, 5, 9, 8] },
    { label: 'Số dư tích lũy', value: balance, delta: 5, up: balance >= 0, icon: PiggyBank, image: '/images/icon_piggy_3d.png', color: '#8b5cf6', spark: [4, 5, 5, 7, 6, 8, 9, 11] },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2 xl:grid-cols-4">
      {ITEMS.map(({ label, value, delta, up, icon, image, color, spark }) => (
        <div key={label} className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-white/80 dark:bg-[#141927]/80 backdrop-blur-md border border-slate-100 dark:border-white/10 shadow-xs hover:shadow-md transition-all">
          <Icon3DContainer src={image} alt={label} fallbackIcon={icon} />
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{label}</p>
            <p className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight truncate">{vnd(value)}</p>
            <div>
              <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${up ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/15'}`}>
                {up ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}{delta}%
              </span>
            </div>
          </div>
          <div className="hidden sm:block shrink-0 self-center">
            <Spark data={spark} color={color} />
          </div>
        </div>
      ))}

      {/* Card 4: Ngân sách tháng */}
      <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-white/80 dark:bg-[#141927]/80 backdrop-blur-md border border-slate-100 dark:border-white/10 shadow-xs hover:shadow-md transition-all">
        <Icon3DContainer src="/images/icon_target_3d.png" alt="Ngân sách tháng" fallbackIcon={Target} />
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate">Ngân sách tháng</p>
          <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate">{vnd(budget)}</p>
          <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate">Đã chi {vnd(expense)}</p>
        </div>
        <div className="relative h-9 w-9 shrink-0">
          <svg viewBox="0 0 40 40" className="-rotate-90 w-full h-full">
            <circle cx="20" cy="20" r={r} fill="none" strokeWidth="3.5" className="stroke-slate-100 dark:stroke-white/10" />
            <circle cx="20" cy="20" r={r} fill="none" strokeWidth="3.5" strokeLinecap="round" stroke="url(#budgetGrad)" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
            <defs>
              <linearGradient id="budgetGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute inset-0 grid place-items-center text-[9px] font-bold text-slate-800 dark:text-white">{pct}%</span>
        </div>
      </div>
    </div>
  );
}
