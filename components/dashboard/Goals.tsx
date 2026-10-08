'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardHeader, SeeAll } from '@/components/ui/Card';
import { vnd } from '@/lib/format';
import { Target } from 'lucide-react';

export interface GoalSummary {
  id: string;
  title: string;
  emoji: string;
  targetAmount: number;
  currentAmount: number;
  barColor: string;
}

export default function Goals() {
  const [goals, setGoals] = useState<GoalSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await api.get('/goals');
        setGoals(res.data);
      } catch (err) {
        console.error('Lỗi tải mục tiêu cho Dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, []);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader title="Mục tiêu tài chính" action={<SeeAll href="/goals" />} />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 dark:border-white/10">
              <div className="h-14 w-14 shrink-0 rounded-xl bg-slate-200/80 dark:bg-slate-800" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-20 rounded bg-slate-200/80 dark:bg-slate-800" />
                <div className="h-2 w-full rounded-full bg-slate-200/60 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Trên Dashboard chỉ hiển thị tối đa 3 mục tiêu nổi bật nhất
  const displayGoals = goals.slice(0, 3);

  return (
    <Card>
      <CardHeader title="Mục tiêu tài chính" action={<SeeAll href="/goals" />} />
      
      <div className="space-y-3">
        {displayGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 mb-2">
              <Target className="h-6 w-6 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-xs text-slate-400">Chưa có mục tiêu nào</p>
          </div>
        ) : (
          displayGoals.map((g) => {
            const pct = Math.min(Math.round((g.currentAmount / g.targetAmount) * 100), 100);
            
            return (
              <div
                key={g.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 dark:border-white/10 transition-all hover:border-purple-200 dark:hover:border-purple-500/20"
              >
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-amber-50 text-3xl dark:bg-slate-800 shadow-xs">
                  {g.emoji}
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate pr-2">
                      {g.title}
                    </p>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-200 shrink-0">
                      {pct}%
                    </span>
                  </div>
                  
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {vnd(g.currentAmount)} / <span className="text-slate-700 dark:text-slate-300">{vnd(g.targetAmount)}</span>
                  </p>
                  
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${g.barColor || 'from-purple-600 to-indigo-400'}`}
                      style={{ width: `${pct}%` }}
                    />
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
