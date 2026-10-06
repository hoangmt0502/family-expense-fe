'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
} from 'lucide-react';

interface UserProfile {
  id?: string;
  name?: string;
  fullName?: string;
  role?: string; // Trường role từ DB
  email?: string;
  avatar?: string;
}

interface TopbarProps {
  onToggleSidebar?: () => void;
  user?: UserProfile | null;
}

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Quản trị viên',
  HOST: 'Chủ hộ',
  MEMBER: 'Thành viên',
  VIEWER: 'Người xem',
};

export default function Topbar({ onToggleSidebar, user: userProp }: TopbarProps) {
  const router = useRouter();
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Lấy thông tin user từ Props hoặc localStorage
  useEffect(() => {
    if (userProp) {
      setCurrentUser(userProp);
    } else {
      const savedUser = localStorage.getItem('user_info');
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (e) {
          console.error('Lỗi đọc user info:', e);
        }
      }
    }

    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, [userProp]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    Cookies.remove('accessToken');
    localStorage.removeItem('user_info');
    setIsOpenMenu(false);
    router.push('/login');
    router.refresh();
  };

  // Tên & Role lấy trực tiếp từ DB
  const displayName = currentUser?.fullName || currentUser?.name || 'Gia đình nhỏ';

  // Sử dụng trên Topbar:
  const displayRole = ROLE_LABELS[currentUser?.role || 'MEMBER'];

  return (
    <header className="relative z-20 flex h-[72px] w-full items-center justify-between gap-2.5 px-0">
      {/* Search & Mobile Menu Button */}
      <div className="flex flex-1 items-center gap-2.5 max-w-sm sm:max-w-md">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Mở Menu"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/90 text-slate-700 shadow-sm backdrop-blur hover:bg-white lg:hidden dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          <Menu className="h-5 w-5" />
        </button>

        <label className="flex h-11 w-full items-center gap-2.5 rounded-2xl bg-white/90 px-3.5 shadow-sm backdrop-blur transition-all focus-within:ring-2 focus-within:ring-violet-500/20 dark:bg-slate-900/80">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            placeholder="Tìm kiếm giao dịch, danh mục..."
            className="w-full bg-transparent text-xs sm:text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
          />
          <kbd className="hidden rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 sm:block dark:bg-white/10 dark:text-slate-300">
            ⌘ K
          </kbd>
        </label>
      </div>

      {/* User Dropdown */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setIsOpenMenu(!isOpenMenu)}
          className="flex h-11 items-center gap-2.5 rounded-2xl bg-white/90 p-1.5 pr-3 shadow-sm backdrop-blur transition-all hover:bg-white dark:bg-slate-900/80 dark:hover:bg-slate-900"
        >
          {/* Avatar */}
          <div className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-xl bg-gradient-to-tr from-violet-500 to-pink-500 text-white shadow-sm shrink-0">
            {currentUser?.avatar ? (
              <Image
                src={currentUser.avatar}
                alt={displayName}
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-4 w-4" />
            )}
          </div>

          {/* Tên & Role hiển thị song song */}
          <div className="hidden text-left sm:block">
            <p className="text-xs font-bold leading-tight text-slate-800 dark:text-white max-w-[130px] truncate">
              {displayName}
            </p>
            <p className="text-[10px] font-medium text-purple-600 dark:text-purple-400 truncate capitalize">
              {displayRole}
            </p>
          </div>

          <ChevronDown
            className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
              isOpenMenu ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Popup Menu */}
        {isOpenMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpenMenu(false)}
            />

            <div className="absolute right-0 z-20 mt-2 w-52 rounded-2xl border border-slate-100 bg-white/95 p-1.5 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/95">
              <div className="border-b border-slate-100 px-3 py-2 sm:hidden dark:border-white/10">
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                  {displayName}
                </p>
                <p className="text-[10px] font-medium text-purple-600 dark:text-purple-400 truncate capitalize">
                  {displayRole}
                </p>
              </div>

              <div className="space-y-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpenMenu(false);
                    router.push('/settings');
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  <User className="h-4 w-4" />
                  <span>Hồ sơ cá nhân</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpenMenu(false);
                    router.push('/settings');
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  <Settings className="h-4 w-4" />
                  <span>Cài đặt hệ thống</span>
                </button>

                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    {isDarkMode ? (
                      <Moon className="h-4 w-4 text-violet-400" />
                    ) : (
                      <Sun className="h-4 w-4 text-amber-500" />
                    )}
                    <span>Giao diện</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {isDarkMode ? 'Tối' : 'Sáng'}
                  </span>
                </button>
              </div>

              <div className="my-1 border-t border-slate-100 dark:border-white/10" />

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
              >
                <LogOut className="h-4 w-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
