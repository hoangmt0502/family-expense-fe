'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Sparkles } from 'lucide-react';
import Cookies from 'js-cookie';
import Image from 'next/image';

function AuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userData = searchParams.get('user');

    if (token && userData) {
      try {
        const decodedUser = decodeURIComponent(userData);

        Cookies.set('accessToken', token, { expires: 7 });
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user_info', decodedUser);

        setTimeout(() => {
          window.location.href = '/';
        }, 500); 
      } catch (err) {
        console.error('Lỗi khi lưu thông tin đăng nhập Google:', err);
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center animate-fadeIn">
      {/* Logo có hiệu ứng */}
      <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30 p-2.5 animate-pulse mb-6 ring-4 ring-white/10">
        <Image 
          src="/images/logo.png" 
          alt="Logo" 
          fill 
          className="object-contain p-2" 
        />
        <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-300 animate-bounce" />
      </div>
      
      <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
        Đăng nhập thành công!
      </h3>
      <p className="text-xs sm:text-sm font-medium text-slate-300 mb-8 max-w-[260px] mx-auto">
        Vui lòng đợi trong giây lát, chúng tôi đang chuẩn bị không gian cho gia đình bạn...
      </p>

      <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
    </div>
  );
}

export default function AuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      }
    >
      <AuthSuccessContent />
    </Suspense>
  );
}
