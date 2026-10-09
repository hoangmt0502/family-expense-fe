'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import api from '@/lib/api';
import { Card, CardHeader, SeeAll } from '@/components/ui/Card';
import { vnd } from '@/lib/format';
import { LUCIDE_ICONS } from '../categories/CategoryFormModal';

export default function CategoryBudgets() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const d = new Date();
        const res = await api.get(`/dashboard/category-budgets?month=${d.getMonth() + 1}&year=${d.getFullYear()}`);
        setBudgets(res.data);
      } catch (err) {} finally {
        setLoading(false);
      }
    };
    fetchBudgets();
  }, []);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader title="Tiến độ ngân sách" action={<SeeAll href="/budgets" />} />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-11 w-11 shrink-0 rounded-2xl bg-slate-200/80 dark:bg-slate-800" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-20 rounded bg-slate-200/80 dark:bg-slate-800" />
                <div className="h-2 w-full rounded-full bg-slate-200/60 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const BARS = ['from-blue-500 to-sky-400', 'from-pink-500 to-rose-400', 'from-amber-400 to-yellow-300', 'from-emerald-500 to-teal-400'];

  return (
    <Card>
      <CardHeader title="Tiến độ ngân sách" action={<SeeAll href="/budgets" />} />
      <div className="space-y-4">
        {budgets.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">Chưa lập ngân sách tháng này</p>
        ) : (
          budgets.map((b, idx) => {
            const pct = Math.min(Math.round((b.spent / b.limit) * 100), 100);
            const isOver = b.spent > b.limit;
            const barColor = isOver ? 'from-rose-500 to-red-500' : BARS[idx % BARS.length];
            const LucideItem = LUCIDE_ICONS.find((i) => i.name === b.icon)?.Icon;

            return (
              <div key={b.id} className="flex items-center gap-3 group cursor-pointer">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-purple-50 text-purple-600 dark:bg-slate-800 dark:text-purple-400 grid place-items-center shadow-xs">
                  {b.imageUrl ? (
                    <Image src={b.imageUrl} alt={b.name} fill className="object-cover" />
                  ) : LucideItem ? (
                    <LucideItem className="h-5 w-5" />
                  ) : (
                    <span className="font-bold">{b.name.charAt(0)}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-900 dark:text-white truncate">{b.name}</span>
                    <span className={`text-[11px] font-semibold shrink-0 ${isOver ? 'text-rose-500' : 'text-slate-500'}`}>
                      {vnd(b.spent)} / {vnd(b.limit)}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={`w-8 text-right text-[10px] font-black ${isOver ? 'text-rose-500' : 'text-slate-600'}`}>{pct}%</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
