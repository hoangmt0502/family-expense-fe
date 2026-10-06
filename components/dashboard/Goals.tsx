import { Card, CardHeader, SeeAll } from '@/components/ui/Card';
import { vnd } from '@/lib/format';

const GOALS = [
  { title: 'Mua nhà', emoji: '🏠', saved: 450000000, target: 1500000000, bar: 'from-violet-600 to-indigo-400' },
  { title: 'Du lịch gia đình', emoji: '🏝️', saved: 25000000, target: 50000000, bar: 'from-teal-400 to-emerald-300' },
];

export default function Goals() {
  return (
    <Card>
      <CardHeader title="Mục tiêu tài chính" action={<SeeAll />} />
      <div className="space-y-3">
        {GOALS.map((g) => {
          const pct = Math.round((g.saved / g.target) * 100);
          return (
            <div key={g.title} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 dark:border-white/10">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-amber-50 text-3xl dark:bg-white/10">{g.emoji}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{g.title}</p>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{pct}%</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{vnd(g.saved)} / {vnd(g.target)}</p>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div className={`h-full rounded-full bg-gradient-to-r ${g.bar}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
