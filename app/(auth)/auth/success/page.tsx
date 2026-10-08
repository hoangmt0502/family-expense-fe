'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Cookies from 'js-cookie'; // 1. Import js-cookie

function AuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userData = searchParams.get('user');

    if (token && userData) {
      try {
        const decodedUser = decodeURIComponent(userData);

        // 2. Lưu vào Cookie (Tên key là 'accessToken' cho khớp với api.ts)
        Cookies.set('accessToken', token, { expires: 7 }); // Hạn 7 ngày

        // 3. Đồng thời lưu vào localStorage (Cũng đổi sang 'accessToken' và 'user_info')
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user_info', decodedUser);

        // 4. Chuyển hướng về trang chủ
        window.location.href = '/';
      } catch (err) {
        console.error('Lỗi khi lưu thông tin đăng nhập Google:', err);
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [searchParams, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
          Đang hoàn tất đăng nhập Google...
        </p>
      </div>
    </div>
  );
}

export default function AuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      }
    >
      <AuthSuccessContent />
    </Suspense>
  );
}
