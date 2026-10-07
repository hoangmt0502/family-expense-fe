'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { Loader2 } from 'lucide-react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const checkFamilyStatus = async () => {
      try {
        // 1. Kiểm tra nhanh từ localStorage xem user đã có family chưa
        const localUser = localStorage.getItem('user_info');
        if (localUser) {
          const parsedUser = JSON.parse(localUser);
          if (parsedUser.hasFamily === false) {
            router.replace('/onboarding');
            return;
          }
        }

        // 2. Gọi API lấy thông tin hiện tại (ví dụ API trả về user kèm thông tin family)
        const res = await api.get('/families/current');
        
        if (res.data) {
          // Lấy user cũ trong localStorage ra, cập nhật thêm family vào rồi lưu lại
          const currentUser = localUser ? JSON.parse(localUser) : {};
          const updatedUser = {
            ...currentUser,
            family: res.data, // Gắn family vào trong user_info
            hasFamily: true,
          };
          localStorage.setItem('user_info', JSON.stringify(updatedUser));
        }

        setLoading(false);
      } catch (err: any) {
        if (err.response?.status === 404) {
          router.replace('/onboarding');
        } else {
          setLoading(false);
        }
      }
    };

    checkFamilyStatus();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-slate-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <p className="text-xs font-semibold text-slate-400">
          Đang kết nối tổ ấm...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-violet-50 via-white to-sky-50 text-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/60 dark:text-slate-100">
      {/* Sidebar hỗ trợ mở Drawer trên Mobile */}
      <Sidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="min-w-0 flex-1 overflow-x-hidden px-4 pb-6 lg:px-6">
        <Topbar onToggleSidebar={() => setIsMobileSidebarOpen(true)} />
        {children}
      </main>
    </div>
  );
}
