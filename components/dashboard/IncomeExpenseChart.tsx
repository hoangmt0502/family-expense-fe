'use client';

import { useState, useEffect } from 'react';
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/Card';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';

const TABS = [
  { label: 'Theo tháng', value: 'month' },
  { label: 'Theo năm', value: 'year' }
];

export default function IncomeExpenseChart() {
  const [tab, setTab] = useState(TABS[0].value);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/dashboard/chart?filter=${tab}`);
        // Chuyển đổi dữ liệu sang đơn vị Triệu (M)
        const formattedData = res.data.map((item: any) => ({
          m: item.name,
          income: Number((item.income / 1000000).toFixed(1)),
          expense: Number((item.expense / 1000000).toFixed(1)),
        }));
        setChartData(formattedData);
      } catch (err) {
        console.error('Lỗi lấy dữ liệu biểu đồ:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [tab]); // Tự động gọi lại API khi đổi tab

  return (
    <Card className="relative">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Biểu đồ thu chi</h3>
          <span className="flex items-center gap-1.5 text-xs text-slate-500"><i className="h-2.5 w-2.5 rounded-full bg-indigo-400" />Thu</span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500"><i className="h-2.5 w-2.5 rounded-full bg-pink-500" />Chi</span>
        </div>
        
        {/* Nhóm Nút Filter */}
        <div className="flex items-center gap-1 text-xs">
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              disabled={loading}
              onClick={() => setTab(t.value)}
              className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
                tab === t.value
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 text-slate-400 dark:text-slate-500 relative">
        {loading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
          </div>
        ) : null}

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} barGap={-26} margin={{ left: -10, right: 8 }}>
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
              formatter={(v, n) => [`${v} Trđ`, n === 'income' ? 'Thu' : 'Chi']}
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
