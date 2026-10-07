'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  House,
  ClipboardList,
  CalendarCheck,
  Settings,
  X,
  Users,
  FolderTree,
  ChevronDown,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface NavSubItem {
  href: string;
  label: string;
  icon: any;
  emoji: string;
}

interface NavGroupItem {
  label: string;
  icon: any;
  children: NavSubItem[];
}

interface NavSingleItem {
  href: string;
  label: string;
  icon: any;
  children?: undefined;
}

type NavItem = NavSingleItem | NavGroupItem;

// NAV tinh gọn chuẩn theo các Module Backend hiện có
const NAV: NavItem[] = [
  { href: '/', label: 'Tổng quan', icon: House },
  { href: '/transactions', label: 'Thu chi', icon: ClipboardList },
  { href: '/budgets', label: 'Ngân sách', icon: CalendarCheck },
  { href: '/family', label: 'Thành viên', icon: Users },
  { href: '/categories', label: 'Danh mục thu chi', icon: FolderTree },
  { href: '/settings', label: 'Cài đặt', icon: Settings },
];

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ isOpenMobile, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  // Trạng thái mở/đóng menu con
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Tên gia đình lấy từ thông tin người dùng
  const [familyName, setFamilyName] = useState<string>('Gia đình nhỏ');

  // Lấy tên gia đình từ localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user_info');
    console.log(savedUser)
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const name = parsed.family?.name || parsed.familyName;
        if (name) {
          setFamilyName(name);
        }
      } catch (e) {
        console.error('Lỗi đọc user_info:', e);
      }
    }
  }, []);

  // Tự động mở group nếu đang nằm trong đường dẫn con
  useEffect(() => {
    const initialState: Record<string, boolean> = {};
    NAV.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some(
          (sub) => pathname === sub.href || (sub.href !== '/' && pathname.startsWith(sub.href + '/'))
        );
        if (isChildActive) {
          initialState[item.label] = true;
        }
      }
    });
    setOpenGroups((prev) => ({ ...prev, ...initialState }));
  }, [pathname]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const SidebarContent = (
    <div className="flex h-full flex-col justify-between p-4 sm:p-5 select-none overflow-y-auto">
      <div>
        {/* Header Logo 3D Cute & Tên Gia Đình */}
        <div className="flex items-center justify-between pb-5 pt-1 px-1">
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo 3D 💜 */}
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 dark:from-slate-800 dark:to-purple-950 p-1 shadow-sm transition-transform hover:scale-105">
              <Image
                src="/images/logo.png"
                alt="Logo Gia Đình"
                width={48}
                height={48}
                priority
                className="object-contain"
              />
            </div>

            {/* Tên Gia Đình Map Từ user.family */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-sm sm:text-base font-extrabold tracking-tight bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent truncate">
                  {familyName}
                </span>
                <span className="text-xs shrink-0">✨</span>
              </div>
              <span className="text-[10px] font-bold text-pink-500/80 dark:text-purple-300 tracking-wider truncate">
                Home Sweet Home 💖
              </span>
            </div>
          </div>

          {/* Nút Đóng Sidebar Mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="grid h-8 w-8 place-items-center rounded-xl bg-pink-50 text-pink-500 hover:bg-pink-100 lg:hidden dark:bg-white/10 dark:text-slate-300 shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Menu Điều Hướng */}
        <nav className="space-y-1">
          {NAV.map((item) => {
            // 1. DẠNG MENU CÓ CẤP 2 (CHILDREN)
            if (item.children) {
              const isOpen = !!openGroups[item.label];
              const isGroupActive = item.children.some(
                (sub) => pathname === sub.href || (sub.href !== '/' && pathname.startsWith(sub.href + '/'))
              );

              return (
                <div key={item.label} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.label)}
                    className={`group relative flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-xs sm:text-sm transition-all duration-200 ${
                      isGroupActive
                        ? 'font-extrabold text-violet-600 dark:text-violet-400'
                        : 'font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {isGroupActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-violet-600 dark:bg-violet-400 shadow-sm shadow-violet-500/50" />
                    )}

                    <div className="flex items-center gap-3 pl-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 ${
                          isGroupActive
                            ? 'bg-violet-100/60 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400'
                            : 'text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 dark:group-hover:bg-white/5 dark:group-hover:text-slate-200'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="tracking-wide">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <ChevronDown
                        className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-violet-600 dark:text-violet-400' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Menu Cấp 2 Dropdown */}
                  {isOpen && (
                    <div className="ml-5 space-y-1 border-l-2 border-pink-100 dark:border-white/10 pl-2 pt-0.5 transition-all">
                      {item.children.map(({ href: subHref, label: subLabel, icon: SubIcon, emoji: subEmoji }) => {
                        const subActive = pathname === subHref || (subHref !== '/' && pathname.startsWith(subHref + '/'));

                        return (
                          <Link
                            key={subHref}
                            href={subHref}
                            onClick={onCloseMobile}
                            className={`group relative flex items-center justify-between rounded-2xl px-3 py-2 text-xs transition-all duration-200 ${
                              subActive
                                ? 'font-extrabold text-violet-600 dark:text-violet-400 bg-violet-50/60 dark:bg-violet-500/10'
                                : 'font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 pl-1">
                              <div
                                className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 ${
                                  subActive
                                    ? 'text-violet-600 dark:text-violet-400'
                                    : 'text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 dark:group-hover:bg-white/5 dark:group-hover:text-slate-200'
                                }`}
                              >
                                <SubIcon className="h-3.5 w-3.5" />
                              </div>
                              <span className="tracking-wide">{subLabel}</span>
                            </div>

                            <span
                              className={`text-xs transition-opacity duration-200 ${
                                subActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              {subEmoji}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // 2. DẠNG MENU CẤP 1 ĐƠN
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`group relative flex items-center justify-between rounded-2xl px-3 py-2.5 text-xs sm:text-sm transition-all duration-200 ${
                  active
                    ? 'font-extrabold text-violet-600 dark:text-violet-400'
                    : 'font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-violet-600 dark:bg-violet-400 shadow-sm shadow-violet-500/50" />
                )}

                <div className="flex items-center gap-3 pl-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-violet-100/60 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400'
                        : 'text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 dark:group-hover:bg-white/5 dark:group-hover:text-slate-200'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="tracking-wide">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Toggle Sáng/Tối */}
      <div className="pt-3 border-t border-pink-100/60 dark:border-white/10 flex flex-col items-center gap-2 shrink-0">
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
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-pink-100/60 bg-white/80 backdrop-blur-2xl lg:flex dark:border-white/10 dark:bg-slate-900/80">
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
