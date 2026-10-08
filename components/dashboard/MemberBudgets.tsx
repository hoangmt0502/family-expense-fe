'use client';

import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { Card, CardHeader, SeeAll } from '@/components/ui/Card';
import { vnd } from '@/lib/format';

interface MemberBudgetsProps {
  members?: Array<{
    id: string;
    name: string;
    avatar?: string;
    spent: number;
    limit?: number;
  }>;
}

export default function MemberBudgets({ members = [] }: MemberBudgetsProps) {
  const DEFAULT_LIMIT = 10000000;
  const BARS = [
    'from-blue-500 to-sky-400',
    'from-pink-500 to-rose-400',
    'from-amber-400 to-yellow-300',
    'from-purple-500 to-indigo-400',
  ];

  return (
    <Card>
      <CardHeader title="Ngân sách theo thành viên" action={<SeeAll href="/family" />} />
      <div className="space-y-4">
        {members.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">Chưa có dữ liệu thành viên</p>
        ) : (
          members.map((m, idx) => {
            const limit = m.limit || DEFAULT_LIMIT;
            const pct = Math.min(Math.round((m.spent / limit) * 100), 100);
            const barColor = BARS[idx % BARS.length];

            return (
              <div key={m.id || m.name} className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-violet-100 text-2xl dark:bg-white/10 grid place-items-center font-bold text-purple-600">
                  {m.avatar ? (
                    <Image src={m.avatar} alt={m.name} fill className="object-cover" />
                  ) : (
                    <span>{m.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-900 dark:text-white truncate">{m.name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
                      {vnd(m.spent)} / {vnd(limit)}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3">
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                      <div className={`h-full rounded-full bg-gradient-to-r ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-9 text-right text-xs font-bold text-slate-700 dark:text-slate-200">{pct}%</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
