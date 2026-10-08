'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import HeroBanner from '@/components/ui/HeroBanner';
import { vnd } from '@/lib/format';
import {
  Plus,
  Loader2,
  X,
  AlertTriangle,
  Target,
  Pencil,
  Trash2,
  PlusCircle,
  MinusCircle,
  History,
  Calendar,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-full items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
    </div>
  ),
});

export interface Goal {
  id: string;
  title: string;
  emoji: string;
  targetAmount: number;
  currentAmount: number;
  barColor: string;
  deadline?: string;
  familyId?: string;
  createdAt: string;
}

export interface GoalLog {
  id: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAW';
  note?: string;
  createdAt: string;
  user?: { fullName: string; avatar?: string };
}

const BAR_COLORS = [
  { label: 'Tím Indigo', value: 'from-purple-600 to-indigo-400' },
  { label: 'Xanh Ngọc', value: 'from-teal-400 to-emerald-400' },
  { label: 'Cam Hồng', value: 'from-amber-400 to-rose-400' },
  { label: 'Xanh Dương', value: 'from-blue-500 to-sky-400' },
  { label: 'Hồng Đào', value: 'from-pink-500 to-rose-400' },
];

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Thêm/Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    emoji: '🎯',
    targetAmount: '',
    barColor: 'from-purple-600 to-indigo-400',
    deadline: '',
  });

  // Modal chọn Emoji
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Modal Nạp / Rút Tiền
  const [actionGoal, setActionGoal] = useState<{ goal: Goal; mode: 'DEPOSIT' | 'WITHDRAW' } | null>(null);
  const [actionAmount, setActionAmount] = useState('');
  const [actionNote, setActionNote] = useState('');

  // Modal Lịch sử
  const [historyGoal, setHistoryGoal] = useState<Goal | null>(null);
  const [logs, setLogs] = useState<GoalLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Modal Xóa Mục tiêu
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; goalId: string; goalTitle: string }>({
    isOpen: false,
    goalId: '',
    goalTitle: '',
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals');
      setGoals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchLogs = async (goalId: string) => {
    setLogsLoading(true);
    try {
      const res = await api.get(`/goals/${goalId}/logs`);
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingGoal(null);
    setFormData({
      title: '',
      emoji: '🎯',
      targetAmount: '',
      barColor: 'from-purple-600 to-indigo-400',
      deadline: '',
    });
    setShowEmojiPicker(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      emoji: goal.emoji || '🎯',
      targetAmount: goal.targetAmount.toString(),
      barColor: goal.barColor || 'from-purple-600 to-indigo-400',
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().slice(0, 10) : '',
    });
    setShowEmojiPicker(false);
    setIsModalOpen(true);
  };

  const handleSubmitGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.targetAmount || Number(formData.targetAmount) <= 0) return;

    setSubmitLoading(true);
    const payload = {
      title: formData.title.trim(),
      emoji: formData.emoji,
      targetAmount: Number(formData.targetAmount),
      barColor: formData.barColor,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
    };

    try {
      if (editingGoal) {
        await api.patch(`/goals/${editingGoal.id}`, payload);
      } else {
        await api.post('/goals', payload);
      }
      setIsModalOpen(false);
      fetchGoals();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionGoal || !actionAmount || Number(actionAmount) <= 0) return;

    setSubmitLoading(true);
    const endpoint = actionGoal.mode === 'DEPOSIT' ? 'deposit' : 'withdraw';
    try {
      await api.post(`/goals/${actionGoal.goal.id}/${endpoint}`, {
        amount: Number(actionAmount),
        note: actionNote.trim() || undefined,
      });
      setActionGoal(null);
      setActionAmount('');
      setActionNote('');
      fetchGoals();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (!deleteModal.goalId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/goals/${deleteModal.goalId}`);
      setDeleteModal({ isOpen: false, goalId: '', goalTitle: '' });
      fetchGoals();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể xóa mục tiêu này');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!confirm('Bạn có chắc muốn xóa lịch sử giao dịch này? Số tiền sẽ tự động được hạch toán lại.')) return;
    try {
      await api.delete(`/goals/logs/${logId}`);
      if (historyGoal) fetchLogs(historyGoal.id);
      fetchGoals();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể xóa');
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
      <HeroBanner
        badgeText="✨ Xây dựng tương lai"
        greeting="Tích lũy tài chính"
        title="Mục tiêu tài chính"
        emoji="🎯"
        description="Đặt mục tiêu, nạp/rút tiền linh hoạt và theo dõi chi tiết lịch sử tích lũy 💜"
        bannerDay="/images/banner_goals.png"
        bannerNight="/images/banner_goals_night.png"
        actionSlot={
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 hover:opacity-95 text-white px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-extrabold shadow-lg shadow-purple-500/25 transition-all active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Thêm mục tiêu</span>
          </button>
        }
      />

      {/* GRID MỤC TIÊU */}
      {goals.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-slate-50/50 dark:bg-slate-900/50">
          <Target className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Chưa có mục tiêu tài chính nào
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Bấm nút &quot;Thêm mục tiêu&quot; ở trên để bắt đầu tích lũy khoản tiền đầu tiên
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 pt-3 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const pct = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
            return (
              <div key={goal.id} className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 transition-all hover:-translate-y-0.5 hover:border-purple-300/70 hover:shadow-purple-500/10 dark:hover:border-purple-500/40">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-3xl dark:bg-slate-800 shadow-xs">
                      {goal.emoji}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setHistoryGoal(goal);
                          fetchLogs(goal.id);
                        }}
                        title="Xem lịch sử"
                        className="p-2 rounded-xl text-slate-400 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-500/10 transition-colors"
                      >
                        <History className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate" title={goal.title}>
                      {goal.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-1">
                      {vnd(goal.currentAmount)} / <span className="text-slate-800 dark:text-slate-200">{vnd(goal.targetAmount)}</span>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className={`h-full rounded-full bg-gradient-to-r ${goal.barColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>Tiến độ: {pct}%</span>
                      {goal.deadline && <span>Hạn: {new Date(goal.deadline).toLocaleDateString('vi-VN')}</span>}
                    </div>
                  </div>
                </div>

                {/* Nút Nạp & Rút tiền */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setActionGoal({ goal, mode: 'DEPOSIT' })}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 py-2 text-xs font-bold text-purple-600 dark:text-purple-300 transition-colors"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Nạp tiền</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionGoal({ goal, mode: 'WITHDRAW' })}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 transition-colors"
                  >
                    <MinusCircle className="h-3.5 w-3.5" />
                    <span>Rút tiền</span>
                  </button>
                </div>

                {/* Nút Sửa/Xóa vắt viền */}
                <div className="absolute -top-3 right-3 flex items-center gap-0.5 rounded-xl border border-slate-200 bg-white p-0.5 opacity-0 shadow-md transition-opacity group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100 dark:border-slate-700 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(goal)}
                    title="Chỉnh sửa"
                    className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-500/10 dark:hover:text-purple-400 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteModal({ isOpen: true, goalId: goal.id, goalTitle: goal.title })}
                    title="Xóa"
                    className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL THÊM / SỬA MỤC TIÊU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-5">
              {editingGoal ? 'Chỉnh sửa mục tiêu' : 'Thêm mục tiêu mới'}
            </h3>

            <form onSubmit={handleSubmitGoal} className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Emoji
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(true)}
                    className="w-full h-11 grid place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-2xl dark:border-slate-800 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {formData.emoji}
                  </button>
                </div>

                <div className="col-span-3">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Tên mục tiêu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Mua xe, Du lịch..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white dark:focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Số tiền mục tiêu (VNĐ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  placeholder="50000000"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white dark:focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Hạn hoàn thành (Không bắt buộc)
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white dark:focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Màu tiến độ
                </label>
                <div className="flex items-center gap-2.5 overflow-x-auto p-1">
                  {BAR_COLORS.map((col) => {
                    const isSelected = formData.barColor === col.value;
                    return (
                      <button
                        key={col.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, barColor: col.value })}
                        className={`h-9 w-12 rounded-xl bg-gradient-to-r ${col.value} shrink-0 grid place-items-center transition-all ${
                          isSelected
                            ? 'border-2 border-purple-600 dark:border-purple-400 scale-105 shadow-md'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {isSelected && <Check className="h-4 w-4 text-white drop-shadow-sm" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-bold text-xs transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-1/2 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>{editingGoal ? 'Cập nhật' : 'Tạo mới'}</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL CHỌN EMOJI */}
      {showEmojiPicker && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl relative flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Chọn Biểu tượng Emoji</span>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="w-full flex justify-center overflow-hidden rounded-2xl">
              <EmojiPicker
                width="100%"
                height={320}
                searchPlaceHolder="Tìm emoji..."
                previewConfig={{ showPreview: false }}
                onEmojiClick={(emojiData) => {
                  setFormData({ ...formData, emoji: emojiData.emoji });
                  setShowEmojiPicker(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL NẠP / RÚT TIỀN */}
      {actionGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 relative">
            <button
              type="button"
              onClick={() => setActionGoal(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white pr-6">
              {actionGoal.mode === 'DEPOSIT' ? '➕ Nạp tiền vào quỹ' : '➖ Rút tiền khỏi quỹ'}
            </h3>

            <form onSubmit={handleActionSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Số tiền (VNĐ)</label>
                <input
                  type="number"
                  required
                  min="1000"
                  placeholder="500000"
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-black text-purple-600 dark:border-slate-800 dark:bg-slate-800 dark:text-purple-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ghi chú (Tùy chọn)</label>
                <input
                  type="text"
                  placeholder="Lý do nạp/rút..."
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full p-2.5 text-xs font-semibold rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionGoal(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 transition-colors text-white text-xs font-bold flex items-center justify-center"
                >
                  {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Xác nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LỊCH SỬ NẠP / RÚT */}
      {historyGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 truncate pr-4">
                <History className="h-4 w-4 text-purple-600 shrink-0" />
                Lịch sử: {historyGoal.emoji} {historyGoal.title}
              </h3>
              <button onClick={() => setHistoryGoal(null)} className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0">
                <X className="h-4 w-4" />
              </button>
            </div>

            {logsLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
              </div>
            ) : logs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Chưa có biến động số dư nào</p>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                {logs.map((log) => {
                  const isDeposit = log.type === 'DEPOSIT';
                  return (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-2.5">
                        <div className={`grid h-8 w-8 place-items-center rounded-xl text-white ${isDeposit ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                          {isDeposit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {isDeposit ? '+' : '-'}{vnd(log.amount)}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {log.note || (isDeposit ? 'Nạp tiền' : 'Rút tiền')} • {new Date(log.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteLog(log.id)}
                        title="Xóa dòng lịch sử này"
                        className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setDeleteModal({ isOpen: false, goalId: '', goalTitle: '' })}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 mb-4 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2 mb-6">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Xóa mục tiêu này?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Bạn có chắc chắn muốn xóa mục tiêu <span className="font-bold text-slate-900 dark:text-white">&quot;{deleteModal.goalTitle}&quot;</span>? Dữ liệu khoản tích lũy này sẽ bị xóa vĩnh viễn.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeleteModal({ isOpen: false, goalId: '', goalTitle: '' })}
                className="w-1/2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteGoal}
                className="w-1/2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <span>Xóa ngay</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
