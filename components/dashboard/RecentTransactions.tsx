'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { BookOpen, Gamepad2, ShoppingBag, ShoppingCart } from 'lucide-react';
import { Card, CardHeader, SeeAll } from '@/components/ui/Card';
import { vnd } from '@/lib/format';

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTx = async () => {
      try {
        const res = await api.get(`/dashboard/recent-transactions`);
        setTransactions(res.data);
      } catch (err) {} finally {
        setLoading(false);
      }
    };
    fetchTx();
  }, []);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader title="Giao dịch gần đây" action={<SeeAll href="/transactions" />} />
        <div className="space-y-3 pt-1">
          {[1, 2, 3, 4].map((j) => (
            <div key={j} className="flex items-center gap-3">
              <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-200/70 dark:bg-slate-800" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-24 rounded bg-slate-200/80 dark:bg-slate-800" />
                <div className="h-2.5 w-16 rounded bg-slate-200/50 dark:bg-slate-800" />
              </div>
              <div className="h-4 w-16 rounded bg-slate-200/70 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'ShoppingBag': return ShoppingBag;
      case 'BookOpen': return BookOpen;
      case 'Gamepad2': return Gamepad2;
      default: return ShoppingCart;
    }
  };

  return (
    <Card>
      <CardHeader title="Giao dịch gần đây" action={<SeeAll href="/transactions" />} />
      <ul className="space-y-3">
        {transactions.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">Chưa có giao dịch nào trong tháng</p>
        ) : (
          transactions.map((t) => {
            const IconComponent = getIcon(t.categoryIcon);
            const isExpense = t.type === 'EXPENSE';
            return (
              <li key={t.id} className="flex items-center gap-3">
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white ${isExpense ? 'bg-gradient-to-br from-rose-400 to-pink-500' : 'bg-gradient-to-br from-emerald-400 to-teal-500'}`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{t.categoryName}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{t.note || new Date(t.date).toLocaleDateString('vi-VN')}</p>
                </div>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-violet-100 text-xs font-bold text-purple-600 dark:bg-white/10 dark:text-purple-300">
                  {t.userName ? t.userName.charAt(0).toUpperCase() : 'U'}
                </span>
                <span className={`w-28 text-right text-sm font-bold shrink-0 ${isExpense ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {isExpense ? `- ${vnd(t.amount)}` : `+ ${vnd(t.amount)}`}
                </span>
              </li>
            );
          })
        )}
      </ul>
    </Card>
  );
}
