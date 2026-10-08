'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import api from '@/lib/api';
import HeroBanner from '@/components/ui/HeroBanner';
import {
  User,
  Mail,
  Lock,
  Camera,
  Upload,
  Loader2,
  ShieldCheck,
  Home,
  Save,
  Download,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // User Profile Form
  const [profile, setProfile] = useState({
    id: '',
    fullName: '',
    email: '',
    avatar: '',
    role: 'MEMBER',
  });

  // Family Info Form
  const [family, setFamily] = useState({
    id: '',
    name: '',
    inviteCode: '',
  });

  // Change Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Load User & Family Data
  useEffect(() => {
    const savedUser = localStorage.getItem('user_info');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setProfile({
          id: parsed.id || '',
          fullName: parsed.fullName || '',
          email: parsed.email || '',
          avatar: parsed.avatar || '',
          role: parsed.role || 'MEMBER',
        });
        if (parsed.family) {
          setFamily({
            id: parsed.family.id || '',
            name: parsed.family.name || '',
            inviteCode: parsed.family.inviteCode || '',
          });
        }
      } catch (e) {
        console.error('Lỗi đọc user_info từ localStorage:', e);
      }
    }
    setLoading(false);
  }, []);

  // Upload Avatar trực tiếp
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const bodyFormData = new FormData();
    bodyFormData.append('file', file);

    setUploadingAvatar(true);
    try {
      const res = await api.post('/upload/image', bodyFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile((prev) => ({ ...prev, avatar: res.data.url }));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Tải ảnh đại diện thất bại');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Cập nhật Thông tin cá nhân
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.fullName.trim()) {
      alert('Vui lòng nhập họ và tên');
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await api.patch('/users/profile', {
        fullName: profile.fullName.trim(),
        avatar: profile.avatar.trim() || undefined,
      });

      // Cập nhật lại localStorage
      const localUser = localStorage.getItem('user_info');
      const currentUser = localUser ? JSON.parse(localUser) : {};
      const updatedUser = {
        ...currentUser,
        fullName: res.data.fullName || profile.fullName,
        avatar: res.data.avatar || profile.avatar,
      };
      localStorage.setItem('user_info', JSON.stringify(updatedUser));

      alert('Cập nhật thông tin cá nhân thành công!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Đổi mật khẩu
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      alert('Vui lòng nhập mật khẩu hiện tại');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      alert('Đổi mật khẩu thành công!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Xuất file dữ liệu CSV
  const handleExportData = async () => {
    setExporting(true);
    try {
      const res = await api.get('/transactions/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Bao_Cao_Thu_Chi_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      alert('Xuất dữ liệu thất bại hoặc tính năng chưa được hỗ trợ');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 pb-16 select-none">
      {/* 1. HERO BANNER CHUẨN ĐỒNG BỘ */}
      <HeroBanner
        badgeText="✨ Cá nhân hóa trải nghiệm"
        greeting="Cài đặt hệ thống"
        title="Tài khoản & Thiết lập"
        emoji="⚙️"
        description="Quản lý hồ sơ cá nhân, xuất dữ liệu báo cáo và bảo mật tài khoản gia đình 💜"
        bannerDay="/images/banner_setting.png"
        bannerNight="/images/banner_setting_night.png"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* CỘT TRÁI (2/3): THÔNG TIN CÁ NHÂN & XUẤT DỮ LIỆU */}
        <div className="lg:col-span-2 space-y-5">
          {/* KHỐI 1: THÔNG TIN CÁ NHÂN */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Thông tin cá nhân
                </h3>
                <p className="text-xs font-medium text-slate-400">
                  Cập nhật ảnh đại diện và họ tên hiển thị trong tổ ấm
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              {/* Ảnh Đại Diện */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-3xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white font-black text-2xl grid place-items-center shadow-md border-2 border-white dark:border-slate-800">
                  {profile.avatar ? (
                    <Image
                      src={profile.avatar}
                      alt={profile.fullName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span>{profile.fullName.charAt(0).toUpperCase() || 'U'}</span>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <div className="flex items-center gap-2">
                    <label className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 cursor-pointer rounded-2xl border border-dashed border-purple-300 bg-purple-50/50 hover:bg-purple-100/50 px-4 py-2.5 text-xs font-bold text-purple-600 transition-all dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300">
                      <Upload className="h-4 w-4" />
                      <span>Tải ảnh mới</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={uploadingAvatar}
                      />
                    </label>

                    <label className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 cursor-pointer rounded-2xl border border-dashed border-pink-300 bg-pink-50/50 hover:bg-pink-100/50 px-4 py-2.5 text-xs font-bold text-pink-600 transition-all dark:border-pink-500/30 dark:bg-pink-500/10 dark:text-pink-300">
                      <Camera className="h-4 w-4" />
                      <span>Chụp ảnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={uploadingAvatar}
                      />
                    </label>
                  </div>
                  <input
                    type="url"
                    placeholder="Hoặc dán link URL ảnh..."
                    value={profile.avatar}
                    onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
                  />
                </div>
              </div>

              {/* Input Họ Tên & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Địa chỉ Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      disabled
                      value={profile.email}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-100/80 px-4 py-3 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400 cursor-not-allowed pr-10"
                    />
                    <Mail className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitLoading || uploadingAvatar}
                  className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 text-xs font-bold shadow-lg shadow-purple-600/25 transition-all active:scale-95"
                >
                  {submitLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>Lưu thông tin</span>
                </button>
              </div>
            </form>
          </div>

          {/* KHỐI 2: XUẤT DỮ LIỆU TÀI CHÍNH */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Dữ liệu & Báo cáo
                </h3>
                <p className="text-xs font-medium text-slate-400">
                  Xuất toàn bộ lịch sử thu chi gia đình ra tập tin Excel / CSV
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Báo cáo sẵn sàng</span>
                </p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Định dạng CSV chuẩn mã hóa UTF-8 (dễ dàng mở bằng Microsoft Excel)
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportData}
                disabled={exporting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all active:scale-95 shrink-0"
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span>Tải dữ liệu (.CSV)</span>
              </button>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (1/3): BẢO MẬT & THÔNG TIN TỔ ẤM */}
        <div className="space-y-5">
          {/* KHỐI 3: THÔNG TIN TỔ ẤM */}
          {family.name && (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400">
                  <Home className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Tổ ấm hiện tại
                  </h3>
                  <p className="text-xs font-medium text-slate-400">Gia đình bạn đang gắn kết</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Tên tổ ấm
                  </span>
                  <p className="text-base font-extrabold text-purple-700 dark:text-purple-300 mt-0.5">
                    {family.name}
                  </p>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                  <span className="text-xs font-bold text-slate-500">Mã mời</span>
                  <span className="font-mono font-black text-sm text-purple-600 dark:text-purple-400">
                    {family.inviteCode}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* KHỐI 4: ĐỔI MẬT KHẨU */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Đổi mật khẩu
                </h3>
                <p className="text-xs font-medium text-slate-400">Tăng cường bảo mật tài khoản</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition-all active:scale-95 mt-2"
              >
                {passwordLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Cập nhật mật khẩu</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
