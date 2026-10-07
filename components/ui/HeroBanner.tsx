'use client';

import React from 'react';
import Image from 'next/image';

export interface HeroBannerProps {
  /** Tên hiển thị chính (vd: "Gia đình nhỏ", "Danh mục tài chính") */
  title?: string;
  /** Lời chào phía trên title (vd: "Xin chào", "Sổ thu chi gia đình") */
  greeting?: string;
  /** Biểu tượng cảm xúc sau tiêu đề (vd: "👋", "💖") */
  emoji?: string;
  /** Đoạn văn bản mô tả ngắn phía dưới */
  description?: string;
  /** Badge nhỏ nằm trên cùng (nếu muốn hiển thị) */
  badgeText?: string;
  /** Ảnh banner cho chế độ Light mode */
  bannerDay?: string;
  /** Ảnh banner cho chế độ Dark mode (nếu không truyền sẽ dùng bannerDay) */
  bannerNight?: string;
  /** Custom thêm class CSS cho container ngoài cùng (chỉnh height, margin...) */
  className?: string;
  /** Slot chứa các nút action (ví dụ: Nút "Tạo giao dịch", "Thêm danh mục") */
  actionSlot?: React.ReactNode;
  /** Slot chứa các thẻ thống kê đè lên đáy banner */
  children?: React.ReactNode;
}

export default function HeroBanner({
  title = 'Gia đình nhỏ',
  greeting = 'Xin chào',
  emoji = '👋',
  description = 'Cùng quản lý tài chính, xây dựng những kế hoạch lớn cho tương lai 💜',
  badgeText,
  bannerDay = '/images/banner_home_day.png',
  bannerNight = '/images/banner_home_night.png',
  className = '',
  actionSlot,
  children,
}: HeroBannerProps) {
  return (
    // Full-bleed layout với chiều cao giới hạn chuẩn mực (h-64 sm:h-72 lg:h-[280px])
    <section
      className={`relative -mx-4 -mt-[72px] h-68 sm:h-72 lg:-mx-6 lg:h-[280px] ${className}`}
    >
      {/* 1. LỚP NỀN HÌNH ẢNH + OVERLAY CHE MỜ */}
      <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)] overflow-hidden">
        {/* Banner Light Mode */}
        <Image
          src={bannerDay}
          alt={title}
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-right dark:hidden"
        />

        {/* Banner Dark Mode */}
        <Image
          src={bannerNight || bannerDay}
          alt={title}
          fill
          unoptimized
          sizes="100vw"
          className="hidden object-cover object-right dark:block"
        />

        {/* Overlay mờ dịu từ trái sang phải */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-50/95 via-white/60 to-transparent dark:from-slate-950/95 dark:via-slate-950/50" />
      </div>

      {/* 2. KHỐI NỘI DUNG CHÍNH (TEXT & ACTIONS) */}
      <div className="relative z-10 flex h-full flex-col justify-between px-4 pb-12 pt-20 sm:px-6 lg:pb-14 lg:pt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-0.5 max-w-xl">
            {/* Badge Tùy chọn */}
            {badgeText && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold text-purple-700 dark:text-purple-300 shadow-xs border border-white/50 dark:border-slate-700 mb-1">
                <span>{badgeText}</span>
              </div>
            )}

            {/* Greeting */}
            {greeting && (
              <p className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-200">
                {greeting}
              </p>
            )}

            {/* Title Gradient */}
            <h1 className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 bg-clip-text text-2xl font-black leading-tight text-transparent sm:text-3xl lg:text-4xl">
              {title} {emoji && <span className="text-2xl sm:text-3xl">{emoji}</span>}
            </h1>

            {/* Description */}
            {description && (
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-md line-clamp-1 sm:line-clamp-none">
                {description}
              </p>
            )}
          </div>

          {/* Action Slot (Nút bấm bên phải banner) */}
          {actionSlot && <div className="shrink-0 self-start sm:self-end">{actionSlot}</div>}
        </div>

        {/* Children Slot (Dành cho StatCards đè đè lên chân banner) */}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </section>
  );
}
