'use client';

import Image from 'next/image';
import type { ComponentType, ReactNode } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  CalendarDays,
  CheckCircle2,
  Maximize2,
  Pencil,
  StickyNote,
  Trash2,
  TrendingDown,
  TrendingUp,
  User as UserIcon,
  X,
} from 'lucide-react';
import { formatMoney } from '@/lib/format';

type IconEntry = { name: string; Icon: ComponentType<{ className?: string }> };

export interface TxDetail {
  id: string;
  amount: number | string;
  type: 'INCOME' | 'EXPENSE';
  note?: string;
  date: string;
  imageUrl?: string;
  category: { name: string; icon?: string; imageUrl?: string };
  user: { fullName: string; avatar?: string };
}

interface Props {
  tx: TxDetail;
  icons: IconEntry[]; // truyền LUCIDE_ICONS vào
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onZoomImage: (url: string) => void;
}

function CategoryIcon({ category, icons }: { category: TxDetail['category']; icons: IconEntry[] }) {
  if (category.imageUrl) {
    return <Image src={category.imageUrl} alt={category.name} fill sizes="64px" className="object-cover" />;
  }
  const Lucide = icons.find((i) => i.name === category.icon)?.Icon;
  if (Lucide) return <Lucide className="h-8 w-8" />;
  // icon là emoji → hiện emoji; là tên chữ (vd "Coins") không khớp → hiện chữ cái đầu
  const isWord = !category.icon || /^[A-Za-z]+$/.test(category.icon);
  return <span className="text-3xl font-black">{isWord ? category.name.charAt(0) : category.icon}</span>;
}

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300">
        {icon}
      </span>
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <div className="ml-auto min-w-0 text-right text-sm font-bold text-slate-800 dark:text-slate-100">{children}</div>
    </div>
  );
}

export default function TransactionDetailModal({ tx, icons, onClose, onEdit, onDelete, onZoomImage }: Props) {
  const isIncome = tx.type === 'INCOME';
  const grad = isIncome ? 'from-emerald-500 to-teal-500' : 'from-rose-500 to-pink-500';

  return (
    <div
      className="animate-fadeIn fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER: màu theo thu / chi */}
        <div className={`relative bg-gradient-to-br ${grad} px-6 pb-10 pt-5 text-center text-white`}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 transition-colors hover:bg-white/30"
          >
            <X className="h-4 w-4" />
          </button>

          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">Chi tiết giao dịch</p>

          <div className="relative mx-auto mt-4 grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-white text-purple-600 shadow-lg ring-4 ring-white/30">
            <CategoryIcon category={tx.category} icons={icons} />
          </div>

          <p className="mt-3 text-sm font-semibold text-white/90">{tx.category.name}</p>
          <h2 className="mt-1 text-4xl font-black tracking-tight">
            {isIncome ? '+' : '-'}
            {formatMoney(tx.amount)}
            <span className="ml-1 text-2xl font-extrabold text-white/80">đ</span>
          </h2>

          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
            {isIncome ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {isIncome ? 'Khoản thu' : 'Khoản chi'}
          </span>
        </div>

        {/* BODY: bo cong đè lên header */}
        <div className="relative -mt-5 space-y-5 rounded-t-3xl bg-white p-5 dark:bg-slate-900">
          <div className="divide-y divide-slate-200/70 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 dark:divide-slate-700/60 dark:border-slate-800 dark:bg-slate-800/50">
            <Row icon={<CalendarDays className="h-4 w-4" />} label="Thời gian">
              <span className="capitalize">{format(new Date(tx.date), 'EEEE, dd/MM/yyyy', { locale: vi })}</span>
            </Row>
            <Row icon={<UserIcon className="h-4 w-4" />} label="Người tạo">
              {tx.user.fullName}
            </Row>
            {tx.note && (
              <Row icon={<StickyNote className="h-4 w-4" />} label="Ghi chú">
                <span className="line-clamp-3 break-words">{tx.note}</span>
              </Row>
            )}
            <Row icon={<CheckCircle2 className="h-4 w-4" />} label="Trạng thái">
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                Thành công
              </span>
            </Row>
          </div>

          {tx.imageUrl && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Chứng từ đính kèm
              </p>
              <button
                type="button"
                onClick={() => onZoomImage(tx.imageUrl!)}
                className="group relative block h-44 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
              >
                {/* object-contain: thấy trọn ảnh, không bị cắt */}
                <Image src={tx.imageUrl} alt="Chứng từ" fill sizes="448px" className="object-contain" />
                <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors group-hover:bg-black/80">
                  <Maximize2 className="h-3 w-3" /> Phóng to
                </span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 py-3.5 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
            >
              <Trash2 className="h-4 w-4" /> Xóa
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/30 transition-all active:scale-95"
            >
              <Pencil className="h-4 w-4" /> Chỉnh sửa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
