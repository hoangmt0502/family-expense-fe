'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ShieldCheck,
  House,
  Sparkles,
  Heart,
} from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      const { accessToken, user } = res.data;

      Cookies.set('accessToken', accessToken, { expires: 365 });

      if (user) {
        localStorage.setItem('user_info', JSON.stringify(user));
      }

      if (user?.hasFamily) {
        router.push('/');
      } else {
        router.push('/onboarding');
      }
      router.refresh();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu!'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <>
      {/* Header thương hiệu "Gia đình nhỏ" */}
      <div className="text-center mb-6">
        <div className="relative inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 text-white mb-3 shadow-lg shadow-purple-500/30 ring-4 ring-white/10 transform hover:scale-105 transition-transform p-2.5">
          {/* Thay thế House bằng Logo của bạn */}
          <Image 
            src="/images/logo.png" 
            alt="Logo gia đình" 
            fill 
            className="object-contain p-2" 
          />
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-300 animate-bounce z-10" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
          Gia đình nhỏ ✨
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm font-medium mt-1.5 flex items-center justify-center gap-1">
          <span>Chào mừng bạn về nhà</span>
          <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-200 text-xs sm:text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-200 mb-1.5">
            Địa chỉ Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-white/15 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-400 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-200 mb-1.5">
            Mật khẩu
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu của bạn..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-950/50 border border-white/15 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-400 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-purple-600 focus:ring-purple-500/40"
            />
            <span className="ml-2">Ghi nhớ đăng nhập</span>
          </label>
          <a
            href="#"
            className="text-purple-300 hover:text-purple-200 transition-colors"
          >
            Quên mật khẩu?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed group mt-3 active:scale-[0.99]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang kết nối...</span>
            </>
          ) : (
            <>
              <span>Đăng nhập hệ thống</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>

        <div className="text-center pt-2 text-xs text-slate-300">
          <span>Chưa có tài khoản? </span>
          <Link
            href="/register"
            className="font-bold text-purple-300 hover:text-purple-200 underline underline-offset-4 transition-colors"
          >
            Đăng ký ngay
          </Link>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-slate-900/90 text-slate-400 rounded-full">
              hoặc
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-2.5 px-4 bg-white text-slate-800 hover:bg-slate-100 font-medium text-sm rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-md active:scale-[0.99]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Đăng nhập với Google</span>
        </button>
      </form>

      <div className="mt-6 text-center flex items-center justify-center space-x-1.5 text-xs text-slate-300">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Kết nối an toàn & bảo mật mã hóa JWT</span>
      </div>
    </>
  );
}
