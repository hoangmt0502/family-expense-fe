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
        // Kiểm tra xem user đã tham gia/tạo Family nào chưa
        await api.get('/families/current');
        setLoading(false);
      } catch (err: any) {
        // Nếu API trả về 404 (chưa có Family) -> Chuyển hướng sang trang Onboarding
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
