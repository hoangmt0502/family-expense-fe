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
  User,
  ArrowRight,
  Loader2,
  ShieldCheck,
  House,
  Sparkles,
  Heart,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Gọi API POST /auth/register
      const res = await api.post('/auth/register', {
        fullName,
        email,
        password,
      });

      const { accessToken, user } = res.data;

      // 2. Lưu accessToken vào Cookie trong 365 ngày
      if (accessToken) {
        Cookies.set('accessToken', accessToken, { expires: 365 });
      }

      // 3. Lưu thông tin user vào localStorage để Topbar & các trang khác sử dụng
      if (user) {
        localStorage.setItem('user_info', JSON.stringify(user));
      }

      // 4. Tài khoản mới tạo chưa thuộc Family nào -> Chuyển sang /onboarding để tạo/nhập mã gia đình
      router.push('/onboarding');
      router.refresh();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header thương hiệu "Gia đình nhỏ" */}
      <div className="text-center mb-6">
        <div className="relative inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 text-white mb-3 shadow-lg shadow-purple-500/30 ring-4 ring-white/10 transform hover:scale-105 transition-transform">
          <House className="w-7 h-7 sm:w-8 sm:h-8" />
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-300 animate-bounce" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
          Tạo tài khoản ✨
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm font-medium mt-1.5 flex items-center justify-center gap-1">
          <span>Bắt đầu hành trình cùng tổ ấm</span>
          <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
        </p>
      </div>

      {/* Alert hiển thị lỗi */}
      {error && (
        <div className="mb-5 p-3.5 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-200 text-xs sm:text-sm font-medium">
          {error}
        </div>
      )}

      {/* Form Đăng ký */}
      <form onSubmit={handleRegister} className="space-y-4">
        {/* Input Họ và Tên */}
        <div>
          <label className="block text-xs font-medium text-slate-200 mb-1.5 ml-1">
            Họ và tên
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập họ và tên..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-white/15 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-400 transition-all"
            />
          </div>
        </div>

        {/* Input Email */}
        <div>
          <label className="block text-xs font-medium text-slate-200 mb-1.5 ml-1">
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

        {/* Input Password */}
        <div>
          <label className="block text-xs font-medium text-slate-200 mb-1.5 ml-1">
            Mật khẩu
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Từ 6 ký tự trở lên..."
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

        {/* Nút Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed group mt-3 active:scale-[0.99]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang khởi tạo tài khoản...</span>
            </>
          ) : (
            <>
              <span>Đăng ký tài khoản</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>

        {/* Chuyển tới Đăng nhập */}
        <div className="text-center pt-2 text-xs text-slate-300">
          <span>Đã có tài khoản? </span>
          <Link
            href="/login"
            className="font-bold text-purple-300 hover:text-purple-200 underline underline-offset-4 transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </form>

      {/* Footer bảo mật */}
      <div className="mt-6 text-center flex items-center justify-center space-x-1.5 text-xs text-slate-300">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Bảo mật thông tin & Mã hóa dữ liệu tuyệt đối</span>
      </div>
    </>
  );
}
