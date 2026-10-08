'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Card, CardHeader } from '@/components/ui/Card';
import { vnd } from '@/lib/format';

const COLORS = ['#a855f7', '#d946ef', '#ec4899', '#fbbf24', '#2dd4bf', '#38bdf8', '#818cf8'];

export default function SpendingBreakdown() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBreakdown = async () => {
      try {
        const d = new Date();
        const res = await api.get(`/dashboard/spending-breakdown?month=${d.getMonth() + 1}&year=${d.getFullYear()}`);
        setItems(res.data);
      } catch (err) {} finally {
        setLoading(false);
      }
    };
    fetchBreakdown();
  }, []);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader title="Cơ cấu chi tiêu" />
        <div className="flex items-center gap-4 mt-2">
          <div className="h-40 w-40 shrink-0 rounded-full bg-slate-200/80 dark:bg-slate-800" />
          <div className="flex-1 space-y-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-3 w-full rounded bg-slate-200/70 dark:bg-slate-800" />)}
          </div>
        </div>
      </Card>
    );
  }

  const totalExpense = items.reduce((acc, cur) => acc + cur.amount, 0);
  const data = items.map((item, idx) => ({
    name: item.name,
    amount: item.amount,
    value: totalExpense > 0 ? Math.round((item.amount / totalExpense) * 100) : 0,
    color: COLORS[idx % COLORS.length],
  }));

  return (
    <Card>
      <CardHeader title="Cơ cấu chi tiêu" action={<span className="rounded-lg bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-white/5 dark:text-slate-300">Tháng {new Date().getMonth() + 1}</span>} />
      <div className="flex items-center gap-4">
        <div className="relative h-44 w-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.length > 0 ? data : [{ name: 'Trống', value: 1, color: '#e2e8f0' }]} dataKey="value" innerRadius="62%" outerRadius="100%" paddingAngle={2} stroke="none">
                {data.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{vnd(totalExpense)}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Tổng chi tiêu</p>
            </div>
          </div>
        </div>
        <ul className="min-w-0 flex-1 space-y-1.5 text-xs">
          {data.length === 0 ? (
            <p className="text-slate-400">Chưa có chi tiêu</p>
          ) : (
            data.map((d) => (
              <li key={d.name} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
                <span className="flex-1 truncate">{d.name}</span>
                <span className="font-semibold">{d.value}%</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </Card>
  );
}
