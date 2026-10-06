'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  House,
  ClipboardList,
  CalendarCheck,
  PiggyBank,
  HandCoins,
  Landmark,
  CircleCheck,
  ChartColumn,
  Settings,
  X,
  Heart,
  Sparkles,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const NAV = [
  { href: '/', label: 'Tổng quan', icon: House, emoji: '🏠' },
  { href: '/transactions', label: 'Thu chi', icon: ClipboardList, emoji: '📝' },
  { href: '/budgets', label: 'Ngân sách', icon: CalendarCheck, emoji: '📅' },
  { href: '/savings', label: 'Tiết kiệm', icon: PiggyBank, emoji: '🐷' },
  { href: '/loans', label: 'Khoản vay', icon: HandCoins, emoji: '🤝' },
  { href: '/assets', label: 'Tài sản', icon: Landmark, emoji: '💎' },
  { href: '/goals', label: 'Mục tiêu', icon: CircleCheck, emoji: '🎯' },
  { href: '/reports', label: 'Báo cáo', icon: ChartColumn, emoji: '📊' },
  { href: '/settings', label: 'Cài đặt', icon: Settings, emoji: '⚙️' },
];

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ isOpenMobile, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const SidebarContent = (
    <div className="flex h-full flex-col justify-between p-4 sm:p-5 select-none">
      <div>
        {/* Header Logo Cute */}
        <div className="flex items-center justify-between pb-5 pt-1 px-1">
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-400 via-purple-400 to-indigo-400 text-white shadow-md shadow-pink-400/30 ring-4 ring-pink-100 dark:ring-white/10 transition-transform hover:scale-105 hover:rotate-3">
              <House className="h-6 w-6" />
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-300 animate-bounce" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Gia đình nhỏ
                </span>
                <span className="text-xs">✨</span>
              </div>
              <span className="text-[10px] font-bold text-pink-500/80 dark:text-purple-300 tracking-wider">
                Home Sweet Home 💖
              </span>
            </div>
          </div>

          {/* Close button Mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="grid h-8 w-8 place-items-center rounded-xl bg-pink-50 text-pink-500 hover:bg-pink-100 lg:hidden dark:bg-white/10 dark:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Menu xinh xắn */}
        <nav className="space-y-1">
          {NAV.map(({ href, label, icon: Icon, emoji }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={onCloseMobile}
                className={`group relative flex items-center justify-between rounded-2xl px-3 py-2.5 text-xs sm:text-sm transition-all duration-200 ${
                  active
                    ? 'font-extrabold text-violet-600 dark:text-violet-400'
                    : 'font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {/* Vạch kẻ chỉ báo siêu thanh lịch sát lề trái khi Active */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-violet-600 dark:bg-violet-400 shadow-sm shadow-violet-500/50" />
                )}

                <div className="flex items-center gap-3 pl-2">
                  {/* Box chứa Icon: Active thì mượt mà, nhẹ nhàng không nền sặc sỡ */}
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-violet-100/60 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400'
                        : 'text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 dark:group-hover:bg-white/5 dark:group-hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="tracking-wide">{label}</span>
                </div>

                {/* Emoji hiển thị nhẹ nhàng khi hover */}
                <span
                  className={`text-xs transition-opacity duration-200 ${
                    active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {emoji}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Nút Toggle Sáng/Tối xịn xò */}
      <div className="pt-3 border-t border-pink-100/60 dark:border-white/10 flex flex-col items-center gap-2">
        <ThemeToggle />
        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
          Made with ❤️ for Family
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Sidebar Desktop */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-pink-100/60 bg-white/80 backdrop-blur-2xl lg:flex dark:border-white/10 dark:bg-slate-900/80">
        {SidebarContent}
      </aside>

      {/* 2. Drawer Mobile */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-purple-950/30 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-2xl shadow-2xl transition-transform dark:bg-slate-900/95">
            {SidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
