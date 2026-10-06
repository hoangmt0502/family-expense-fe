'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Card, CardHeader } from '@/components/ui/Card';

const DATA = [
  { name: 'Chợ & Siêu thị', value: 32, color: '#a855f7' },
  { name: 'Mua sắm', value: 20, color: '#d946ef' },
  { name: 'Học tập', value: 15, color: '#ec4899' },
  { name: 'Ăn uống', value: 12, color: '#fbbf24' },
  { name: 'Giải trí', value: 10, color: '#2dd4bf' },
  { name: 'Sức khỏe', value: 8, color: '#38bdf8' },
  { name: 'Khác', value: 3, color: '#818cf8' },
];

export default function SpendingBreakdown() {
  return (
    <Card>
      <CardHeader
        title="Cơ cấu chi tiêu"
        action={<span className="rounded-lg bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-white/5 dark:text-slate-300">Tháng 10</span>}
      />
      <div className="flex items-center gap-4">
        <div className="relative h-44 w-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={DATA} dataKey="value" innerRadius="62%" outerRadius="100%" paddingAngle={2} stroke="none">
                {DATA.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">18.420.000đ</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Tổng chi tiêu</p>
            </div>
          </div>
        </div>
        <ul className="min-w-0 flex-1 space-y-1.5 text-xs">
          {DATA.map((d) => (
            <li key={d.name} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
              <span className="flex-1 truncate">{d.name}</span>
              <span className="font-semibold">{d.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
