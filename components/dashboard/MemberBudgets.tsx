import { ChevronRight } from 'lucide-react';
import { Card, CardHeader, SeeAll } from '@/components/ui/Card';
import { vnd } from '@/lib/format';

const MEMBERS = [
  { name: 'Bố', emoji: '👨', used: 8000000, limit: 10000000, bar: 'from-blue-500 to-sky-400' },
  { name: 'Mẹ', emoji: '👩', used: 6500000, limit: 8000000, bar: 'from-pink-500 to-rose-400' },
  { name: 'Bé Sóc', emoji: '👦', used: 2800000, limit: 4000000, bar: 'from-amber-400 to-yellow-300' },
];

export default function MemberBudgets() {
  return (
    <Card>
      <CardHeader title="Ngân sách theo thành viên" action={<SeeAll />} />
      <div className="space-y-4">
        {MEMBERS.map((m) => {
          const pct = Math.round((m.used / m.limit) * 100);
          return (
            <div key={m.name} className="flex items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-violet-100 text-2xl dark:bg-white/10">{m.emoji}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-900 dark:text-white">{m.name}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{vnd(m.used)} / {vnd(m.limit)}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-3">
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                    <div className={`h-full rounded-full bg-gradient-to-r ${m.bar}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-9 text-right text-xs font-bold text-slate-700 dark:text-slate-200">{pct}%</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
