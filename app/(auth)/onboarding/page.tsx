'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import {
  House,
  PlusCircle,
  UserPlus,
  ArrowRight,
  Loader2,
  Sparkles,
  ShieldCheck,
  LogOut,
  User,
} from 'lucide-react';

interface UserInfo {
  id?: string;
  fullName?: string;
  name?: string;
  email?: string;
  avatar?: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'SELECT' | 'CREATE' | 'JOIN'>('SELECT');
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user_info');
    if (savedUser) {
      try {
        setUserInfo(JSON.parse(savedUser));
      } catch (e) {
        console.error('Lỗi đọc user info:', e);
      }
    }
  }, []);

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/families', { name: familyName });
      if (res.data) {
        if (userInfo) {
          localStorage.setItem(
            'user_info',
            JSON.stringify({ ...userInfo, hasFamily: true })
          );
        }
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Tạo gia đình thất bại, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/families/join', {
        inviteCode: inviteCode.trim().toUpperCase(),
      });
      if (res.data) {
        if (userInfo) {
          localStorage.setItem(
            'user_info',
            JSON.stringify({ ...userInfo, hasFamily: true })
          );
        }
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã mời không chính xác hoặc đã hết hạn!');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove('accessToken');
    localStorage.removeItem('user_info');
    router.push('/login');
    router.refresh();
  };

  const displayName = userInfo?.fullName || userInfo?.name || 'bạn';

  return (
    <>
      {/* Header gọn gàng & Lời chào thân thiện */}
      <div className="text-center mb-7">
        <div className="relative inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 text-white mb-3 shadow-lg shadow-purple-500/30 ring-4 ring-white/10">
          <House className="w-7 h-7 sm:w-8 sm:h-8" />
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-300 animate-bounce" />
        </div>

        {/* Tên User hòa quyện thẳng vào Lời Chào */}
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
          Xin chào, {displayName} 👋
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm font-medium mt-1.5">
          Chọn phương thức để bắt đầu không gian tài chính chung
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3.5 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-200 text-xs sm:text-sm font-medium text-center">
          {error}
        </div>
      )}

      {/* MODE SELECT */}
      {mode === 'SELECT' && (
        <div className="space-y-3.5">
          <button
            type="button"
            onClick={() => setMode('CREATE')}
            className="w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 text-left transition-all duration-200 group flex items-center justify-between shadow-sm hover:shadow-purple-500/10 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white shadow-md">
                <PlusCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  Tạo tổ ấm mới
                </h3>
                <p className="text-xs text-slate-400">
                  Bắt đầu quản lý tài chính cho gia đình bạn
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 group-hover:text-white transition-all shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => setMode('JOIN')}
            className="w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/40 text-left transition-all duration-200 group flex items-center justify-between shadow-sm hover:shadow-pink-500/10 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-pink-500 to-purple-500 text-white shadow-md">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
                  Tham gia bằng mã mời
                </h3>
                <p className="text-xs text-slate-400">
                  Nhập mã được chia sẻ từ chủ hộ
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 group-hover:text-white transition-all shrink-0" />
          </button>
        </div>
      )}

      {/* MODE CREATE */}
      {mode === 'CREATE' && (
        <form onSubmit={handleCreateFamily} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5 ml-1">
              Tên gia đình / Tổ ấm
            </label>
            <input
              type="text"
              required
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="Ví dụ: Gia đình Bố Sóc, Tổ ấm Nhỏ..."
              className="w-full px-4 py-3 bg-slate-950/50 border border-white/15 rounded-2xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-400 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setMode('SELECT')}
              className="w-1/3 py-3 px-4 bg-white/10 hover:bg-white/20 text-slate-300 font-semibold text-xs sm:text-sm rounded-xl transition-all"
            >
              Quay lại
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Tạo ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* MODE JOIN */}
      {mode === 'JOIN' && (
        <form onSubmit={handleJoinFamily} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5 ml-1">
              Nhập mã mời (6 ký tự)
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="VD: A8F3B9"
              className="w-full px-4 py-3 text-center tracking-widest font-mono text-lg font-bold bg-slate-950/50 border border-white/15 rounded-2xl text-amber-300 uppercase placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/60 focus:border-pink-400 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setMode('SELECT')}
              className="w-1/3 py-3 px-4 bg-white/10 hover:bg-white/20 text-slate-300 font-semibold text-xs sm:text-sm rounded-xl transition-all"
            >
              Quay lại
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-pink-500/30 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Tham gia ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Footer Bảo mật & Nút Đổi Tài Khoản */}
      <div className="mt-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Bảo mật dữ liệu tuyệt đối</span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-rose-400 transition-colors font-medium"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất ({userInfo?.email || 'Đổi tài khoản'})</span>
        </button>
      </div>
    </>
  );
}
