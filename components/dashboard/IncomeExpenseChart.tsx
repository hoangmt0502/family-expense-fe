'use client';

import { useState } from 'react';
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/Card';

// Đơn vị: triệu đồng. TODO: thay bằng dữ liệu từ API
const DATA = [
  { m: 'Th1', income: 16, expense: 8 }, { m: 'Th2', income: 22, expense: 13 },
  { m: 'Th3', income: 22, expense: 10 }, { m: 'Th4', income: 28, expense: 7 },
  { m: 'Th5', income: 20, expense: 14 }, { m: 'Th6', income: 22, expense: 15 },
  { m: 'Th7', income: 25, expense: 17 }, { m: 'Th8', income: 18, expense: 11 },
  { m: 'Th9', income: 28, expense: 11 }, { m: 'Th10', income: 32.5, expense: 18.4 },
  { m: 'Th11', income: 18, expense: 13 }, { m: 'Th12', income: 25, expense: 12 },
];
const TABS = ['Theo tháng', 'Theo tuần', 'Theo năm'];

export default function IncomeExpenseChart() {
  const [tab, setTab] = useState(TABS[0]);

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Biểu đồ thu chi</h3>
          <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"><i className="h-2.5 w-2.5 rounded-full bg-indigo-400" />Thu nhập</span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"><i className="h-2.5 w-2.5 rounded-full bg-pink-500" />Chi tiêu</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          {TABS.map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`rounded-full px-3 py-1.5 font-medium transition-colors ${tab === t ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* text-slate-* để tick dùng currentColor → tự đổi theo day/night */}
      <div className="h-64 text-slate-400 dark:text-slate-500">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={DATA} barGap={-26} margin={{ left: -10, right: 8 }}>
            <defs>
              <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#818cf8" stopOpacity={0.5} />
              </linearGradient>
              <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ec4899" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#f9a8d4" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.2} strokeDasharray="3 3" />
            <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${v}M`} tick={{ fill: 'currentColor', fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: 'rgba(139,92,246,0.08)' }}
              contentStyle={{ background: 'rgba(15,23,42,0.92)', border: 0, borderRadius: 12, color: '#fff' }}
              labelStyle={{ color: '#fff', fontWeight: 700 }}
              itemStyle={{ color: '#e2e8f0' }}
              formatter={(v, n) => [`${v}M`, n === 'income' ? 'Thu' : 'Chi']}
            />
            <Bar dataKey="income" fill="url(#gInc)" barSize={26} radius={[6, 6, 0, 0]} />
            <Bar dataKey="expense" fill="url(#gExp)" barSize={26} radius={[6, 6, 0, 0]} />
            <Line type="monotone" dataKey="expense" stroke="#d946ef" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
