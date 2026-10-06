import { BookOpen, Gamepad2, ShoppingBag, ShoppingCart } from 'lucide-react';
import { Card, CardHeader, SeeAll } from '@/components/ui/Card';
import { vnd } from '@/lib/format';

const TX = [
  { title: 'Chợ & Siêu thị', sub: 'WinMart - 06/10/2024 19:24', amount: 420000, icon: ShoppingCart, bg: 'from-emerald-400 to-green-500', who: '👦' },
  { title: 'Mua sắm', sub: 'Shopee - 05/10/2024 14:12', amount: 1250000, icon: ShoppingBag, bg: 'from-pink-400 to-rose-500', who: '👩' },
  { title: 'Học phí', sub: 'Học phí Sóc - 05/10/2024 08:30', amount: 2000000, icon: BookOpen, bg: 'from-sky-400 to-blue-500', who: '👦' },
  { title: 'Giải trí', sub: 'CGV Vincom - 03/10/2024 21:10', amount: 320000, icon: Gamepad2, bg: 'from-violet-500 to-indigo-500', who: '👩' },
];

export default function RecentTransactions() {
  return (
    <Card>
      <CardHeader title="Giao dịch gần đây" action={<SeeAll />} />
      <ul className="space-y-3">
        {TX.map((t) => (
          <li key={t.title} className="flex items-center gap-3">
            <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${t.bg} text-white`}>
              <t.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.title}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{t.sub}</p>
            </div>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-violet-100 text-base dark:bg-white/10">{t.who}</span>
            <span className="w-28 text-right text-sm font-bold text-rose-500">- {vnd(t.amount)}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
