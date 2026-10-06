'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import api from '@/lib/api';
import {
  Users,
  Copy,
  Check,
  User,
  Crown,
  UserCheck,
  Eye,
  Trash2,
  Loader2,
  Sparkles,
  LogOut,
  AlertTriangle,
  X,
} from 'lucide-react';

interface Member {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  role: 'HOST' | 'MEMBER' | 'VIEWER' | 'ADMIN';
  createdAt: string;
}

interface FamilyData {
  id: string;
  name: string;
  inviteCode: string;
  members: Member[];
}

export default function FamilyManagementPage() {
  const [family, setFamily] = useState<FamilyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUserRole, setCurrentUserRole] = useState<string>('MEMBER');

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    isDestructive?: boolean;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Xác nhận',
    isDestructive: false,
    onConfirm: async () => {},
  });

  const [actionLoading, setActionLoading] = useState(false);

  const fetchFamilyMembers = async () => {
    try {
      const res = await api.get('/families/members');
      setFamily(res.data);
    } catch (err) {
      console.error('Lỗi lấy danh sách thành viên:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user_info');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUserId(parsed.id);
        setCurrentUserRole(parsed.role || 'MEMBER');
      } catch (e) {
        console.error(e);
      }
    }
    fetchFamilyMembers();
  }, []);

  const handleCopyCode = () => {
    if (!family?.inviteCode) return;
    navigator.clipboard.writeText(family.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await api.patch(`/families/members/${memberId}/role`, { role: newRole });
      fetchFamilyMembers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể cập nhật quyền thành viên');
    }
  };

  const openConfirmModal = (memberId: string, isSelf: boolean) => {
    setModalConfig({
      isOpen: true,
      title: isSelf ? 'Rời khỏi gia đình?' : 'Xóa thành viên?',
      message: isSelf
        ? 'Bạn có chắc chắn muốn rời khỏi gia đình này không? Bạn sẽ cần mã mời để tham gia lại.'
        : 'Bạn có chắc chắn muốn mời thành viên này ra khỏi gia đình?',
      confirmText: isSelf ? 'Rời đi' : 'Xóa thành viên',
      isDestructive: true,
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await api.delete(`/families/members/${memberId}`);
          if (isSelf) {
            window.location.href = '/onboarding';
          } else {
            fetchFamilyMembers();
            setModalConfig((prev) => ({ ...prev, isOpen: false }));
          }
        } catch (err: any) {
          alert(err.response?.data?.message || 'Thao tác thất bại');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const isHost = currentUserRole === 'HOST' || currentUserRole === 'ADMIN';

  return (
    <div className="w-full space-y-6 pb-12 pt-2 select-none">
      
      {/* 1. BANNER TRÀN FULL & RESPONSIVE CHUẨN XÁC */}
      <div className="relative w-full overflow-hidden rounded-3xl shadow-md border border-slate-100 dark:border-slate-800 bg-slate-900">
        
        {/* Ảnh Banner nền */}
        <div className="relative w-full h-60 sm:h-64 md:h-80">
          <Image
            src="/images/banner_member.png"
            alt="Banner Tôn Vinh Tổ Ấm"
            fill
            priority
            className="object-cover object-center dark:hidden"
          />
          <Image
            src="/images/banner_member_dark.png"
            alt="Banner Tôn Vinh Tổ Ấm Dark"
            fill
            priority
            className="object-cover object-center hidden dark:block"
          />
          {/* Lớp gradient tinh tế giúp chữ đọc cực rõ mà không làm tối hình ảnh */}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-white/95 via-white/40 to-transparent dark:from-slate-950/95 dark:via-slate-950/40 pointer-events-none" />
        </div>

        {/* Khung thông tin đè lên banner */}
        <div className="absolute inset-0 p-5 sm:p-6 md:p-8 flex flex-col justify-between lg:flex-row lg:items-center lg:justify-between gap-4 z-10">
          
          <div className="space-y-1.5 drop-shadow-sm max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300 shadow-sm border border-white/40 dark:border-slate-700">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Tổ ấm chung</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
              <span className="truncate">{family?.name}</span>
              <span className="text-pink-500 shrink-0">♡</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium line-clamp-2 sm:line-clamp-none">
              Quản lý thành viên, phân quyền và cùng nhau xây dựng những kế hoạch lớn cho tương lai 💜
            </p>
          </div>

          {/* Ô Mã Mời kiểu dáng Smart Pill: Gọn gàng, tinh tế, không bao giờ che mèo */}
          <div className="flex items-center gap-3 rounded-2xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-white/60 dark:border-slate-700 px-4 py-2.5 sm:px-5 sm:py-3 shadow-xl shrink-0 self-start lg:self-auto">
            <div className="space-y-0.5">
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Mã mời
              </p>
              <p className="text-base sm:text-lg font-mono font-black tracking-widest text-purple-600 dark:text-purple-400">
                {family?.inviteCode}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              title="Sao chép mã mời"
              className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-all active:scale-95 shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-300" />
              ) : (
                <Copy className="h-4 w-4 text-white" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* 2. DANH SÁCH THÀNH VIÊN */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        
        {/* Header danh sách & Nút Rời nhóm */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Thành viên gia đình
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Hiện có {family?.members.length} thành viên
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openConfirmModal(currentUserId, true)}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 px-3.5 py-2 text-xs font-bold transition-all active:scale-95 shrink-0"
          >
            <LogOut className="h-4 w-4" />
            <span>Rời gia đình</span>
          </button>
        </div>

        {/* Các dòng Member */}
        <div className="space-y-3">
          {family?.members.map((member) => {
            const isSelf = member.id === currentUserId;

            return (
              <div
                key={member.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50/80 hover:bg-slate-100/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 transition-all border border-slate-100 dark:border-slate-800/60"
              >
                {/* Thông tin cá nhân */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-tr from-violet-500 to-pink-500 text-white font-bold shadow-sm">
                    {member.avatar ? (
                      <Image
                        src={member.avatar}
                        alt={member.fullName}
                        width={44}
                        height={44}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {member.fullName}
                      </p>
                      {isSelf && (
                        <span className="rounded-md bg-purple-100 px-1.5 py-0.5 text-[10px] font-extrabold text-purple-600 dark:bg-purple-500/20 dark:text-purple-300 shrink-0">
                          Bạn
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                      {member.email}
                    </p>
                  </div>
                </div>

                {/* Phân quyền & Thao tác */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-800 shrink-0">
                  {isHost && !isSelf ? (
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <option value="HOST">Chủ hộ 🏠</option>
                      <option value="MEMBER">Thành viên 👨‍👩‍👧</option>
                      <option value="VIEWER">Người xem 👁️</option>
                    </select>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                      {member.role === 'HOST' && <Crown className="h-3.5 w-3.5 text-amber-500" />}
                      {member.role === 'MEMBER' && <UserCheck className="h-3.5 w-3.5 text-purple-600" />}
                      {member.role === 'VIEWER' && <Eye className="h-3.5 w-3.5 text-slate-500" />}
                      <span>
                        {member.role === 'HOST'
                          ? 'Chủ hộ'
                          : member.role === 'MEMBER'
                          ? 'Thành viên'
                          : 'Người xem'}
                      </span>
                    </div>
                  )}

                  {isHost && !isSelf && (
                    <button
                      type="button"
                      onClick={() => openConfirmModal(member.id, false)}
                      title="Xóa thành viên khỏi gia đình"
                      className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* 3. MODAL POPUP XÁC NHẬN */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl relative">
            
            <button
              type="button"
              onClick={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 mb-4 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2 mb-6">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {modalConfig.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                {modalConfig.message}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
                className="w-1/2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={modalConfig.onConfirm}
                className="w-1/2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <span>{modalConfig.confirmText}</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
